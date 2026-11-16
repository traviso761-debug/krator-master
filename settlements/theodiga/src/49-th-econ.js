/* ================================================================= THEODIGA TODAY: the economy on core/simulation (records; draws nothing)
   [G data] T-econ-1 and T-econ-2 (the owner, 2026-11-16: "Yes, the economy"; then the caravans, the next step of the build).
   Theodiga's settlement (src/47-th-sim.js) keeps its own economy (core/simulation 77-sim-6-economy.js keyed by settlement,
   77-sim-6-items.js for the households' food and the workers' tools; settlements/isle-demo's 44 and 43 are the worked examples;
   SCHEMA.md "The books"). Units: servings for food, lots for the rest. The goods carry the region's names
   (core/region/data/xan-tune.js on the open-world line: the Salvagers' scrap, the bore's rarities, the smelter's iron).
     THE GOODS     the fields' grain, pulse and tubers (each field its crop, kits/crops' buckets); the dairies' milk and the hives'
                   honey (the sacraments: "honey-dew" and "the milk of Paradise"); the arcology's bread; the yards' scrap,
                   the Dome's fallen white panels; the bore's rarities, the Rare Devisers' licence; the smelter's iron; the
                   churns' butter the Lamp Hall burns; and from the East Gate road the tea the town drinks, the charcoal the
                   smelter burns and the garments the town wears
     THE MAKERS    each field (a worker-hour's servings), each farmstead (milk, honey or the churn, by turns: `FARM`), each
                   yard (scrap, drawn from the Dome's fall: a site that runs down, nothing grows back), the bore (rarities,
                   from a site with no end), each arcology kitchen (bread in batches of grain), the Salvagers' smelter at the
                   yard with the most hands (scrap and charcoal to iron, in batches), each churn (milk to butter, in batches)
     THE LAMPS     T-econ-3 (the open-world session relayed "what's still owed", 2026-11-16): the Lamp Hall's keepers tend
                   "butter lamps by the thousand"; the butter burns by the worked hour, as core's tools wear (a keeper's
                   'lamp butter', a crock of `lamp.pats` pats lasting `lamp.hours` worked hours, about a keeper's day, so
                   the abstract day, which replaces a tool once, burns what a watched day does), drawn again at the Hall's
                   own store-room from the town's butter. The churns are sized to the pats the keepers' schedules burn, the dairies to the churns' milk
     THE CLOTHES   every resident (not the pilgrims, not the caravaneers) wears a robe that wears out in `robeLife` days
                   (core's clothing: one set kept); worn out, a new one is bought at the bazaar's stalls from the town's
                   garments, which the East Gate road brings as it brings the tea
     THE RARITIES  the bore's finds are the Rare Devisers' licence, never sold in the town (export false): the Devisers send
                   them to their factor house at Erehwon. With the road's port they ride with each caravan as it leaves
                   (its own cargo apart); without it the Devisers' own mules take them each morning at `factor.hour`.
                   TH_ECON.tick(SIM) after each SIM.step does it (core has no hook for a world's own flows): taken from the
                   bore's store and the warehouses, booked exported, so the books still balance
     THE STORES    the town's storehouses, granaries and the serai are its warehouses, opened with `startDays` of food at the
                   town's meals; the carters (driven actors, one at each warehouse in turn) haul the makers' stores to them
     THE TABLE     a household keeps a store of food bought at the bazaar's stalls (its foods in proportion to the warehouses);
                   the arcology's homes, the hostels and the Devisers' lodge are messes fed from the warehouses; the hostels
                   sell a meal out
     THE TOOLS     every field hand, yard hand, dairyman and bore hand owns an iron tool that wears by the worked hour, bought
                   again at the bazaar from the town's iron: the iron's use, so the caravans may buy what is over
     THE CARAVANS  when the tea or the charcoal runs under `imports.days`, the serai sends for a lot by the East Gate road: a
                   caravan (a group of caravaneers, core's SIM.fire itinerary) comes in by the road's port at the town's east
                   edge, walks to the serai, unloads, stays its hours, and leaving buys the good the town has most days of
                   (scrap or iron: its surplus, never its food) as much as it carries. Without the port (a page or test with no
                   walk graph) the lot comes by the route's timer and nothing goes out
   The money is src/49m-th-money.js (the qud, T-money-1), on these makers, shops and purchases.
   TH_ECON.declare(SIM, o) -> {goods, warehouses, makers:{kind: n}, carts, shops, messes, stores, rates, tools, robes, keepers,
     lampDay, factor, snap}
     o.fields [{id, crop|bucket}]; o.rates (the tune below); o.carts (16); o.port {x, y, z, node}: the East Gate road's end
   TH_ECON.tick(SIM, X?) after each SIM.step: the Devisers' consignments (X: the declare's result, else the last declared) */
