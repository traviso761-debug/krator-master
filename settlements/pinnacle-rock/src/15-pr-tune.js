// ================================================================= PINNACLE ROCK — the Beast Riders' table (S4, S7)
// [G data] core/simulation/PROPOSAL-LONGSONG-PINNACLE.md phases S4 and S7 (the owner, 2026-11-11). The culture table of the
// Beast Riders as Pinnacle Rock and its bands live it, read by core/camp (50-camp-beasts.js: the beasts' rules; 60: the
// world tick) and core/region's valley host (50-region-valley.js), as Longsong's table (settlements/longsong/src/15-ls-tune.js)
// is read:
//   PR_TUNE.beasts     every mount kind of kits/beast-riders BR_CAMP (one row a tribe: its `beast`, its size) and the kept
//                      herd: body mass, diet, pack and pace; the appetite by diet (kg a day per kg^0.75: a predator of a
//                      raptor's 300 kg eats ~4 kg of meat a day); and the owner's LOW-GRAVITY PAYOFF: every appetite cut by
//                      a third (lowG 2/3: the raptor's ~4 kg is ~2.7). The meat-eaters eat both the wild hunt and the kept
//                      herds (the owner's answer 3): `meatFrom`. The kept herd's species is not named in the lore yet: it is
//                      a jungle browser of ~80 kg here, a row to rename when it is
var PR_TUNE=(function(){'use strict';
const T={};
T.beasts={lowG:2/3,
 appetite:{meat:.055,graze:.12,litter:.08,browse:.11},
 eats:{meat:'meat',graze:'fodder',litter:'fodder',browse:'fodder'},
 graze:['graze','litter','browse'],
 meatFrom:{hunt:.5,herd:.5},
 /* mass (kg) from BR_CAMP's size (length, height) and the animal it is; pack: kg carried besides the rider (the grazers and
    the crawler are the bands' draught and pack beasts); pace: km a day on a road, with rests */
 rows:{
  raptor:{beast:'ridge-raptor',mass:300,diet:'meat',pack:40,pace:45,mount:true},
  tiger:{beast:'arena-tiger',mass:420,diet:'meat',pack:40,pace:40,mount:true},
  spider:{beast:'giant-spider',mass:280,diet:'meat',pack:60,pace:30,mount:true},
  dragonfly:{beast:'giant-dragonfly',mass:70,diet:'meat',pack:10,pace:90,mount:true},
  quetzal:{beast:'quetzalcoatlus',mass:250,diet:'meat',pack:30,pace:120,mount:true},
  wingclaw:{beast:'giant-archaeopteryx',mass:180,diet:'meat',pack:25,pace:110,mount:true},
  nightwing:{beast:'giant-bat',mass:45,diet:'meat',pack:8,pace:100,mount:true},
  threehorn:{beast:'tricorn',mass:2000,diet:'graze',pack:350,pace:22,mount:true},
  hardshell:{beast:null,mass:1500,diet:'graze',pack:260,pace:15,mount:true},
  mammoth:{beast:null,mass:6000,diet:'graze',pack:900,pace:25,mount:true},
  staghorn:{beast:'staghorn-beetle',mass:250,diet:'litter',pack:120,pace:25,mount:true},
  longcrawler:{beast:'draught-millipede',mass:500,diet:'litter',pack:300,pace:20,mount:true},
  herd:{beast:null,mass:80,diet:'browse',pack:0,pace:20,offtake:.35}},
 herd:{kind:'herd'},
 /* the pack train: a draught millipede a tent (core/camp/PLAN.md section 3: 'one millipede carries a tent'), the Longcrawlers'
    own beast, which every band keeps for its loads; the Longcrawlers carry on their mounts */
 pack:{kind:'longcrawler',perTent:1}};
/* ---------------------------------------------------------------- S7: Pinnacle Rock on the sim
   PR_TUNE.goods, .diet, .calendar   the goods (kg unless named; beasts by the head: trained mounts bred for sale), what a
                      person eats a day by kind (the town, the clearings, the bands), the year: the bands HOME IN THE WET
                      SEASON (year days 120-300, the monsoon) and ranging in the dry; the monsoon crop at its end
   PR_TUNE.ring       the floor ring (src/55-pr-farms.js: six terraces of fonio, millet, pigeon pea and gourds, the paddies
                      and orchards inside the palisade, ~80 ha): one monsoon crop at ~1 t/ha, the gardens' and orchards' fruit,
                      the beetle pens' protein
   PR_TUNE.clearing   a clearing's farming household (core/hamlet's `beast-rider` row; openworld/pinnacle's plan): 1.5 ha in
                      crop at 1.2 t/ha, a sixth kept for seed; what it sells the town: most of its surplus
   PR_TUNE.home       a band's works at home (the wet season, handed over to the sim): the home range's thin hunt, the
                      gathering, the kept herd's offtake, the pens' and the home range's fodder, the young beasts bred for
                      sale, the spiders' silk; the road to the town (its trade tent) wants a granary's worth of the haul
   PR_TUNE.rules      core/camp's band rules for the dry season (60-camp-world.js RULES): the diet, the ranging hunt, the
                      gathering, the mounts' own hunting, the march
   PR_TUNE.markets    the ventures' far ends (5.1 px; the owner's answer 2): the Beast Rider cities (Talon, Fort Kreia, Mav's
                      Refuge, Fort Ordo, Girder), the coyotemen (Coyote Canyon) and the Dasri (Shade): what each buys and sells,
                      in grain at its own prices
   PR_TUNE.targets    the raids' targets: Iziz's port Goto and the contested Nusidi (core/camp 66's caps)
   PR_TUNE.slots      the dry season's ventures, one slot a band, turned each season (raids on Goto and Nusidi, the
                      cities, the two long roads); after a venture a band with a month left takes the nearest city again
   PR_TUNE.valley(P, o), PR_TUNE.world(V, o)   the valley spec for core/region's host and the bands' world for core/camp,
                      from openworld/pinnacle's plan P (the clearings) and BR_CAMP (the eighteen grounds) */
T.px=[1007,686];
T.at=function(px,py){return {x:(px-T.px[0])*2000,z:(py-T.px[1])*2000};};
T.goods={grain:{unit:'kg',crops:['fonio','millet','pigeon-pea']},meat:{unit:'kg'},fruit:{unit:'kg'},hides:{unit:'kg'},fodder:{unit:'kg'},
 salt:{unit:'kg'},iron:{unit:'kg'},cloth:{unit:'kg'},silk:{unit:'kg'},beasts:{unit:'head'}};
const D=1/365;
T.diet={town:{grain:.42,meat:.05,fruit:.04,salt:5*D},clearing:{grain:.40,fruit:.05,meat:.02,salt:4*D},band:{grain:.3,meat:.15,fruit:.1,salt:5*D},
 iziz:{grain:.45,salt:5*D}};
T.food={grain:1,meat:1.6,fruit:.5};
T.calendar={year:{yearD:365,startDay:0,solsticeDay:172},windows:{home:[120,300],harvest:[255,300],'clearing-harvest':[250,295]}};   /* the sim's year day is the world tick's (day 0 the year's first) */
T.ring={ha:80,tHa:1,crew:300,fruitT:40,fruitCrew:80,beetleT:8,beetleCrew:40};
T.clearing={inCropHa:1.5,yieldTHa:1.2,seed:1/6,sells:.9,fruitT:5};
T.home={hunt:{meat:1.5,hides:.3},huntMeat:{meat:5.5,hides:.6},gather:{fruit:3},breed:1/6,silkT:.2,graze:1.05,want:250,keep:10};
T.rules={diet:T.diet.band,food:T.food,hunt:{meat:10,hides:1},spoil:{meat:.01,fruit:.03},gather:{fruit:6},minDays:3,cross:.7,detour:1.3,siteKm:15,hours:8,roadside:1,
 marchHunt:.5,selfHunt:.4,again:30,keepTrade:{}};
T.range={n:8,r0:15000,r1:70000,cap:{meat:3500,hides:300,fruit:1800,fodder:40000},regrow:120};
const city=(px,py,name)=>Object.assign(T.at(px,py),{name,buys:{hides:4,beasts:1200,silk:40},sells:{grain:1,salt:3,iron:10,cloth:6}});
T.markets={talon:city(1026,760,'Talon'),'fort-kreia':city(1049,736,'Fort Kreia'),mavs:city(1024,807,"Mav's Refuge"),'fort-ordo':city(1060,831,'Fort Ordo'),girder:city(1039,869,'Girder'),
 'coyote-canyon':Object.assign(T.at(1265,500),{name:'Coyote Canyon (the coyotemen)',far:true,buys:{silk:70,beasts:2000,hides:4},sells:{salt:2,iron:7,grain:1.4,cloth:5}}),
 shade:Object.assign(T.at(1229,885),{name:'Shade (the Dasri)',far:true,buys:{silk:80,beasts:2200,hides:5},sells:{salt:1.5,iron:6,grain:1.5,cloth:4}})};
T.pools={grain:4e6,salt:2e5,iron:1e5,cloth:1e5};
T.escort=200;   /* grain a warrior earns a visit, guarding a market's own caravans (the proposal's escort fees) */
T.targets={goto:Object.assign(T.at(918,698),{name:'Port Goto (Iziz)',people:1200,militia:.05,walls:.2,garrison:30,food:{grain:T.diet.iziz.grain},loot:['grain','salt','iron','cloth'],fieldsT:600}),
 nusidi:Object.assign(T.at(996,870),{name:'Nusidi (contested)',people:500,militia:.08,walls:.1,garrison:15,food:{grain:T.diet.iziz.grain},loot:['grain','salt','iron','cloth'],fieldsT:240})};
T.slots=['raid:goto','raid:goto','raid:goto','raid:goto','raid:nusidi','raid:nusidi','raid:nusidi','far:coyote-canyon','far:shade','far:shade',
 'city:talon','city:talon','city:fort-kreia','city:fort-kreia','city:mavs','city:mavs','city:fort-ordo','city:girder'];
T.near=['talon','fort-kreia'];
/* the eighteen bands: every ground of BR_CAMP (the six ground tribes' upper and lower grounds, the flyers' upper, the
   Dragonfly's, Spider's and Mammoth's lower), each a band of 40-70 by core/camp's census, ids as the page's */
T.bands=function(world){const out=[];BR_CAMP_TRIBES.forEach(t=>['upper','lower'].forEach(g=>{const G=brcGround(t,g);if(!G)return;
 const id='staiytii0y:'+t+':'+g,c=KCAMP.census({id,world,culture:'beast-rider',program:G});out.push({id,tribe:t,ground:g,census:c});}));return out;};
T.valley=function(P,o){o=o||{};const K=o.scale==null?5:o.scale,yr=365,win=w=>{const W=T.calendar.windows[w];return(W[1]-W[0]+yr)%yr;};
 const rate=(kgYr,crew,days)=>kgYr/(Math.max(1,Math.round(crew/K))*K*(days==null?yr:days)*12);
 const site=P.sites.find(s=>s.id==='staiytii0y'),S=[],R=[],town='staiytii0y',world=P.world==null?1027681:P.world;
 /* THE TOWN on the mesa: 3,000 (the owner), the floor ring's fields, orchards and beetle pens; the granary first (the roads land there) */
 const ring=T.ring;
 S.push({id:town,name:'Pinnacle Rock',faction:'beast-riders',people:3000,x:0,z:0,eats:T.diet.town,keepDays:40,
  start:Object.assign({grain:Math.round(3000*T.diet.town.grain*200),meat:60000,fruit:40000,salt:6000,iron:800,cloth:1200},o.townStart||{}),
  works:[{id:'pr.granary',kind:'granary',name:'the town\'s granaries',crew:20,out:[],rate:0},
   {id:'pr.ring',kind:'farm-ring',name:'the floor ring\'s six terraces',crew:ring.crew,out:['grain'],rate:rate(ring.ha*ring.tHa*1000,ring.crew,win('harvest')),season:'harvest'},
   {id:'pr.orchards',kind:'orchard',name:'the ring\'s gardens and orchards',crew:ring.fruitCrew,out:['fruit'],rate:rate(ring.fruitT*1000,ring.fruitCrew)},
   {id:'pr.beetles',kind:'beetle-house',name:'the beetle houses',crew:ring.beetleCrew,out:['meat'],rate:rate(ring.beetleT*1000,ring.beetleCrew)}]});
 /* THE CLEARINGS (the plan's villages): their fields at the monsoon's end; most of their surplus sold to the town */
 (o.clearings===false?[]:(site.hamlets||[])).forEach(V=>{const id=V.id.replace(/\//g,'.'),C=T.clearing,hh=V.census.households,pop=V.census.pop,crew=Math.round(pop*.45);
  const made=hh*C.inCropHa*C.yieldTHa*1000*(1-C.seed),own=pop*T.diet.clearing.grain*yr,share=Math.max(0,Math.min(.9,(made-own)*C.sells/made));
  S.push({id,name:V.name,faction:'beast-riders',parent:town,people:pop,x:V.site.x,z:V.site.z,eats:T.diet.clearing,
   start:{grain:Math.round(own*165/yr),fruit:500,meat:200,salt:300},
   works:[{id:id+'.fields',kind:'farmstead',name:'the clearing\'s fields',crew:Math.round(crew*.85),out:['grain'],rate:rate(made,Math.round(crew*.85),win('clearing-harvest')),season:'clearing-harvest'},
    {id:id+'.gardens',kind:'garden',name:'the clearing\'s gardens and beetle pens',crew:Math.round(crew*.15),out:['fruit','meat'],rate:rate(C.fruitT*1000,Math.round(crew*.15))}]});
  R.push({id:'sell.'+id,from:id,to:town,minutes:Math.round(Math.hypot(V.site.x,V.site.z)/1000*12)+60,cap:40000,share:{[id]:{grain:share,fruit:.7}},goods:{[town]:['salt','cloth']}});});
 /* THE BANDS at home: each its own settlement (core/camp's hand-over lands its stock here); its works; its trade tent's road */
 const B=T.bands(world),H=T.home;
 B.forEach(b=>{const c=b.census,roles=k=>c.people.filter(p=>p.role===k).length,beasts=KCAMP.bandBeasts(T.beasts,b.tribe,c),N=KCAMP.beastNeeds(T.beasts,beasts),hd=win('home');
  const hunters=roles('hunter'),gatherers=roles('gatherer'),herders=Math.max(2,roles('herder')),works=[{id:b.id+'.stores',kind:'tent-store',name:'the band\'s stores',crew:0,out:[],rate:0}];
  const Hh=N.meat?H.huntMeat:H.hunt;   /* a meat-eaters' band hunts the wider home range for its mounts (steady hunting, home or away) */
  works.push({id:b.id+'.hunt',kind:'hunt',name:'the home range\'s hunt',crew:hunters,out:['meat','hides'],rate:rate(hunters*Hh.meat*hd,hunters,hd),season:'home'});
  works.push({id:b.id+'.gather',kind:'gathering',name:'the gathering',crew:gatherers,out:['fruit'],rate:rate(gatherers*H.gather.fruit*hd,gatherers,hd),season:'home'});
  if(beasts.herd)works.push({id:b.id+'.herd',kind:'herd',name:'the kept herd\'s offtake',crew:herders,out:['meat'],rate:rate(beasts.herd*T.beasts.rows.herd.offtake*hd,herders,hd),season:'home'});
  if(N.fodder)works.push({id:b.id+'.pasture',kind:'pasture',name:'the pens and the home range\'s grazing',crew:herders,out:['fodder'],rate:rate(N.fodder*H.graze*hd,herders,hd),season:'home'});
  works.push({id:b.id+'.breed',kind:'breaking-pen',name:'the young beasts broken for sale',crew:2,out:['beasts'],rate:rate(c.mounts*H.breed,2,hd),season:'home'});
  if(b.tribe==='spider')works.push({id:b.id+'.silk',kind:'spinning-shed',name:'the spinning shed',crew:roles('spinner')||2,out:['silk'],rate:rate(c.pop*H.silkT*1000/10,roles('spinner')||2,hd),season:'home'});
  S.push({id:b.id,name:BR_CAMP[b.tribe].name+' band ('+b.ground+' ground)',faction:'beast-riders',parent:town,people:c.pop,x:0,z:0,eats:T.diet.band,feeds:N,keepDays:H.keep,start:{},works,band:b,
   reserve:{grain:Math.round(c.pop*T.diet.band.grain*(hd+5)),salt:Math.round(c.pop*T.diet.band.salt*(hd+5)),meat:Math.round(((N.meat||0)*(1-T.beasts.meatFrom.herd)+c.pop*T.diet.band.meat)*(hd+5))}});   /* the band's own home season (its people's grain and salt, its mounts' meat less the herd's), never sent to the town */
  R.push({id:'home.'+b.id,from:b.id,to:town,minutes:45,cap:60000,want:H.want,keep:H.keep,goods:{[b.id]:['grain','meat','fruit','hides','salt','iron','cloth','silk','beasts'],[town]:[]}});});
 /* THE MARKETS (off the map: core/camp's caravans trade there) and THE TARGETS (Iziz's: the raids take from their books) */
 Object.keys(T.markets).forEach(m=>{const M=T.markets[m];S.push({id:m,name:M.name,faction:M.far?'far':'beast-riders',people:0,x:M.x,z:M.z,eats:{},keepDays:0,start:Object.assign({},T.pools),
  works:[{id:m+'.market',kind:'market',name:'the market',crew:0,out:[],rate:0}]});});
 Object.keys(T.targets).forEach(m=>{const Tg=T.targets[m],crew=Math.round(Tg.people*.4);S.push({id:m,name:Tg.name,faction:'iziz',people:Tg.people,x:Tg.x,z:Tg.z,eats:T.diet.iziz,
  start:{grain:Math.round(Tg.people*T.diet.iziz.grain*200),salt:Tg.people*4,iron:Tg.people,cloth:Tg.people*2},
  works:[{id:m+'.fields',kind:'farmstead',name:'the fields',crew,out:['grain'],rate:rate(Tg.fieldsT*1000,crew,win('harvest')),season:'harvest'}]});});
 /* the intermediaries (everything else: the far market off the map at a mark-up, the isle demo's foreign ships' rule) */
 S.push({id:'intermediaries',name:'The intermediaries (off the map)',faction:'far',people:0,x:0,z:-900000,eats:{},keepDays:0,start:Object.assign({},T.pools),works:[{id:'int.market',kind:'market',name:'the factors',crew:0,out:[],rate:0}]});
 R.push({id:'intermediaries',from:town,to:'intermediaries',minutes:30*1440,cap:8000,keep:60,want:120,goods:{[town]:['hides'],intermediaries:['salt','iron','cloth']},expect:{intermediaries:{hides:2},[town]:{salt:30,iron:2,cloth:3}}});
 return {seed:20261111,scale:K,start:0,calendar:T.calendar,goods:T.goods,food:T.food,
  factions:[{id:'beast-riders',name:'The Beast Riders'},{id:'iziz',name:'The Empire of Iziz'},{id:'far',name:'The far markets'}],
  relations:[{a:'beast-riders',b:'far',stance:'friendly'},{a:'far',b:'beast-riders',stance:'friendly'},{a:'beast-riders',b:'iziz',stance:'hostile'},{a:'iziz',b:'beast-riders',stance:'hostile'}],
  settlements:S,roads:R,bands:B};};
/* the bands' world (core/camp): their ranges (eight sites each in its sector, 15-70 km out), the markets and the targets as
   places, the ventures, the culture's assign (the slots turned each season). V the valley spec, host the sim's adapter */
T.world=function(V,host,o){o=o||{};const world=1027681,Rg=T.range,sites=[],bands=[],place={};
 V.bands.forEach((b,i)=>{const range=[];for(let k=0;k<Rg.n;k++){const a=(i+(k+.5)/Rg.n)/V.bands.length*2*Math.PI,r=Rg.r0+(Rg.r1-Rg.r0)*KCAMP.u(world,b.id,k,'site r'),sid=b.id+':site:'+k;
   range.push(sid);sites.push({id:sid,band:b.id,x:Math.sin(a)*r,z:-Math.cos(a)*r,kind:'jungle',cap:Object.assign({},Rg.cap),regrow:Rg.regrow});}
  const c=b.census,Sd=V.settlements.find(s=>s.id===b.id);place[b.id]={x:0,z:0,name:Sd.name};
  bands.push({id:b.id,tribe:b.tribe,mountKind:b.tribe,home:{settlement:b.id,x:0,z:0},people:c.pop,warriors:Math.round(c.riders*.6),beasts:KCAMP.bandBeasts(T.beasts,b.tribe,c),
   roles:{hunter:c.people.filter(p=>p.role==='hunter').length,gatherer:c.people.filter(p=>p.role==='gatherer').length},range,i,
   stock:Object.assign({grain:Math.round(c.pop*T.diet.band.grain*130),meat:300,hides:400,beasts:Math.round(c.mounts*T.home.breed),salt:c.pop*2},b.tribe==='spider'?{silk:c.pop*T.home.silkT*10}:{})});});
 Object.keys(T.markets).forEach(m=>place[m]=T.markets[m]);Object.keys(T.targets).forEach(m=>place[m]=T.targets[m]);
 const want=(W,b)=>{const need=b.people*T.diet.band.grain*365,share=o.share==null?24000:o.share;
  return [{good:'salt',n:Math.max(0,b.people*8-(b.stock.salt||0))},{good:'grain',n:Math.max(0,need+share-(b.stock.grain||0))},{good:'iron',n:Math.max(0,b.people*1.5-(b.stock.iron||0))},{good:'cloth',n:Math.max(0,b.people*1-(b.stock.cloth||0))}];};
 const caravan=KCAMP.caravan({markets:T.markets,offer:['hides','beasts','silk'],want,work:3,escort:T.escort});
 const raids=KCAMP.raids({targets:T.targets,caps:o.caps,warShare:.6});
 const assign=o.assign||((W,b,d)=>{const s=KCAMP.raidSeason(W,d),trip=b.trips||0;
  if(trip>0)return{kind:'caravan',to:T.near[(b.i+trip)%T.near.length]};
  const n=T.slots.length,sl=T.slots[(((b.i+s*7)%n)+n)%n].split(':');
  return sl[0]==='raid'?{kind:'raid',to:sl[1],party:sl[1]+':'+s}:{kind:'caravan',to:sl[1]};});
 return KCAMP.world({world,cal:{yearD:365,home:T.calendar.windows.home},beasts:T.beasts,rules:Object.assign({},T.rules,o.rules||{}),host,graph:o.graph||null,place,sites,bands,
  ventures:{caravan,raid:raids},assign,dayHooks:[raids.hook]});};
return T;})();