var TH_ECON=(function(){
 const FOODS=['grain','pulse','tuber','milk','honey','bread'],BROUGHT=['tea'],OTHER=['scrap','rarities','iron','charcoal','butter','garments'];
 /* the farmsteads by turns: three dairies, two hives, a churn (by id order) */
 const FARM=['milk','honey','milk','honey','milk','churn'];
 let LAST=null;
 /* the tune: the diet's shares (servings eaten; the tea brought), the surplus the makers are sized to, a worker's hours a day; the
    yards' and the bore's rates (a worker-hour's lots); `field` the rate of a kind no one was dealt to; the tools' life (worked
    hours); the road's lots and minutes */
 /* (`surplus` 1.5: on the page the people walk to their work and lose part of the hours the abstract level counts; at 1.25
    a week on the page ran the grain down to 0.6 days, at 1.5 the warehouses hold over nine days) */
 const TUNE={diet:{grain:.24,pulse:.14,tuber:.14,milk:.19,honey:.09,bread:.14,tea:.06},surplus:1.5,hours:9,field:3,yard:1.5,bore:.08,
  bake:{in:{grain:3},out:{bread:8},hours:2},smelt:{in:{scrap:4,charcoal:1},out:{iron:1},hours:3},toolLife:800,ironSurplus:1.6,
  churn:{in:{milk:6},out:{butter:1},hours:1},lamp:{hours:4,pats:4},robeLife:240,garmentDays:30,factor:{hour:7,keep:0},
  cap:{field:600,farmstead:400,yard:2000,bore:200,'arc-kitchen':400,smelter:400,churn:300},startDays:3,storeDays:[2,4],carts:16,dome:60000,stockpile:{scrap:400,iron:20},
  road:{minutes:600,tea:3000,charcoal:600,charStart:300,garments:400,cap:800,size:[2,6],per:2,mins:180,speed:1},
  items:{meals:2,perMeal:2,low:2,days:3,mins:15,cool:120,secPerMinute:18}};
 const TOOLED={field:1,yard:1,farmstead:1,bore:1};
 /* a person's worked hours a day, by its schedule (its first day's) */
 const workHours=(SIM,a)=>{const S=SIM.schedOf?SIM.schedOf(a,0):null;let n=0;if(S)for(let h=0;h<24;h++)if(S[h]==='WORK')n++;return n;};
 const U=(a,b)=>KRAND.unit(KRAND.hash(2219,a,b));
 function declare(SIM,o){o=o||{};const T=Object.assign({},TUNE,o.rates||{}),s='theodiga',EATEN=FOODS.concat(BROUGHT),
  out={goods:EATEN.concat(OTHER),warehouses:0,makers:{},carts:0,shops:0,messes:0,stores:0,tools:0};
  const mine=SIM.all('place').filter(P=>P.settlement===s);
  /* the foods as item kinds (the households buy and eat them), a meal out, the iron tool */
  if(!SIM.ITEMS){const kinds={meal:{cat:'food'},'iron tool':{cat:'tool',workLife:T.toolLife,good:'iron',per:1},
    'lamp butter':{cat:'tool',workLife:T.lamp.hours,good:'butter',per:T.lamp.pats},robe:{cat:'clothing',slot:'torso',life:T.robeLife,good:'garments',per:1}};EATEN.forEach(f=>{kinds[f]={cat:'food',food:true};});
   SIM.items(Object.assign({kinds,free:['SOCIALIZE','TRADE','IDLE','REST'],retry:60},T.items));}
  /* the road: its port (the East Gate road's end), its caravaneers, their org */
  const serai=mine.find(P=>P.kind==='serai'),R=T.road,port=o.port&&serai?'th.port.east':null;
  SIM.load({orgs:[{id:'caravans',faction:'xanadu',name:'The caravans of the East Gate road',resident:false}],
   roles:[{id:'caravaneer',org:'caravans',name:'a caravaneer of the East Gate road',sched:[[0,'TRADE']],transient:true}],
   ports:port?[{id:port,x:o.port.x,y:o.port.y,z:o.port.z,node:o.port.node,kind:'road',layer:'pedestrian'}]:[]});
  const goods={};EATEN.forEach(g=>{goods[g]={unit:'serving',export:false};});OTHER.forEach(g=>{goods[g]={unit:'lot'};});
  goods.tea.import={route:'east-road',lot:R.tea};goods.charcoal.import={route:'east-road',lot:R.charcoal};goods.charcoal.export=false;goods.rarities.export=false;
  goods.garments.import={route:'east-road',lot:R.garments};goods.garments.export=false;goods.butter.export=false;
  const E=SIM.economy({goods,inputs:{},every:60,window:2,cart:{cap:300,load:20,unload:20,minLoad:20},imports:{days:3,scan:60},meal:{per:T.items.perMeal,foods:EATEN.slice()},useShort:true,
   routes:{'east-road':{port,minutes:R.minutes}},exports:{minDays:3,made:true,days:3},
   carriers:port?{'east-road':{kind:'caravan',org:'caravans',from:[port],unit:[{role:'caravaneer',n:R.per}],size:R.size,cap:R.cap,layer:'pedestrian',mode:'walk',speed:R.speed,at:serai.id,activity:'TRADE',mins:R.mins}}:{}},{settlement:s});
  /* the warehouses: the storehouses, granaries and serai */
  for(const P of mine)if(P.kind==='store'||P.kind==='granary'||P.kind==='serai'){SIM.store(P.id,{kind:'warehouse'});out.warehouses++;}
  /* the sites: the Dome's fall (the yards' scrap, running down) and the bore (no end) */
  SIM.site({id:'th.site.dome-fall',settlement:s,kind:'dome-fall',goods:['scrap'],grade:'medium',amount:T.dome,regen:0,yield:1});
  SIM.site({id:'th.site.bore',settlement:s,kind:'bore',goods:['rarities'],grade:'rich',yield:1});
  const crop={};for(const F of o.fields||[]){const b=F.bucket||F.crop;crop['th.field.'+F.id]=FOODS.indexOf(b)>=0?b:'grain';}
  const mk=k=>{out.makers[k]=(out.makers[k]||0)+1;};
  /* THE YIELDS, sized to the people: each food a share of the town's diet (`T.diet`, servings eaten), and each kind of maker the
     rate that, with the workers populate dealt it (their worked hours a day), makes its food's share of the town's meals and
     `T.surplus` more (the bread's grain on the grain fields). A field grows its own crop (kits/crops' bucket); a farmstead is a
     dairy, a hive or a churn by turns (`FARM`; a recipe of both makes only the one with fewer days left: it made only milk), the
     dairies' share with the churns' milk in it. The smelter is the yard with the most hands, sized to make `ironSurplus` times
     the iron the tools wear through */
  const pop0=SIM.all('actor').filter(a=>!a.driven&&SIM.settlementOf(a)===s).length,need0=pop0*T.items.meals*T.items.perMeal;
  let fi=0;const role={};for(const P of mine)if(P.kind==='farmstead')role[P.id]=FARM[(fi++)%FARM.length];
  /* the Lamp Hall and its keepers: each holds its butter as a tool, worn by the worked hour; the pats burnt a day by their
     schedules (`lampDay`) size the churns, the churns' milk the dairies */
  const lamp=mine.find(P=>P.kind==='dome'&&/Lamp Hall/.test(P.name||''))||null;let lampDay=0;out.keepers=0;
  if(lamp)SIM.all('actor').forEach((a,i)=>{if(a.work!==lamp.id||a.driven)return;a.tool={k:'lamp butter',w:U(i,13)*.999};out.keepers++;lampDay+=workHours(SIM,a)/T.lamp.hours*T.lamp.pats;});
  out.lampDay=Math.round(lampDay*10)/10;
  /* the smelter: the yard the census dealt the most hands (ties by id; the first by id had none) */
  const hands={};for(const a of SIM.all('actor')){const P=a.work&&SIM.R.place[a.work];if(P&&P.kind==='yard'&&P.settlement===s)hands[P.id]=(hands[P.id]||0)+1;}
  const smelter=mine.filter(P=>P.kind==='yard'&&hands[P.id]>0).sort((a,b)=>(hands[b.id]-hands[a.id])||(a.id<b.id?-1:1))[0]||null;
  const kindOf=P=>P===smelter?'smelter':P.kind==='field'?'field:'+(crop[P.id]||'grain'):P.kind==='farmstead'?'farm:'+role[P.id]:P.kind;
  const workers={};let tooled=0;
  for(const a of SIM.all('actor')){const P=a.work&&SIM.R.place[a.work];if(P&&P.settlement===s){const k=kindOf(P);workers[k]=(workers[k]||0)+1;if(TOOLED[P.kind])tooled++;}}
  const D=T.diet,breadGrain=D.bread*T.bake.in.grain/T.bake.out.bread;
  const churnMilk=need0>0?lampDay*T.churn.in.milk/T.churn.out.butter/need0:0;
  const want={'field:grain':D.grain+breadGrain,'field:pulse':D.pulse,'field:tuber':D.tuber,'farm:milk':D.milk+churnMilk,'farm:honey':D.honey};
  const rateOf=k=>workers[k]?Math.round(need0*want[k]*T.surplus/(workers[k]*T.hours)*100)/100:T.field;
  out.rates={};
  /* the bread: the kitchens' batches sized the same way (a batch's hours from the kitchens' workers and the bread wanted) */
  const kw=workers['arc-kitchen']||0,bake=Object.assign({},T.bake);
  if(kw&&!(o.rates&&o.rates.bake))bake.hours=Math.max(.5,Math.round(kw*T.hours*T.bake.out.bread/(need0*D.bread*T.surplus)*100)/100);out.rates.bake=bake.hours;
  /* the iron: the tools worn a day (the tooled workers' hours over a tool's life) times `ironSurplus`, from the smelter's workers */
  const sw=workers.smelter||0,smelt=Object.assign({},T.smelt),ironDay=tooled*T.hours/T.toolLife*T.ironSurplus;
  if(sw&&ironDay>0&&!(o.rates&&o.rates.smelt))smelt.hours=Math.max(.5,Math.round(sw*T.hours*smelt.out.iron/ironDay*100)/100);out.rates.smelt=smelt.hours;
  /* the butter: the churns' batches sized to the pats the Lamp Hall burns, `surplus` over */
  const cw=workers['farm:churn']||0,churn=Object.assign({},T.churn);
  if(cw&&lampDay>0&&!(o.rates&&o.rates.churn))churn.hours=Math.max(.25,Math.round(cw*T.hours*churn.out.butter/(lampDay*T.surplus)*100)/100);out.rates.churn=churn.hours;
  for(const P of mine){if(!(P.activities&&P.activities.WORK))continue;
   if(P===smelter){SIM.recipe(P.id,{batch:smelt,cap:T.cap.smelter});mk('smelter');}
   else if(P.kind==='field'){const k=kindOf(P);SIM.recipe(P.id,{out:[crop[P.id]||'grain'],rate:rateOf(k),cap:T.cap.field});out.rates[k]=rateOf(k);mk('field');}
   else if(P.kind==='farmstead'&&role[P.id]==='churn'){SIM.recipe(P.id,{batch:churn,cap:T.cap.churn});mk('churn');}
   else if(P.kind==='farmstead'){const k=kindOf(P);SIM.recipe(P.id,{out:[role[P.id]],rate:rateOf(k),cap:T.cap.farmstead});out.rates[k]=rateOf(k);mk(role[P.id]==='honey'?'hive':'dairy');}
   else if(P.kind==='yard'){SIM.recipe(P.id,{out:['scrap'],rate:T.yard,cap:T.cap.yard,site:'th.site.dome-fall'});mk('yard');}
   else if(P.kind==='bore'){SIM.recipe(P.id,{out:['rarities'],rate:T.bore,cap:T.cap.bore,site:'th.site.bore'});mk('bore');}
   else if(P.kind==='arc-kitchen'){SIM.recipe(P.id,{batch:bake,cap:T.cap['arc-kitchen']});mk('arc-kitchen');}}
  /* the stalls sell the town's food, the tea and the iron tools; the hostels a meal out */
  /* (a seller needs room to buy at, its BUY slots: without them an errand finds no seller and the household goes without) */
  for(const P of mine){if(P.kind==='bazaar'){SIM.shop(P.id,EATEN.concat(['iron tool','robe']));P.activities.BUY=Math.max(P.activities.BUY||0,60);out.shops++;}
   else if(P.kind==='hostel'){SIM.shop(P.id,['meal']);P.activities.BUY=Math.max(P.activities.BUY||0,40);out.shops++;}}
  /* the Lamp Hall's store-room: its keepers' butter */
  if(lamp){SIM.shop(lamp.id,['lamp butter']);lamp.activities.BUY=Math.max(lamp.activities.BUY||0,20);out.shops++;}
  /* the tools: every worker of a tooled kind owns one, at a hashed wear */
  SIM.all('actor').forEach((a,i)=>{const P=a.work&&SIM.R.place[a.work];if(!P||P.settlement!==s||!TOOLED[P.kind])return;a.tool={k:'iron tool',w:U(i,9)*.999};out.tools++;});
  /* the clothes: every resident wears a robe at a hashed wear and keeps one set (the pilgrims and the caravaneers travel in their own) */
  out.robes=0;SIM.all('actor').forEach((a,i)=>{if(a.driven||a.transient||SIM.settlementOf(a)!==s||/pilgrim|caravan/.test(a.role||''))return;
   a.wears=['robe'];SIM.equip(a,'robe',U(i,11)*.999);out.robes++;});
  const robeDay=out.robes/T.robeLife;
  /* the messes: the arcology's homes, the hostels, the Devisers' lodge */
  for(const P of mine)if(/^arc:/.test(P.kind)||P.kind==='hostel'||P.kind==='home:bore'){P.mess=true;out.messes++;}
  /* every other home a store of food, `storeDays` of its people's meals in two or three foods (a hash) */
  const people={};for(const a of SIM.all('actor'))if(a.home&&!a.driven)people[a.home]=(people[a.home]||0)+1;
  const per=T.items.meals*T.items.perMeal,rawFoods=['grain','pulse','tuber','milk','honey'];
  mine.forEach((P,i)=>{if(P.mess||!people[P.id]||!/^home:/.test(P.kind))return;P.people=people[P.id];
   const days=T.storeDays[0]+(T.storeDays[1]-T.storeDays[0])*U(i,1),serv=Math.round(P.people*per*days),k=2+Math.floor(U(i,2)*2);P.store={};
   for(let j=0;j<k;j++){const f=rawFoods[Math.floor(U(i,3+j)*rawFoods.length)%rawFoods.length];P.store[f]=(P.store[f]||0)+Math.round(serv/k);}out.stores++;});
  /* the warehouses' opening stock: `startDays` of the town's meals in the diet's shares (the tea's too), the smelter's charcoal */
  const pop=SIM.all('actor').filter(a=>!a.driven&&SIM.settlementOf(a)===s).length,W=E.warehouses,need=pop*per*T.startDays;
  const deal=(g,n)=>{W.forEach((P,j)=>{P.stock[g]=(P.stock[g]||0)+Math.floor(n/W.length)+(j<n%W.length?1:0);});};
  /* and the Salvagers' stockpile (`stockpile`: scrap and iron), so the smelter runs from the first hour: a good no one uses yet is
     no carter's errand, so without it the yards' scrap was never hauled, the smelter waited on it and the yards filled */
  if(W.length){EATEN.forEach(g=>deal(g,Math.round(need*(g==='grain'?D.grain+breadGrain:D[g]))));deal('charcoal',R.charStart);deal('scrap',T.stockpile.scrap);deal('iron',T.stockpile.iron);
   /* the garments' `garmentDays` of robes, and two days of the lamps' butter */
   deal('garments',Math.round(robeDay*T.garmentDays));deal('butter',Math.round(lampDay*2));}
  /* the carters: driven actors, homed at the warehouses in turn */
  if(!SIM.R.role.cart)SIM.role({id:'cart',org:'town',name:'carter',sched:[[0,'HAUL']],speed:SIM.SPEED&&SIM.SPEED.cart});
  for(let c=0;c<(o.carts==null?T.carts:o.carts)&&W.length;c++){const H=W[c%W.length],a=SIM.actor({id:'th.cart'+c,role:'cart',org:'town',home:H.id,cls:'cart',job:'carters'});
   a.pos={x:H.door.x,y:H.door.y||0,z:H.door.z};SIM.cart(a);out.carts++;}
  /* the brought foods in the households' diet (core's SIM.itemsDiet, as the isles' imported rice): the tea at its share of a day's
     servings, so the tea drunk is the diet's and the road brings it */
  if(SIM.itemsDiet)SIM.itemsDiet(s,{tea:D.tea});
  if(SIM.placesChanged)SIM.placesChanged();
  /* the Devisers' consignments (tick below): by the caravans with a port, else by their own mules each morning */
  out.factor={by:port?'caravans':'mules',hour:T.factor.hour,keep:T.factor.keep,bore:mine.filter(P=>P.kind==='bore').map(P=>P.id),dwell:{},day:-1,sent:0,trips:0};
  out.people=pop;out.port=port;out.serai=serai?serai.id:null;out.snap=SIM.ledgerSnap?SIM.ledgerSnap():null;
  LAST=out;return out;}
 /* the Devisers send what the bore found (in its store and the warehouses, over `keep`) to the factor house: taken, booked
    exported, logged. With the port: when a caravan of the East Gate road ends its stay at the serai, the consignment leaves
    with it; without: each morning at `hour` */
 function consign(SIM,F,by){const s='theodiga',E=SIM.econ?SIM.econ(s):SIM.ECON;if(!E)return 0;
  const run=f=>SIM.withEcon?SIM.withEcon(s,f):f();
  return run(()=>{let have=SIM.stockOf('rarities');for(const id of F.bore){const P=SIM.R.place[id];have+=P&&P.stock?(P.stock.rarities||0):0;}
   let n=Math.floor(have-F.keep);if(n<=0)return 0;let left=n;
   for(const id of F.bore){const P=SIM.R.place[id];if(!P||!P.stock||left<=0)continue;const k=Math.min(left,P.stock.rarities||0);P.stock.rarities-=k;left-=k;}
   if(left>0)left-=SIM.economyTake('rarities',left);n-=left;if(n<=0)return 0;
   SIM.economyBook('exported','rarities',n);F.sent+=n;F.trips++;
   if(SIM.logEvent)SIM.logEvent('export',{good:'rarities',n,by,to:'the Rare Devisers\' factor house at Erehwon'});return n;});}
 function tick(SIM,X){X=X||LAST;const F=X&&X.factor;if(!F||!SIM.R.settlement||!SIM.R.settlement.theodiga)return 0;
  if(F.by==='caravans'){let n=0;const live={};
   for(const G of SIM.all('group')){if(G.org!=='caravans'||G.done)continue;if(G.phase==='dwell'){live[G.id]=1;F.dwell[G.id]=1;}}
   for(const id in F.dwell)if(!live[id]){delete F.dwell[id];n+=consign(SIM,F,id);}
   return n;}
  const m=SIM.minute(),d=Math.floor(m/1440),h=(m%1440)/60;
  if(d>F.day&&h>=F.hour){F.day=d;return consign(SIM,F,'the Devisers\' mules');}
  return 0;}
 /* the economy's state for a report: per good made, used, stock and days left; the books since the opening snapshot; the
    caravans that came and what they took */
 function report(SIM,o){const s='theodiga',inE=f=>SIM.withEcon?SIM.withEcon(s,f):f();
  const led=o&&o.snap&&SIM.ledger?SIM.ledger(o.snap,SIM.ledgerSnap(),{tol:.5}):null;
  const days={};FOODS.concat(BROUGHT,['iron','charcoal','butter','garments']).forEach(g=>{try{const d=inE(()=>SIM.economyDays(g));days[g]=d==null||!isFinite(d)?null:+d.toFixed(2);}catch(e){days[g]=null;}});
  const B=SIM.ITEMS&&SIM.ITEMS.statsBy?SIM.ITEMS.statsBy[s]:null,ER=SIM.economyReport?inE(()=>SIM.economyReport(s)):null;
  return {ok:led?led.ok:null,problems:led?led.problems.slice(0,6):[],town:led&&led.towns?led.towns[s]:null,days,meals:B&&B.meals?B.meals:null,
   blocked:SIM.blockedReport?inE(()=>SIM.blockedReport(s)):null,sites:SIM.sitesReport?SIM.sitesReport(s):null,carriers:ER&&ER.carriers?ER.carriers:null,
   fired:inE(()=>SIM.ECON?SIM.ECON.fired:0),landed:inE(()=>SIM.ECON?Object.assign({},SIM.ECON.landed):null),
   factor:o&&o.factor?{by:o.factor.by,sent:o.factor.sent,trips:o.factor.trips}:null,keepers:o?o.keepers:null,lampDay:o?o.lampDay:null,robes:o?o.robes:null,
   worn:B&&B.worn?Object.assign({},B.worn):null,bought:B&&B.bought?Object.assign({},B.bought):null};}
 return {declare,report,tick,FOODS,BROUGHT,OTHER,TUNE,FARM};
})();
