/* ================================================================= THEODIGA TODAY: the economy on core/simulation (records; draws nothing)
   [G data] T-econ-1 (the owner, 2026-11-16: "Yes, the economy"). Theodiga's settlement (src/47-th-sim.js) keeps its own economy
   (core/simulation 77-sim-6-economy.js keyed by settlement, 77-sim-6-items.js for the households' food; settlements/isle-demo's
   44 and 43 are the worked examples; SCHEMA.md "The books"). Units: servings for food, lots for the rest.
     THE GOODS     the fields' grain, pulse and tubers (each field its crop, kits/crops' buckets); the dairies' milk and the hives'
                   honey (the sacraments: "honey-dew" and "the milk of Paradise"); the arcology's bread; the yards' salvage,
                   the Dome's fallen white panels; the bore's artifacts, the Rare Devisers' licence
     THE MAKERS    each field (a worker-hour's servings), each farmstead (milk and honey), each yard (salvage, drawn from the
                   Dome's fall: a site that runs down, nothing grows back), the bore (artifacts, from a site with no end), each
                   arcology kitchen (bread in batches of grain)
     THE STORES    the town's storehouses, granaries and the serai are its warehouses, opened with `startDays` of food at the
                   town's meals; the carters (driven actors, one at each warehouse in turn) haul the makers' stores to them
     THE TABLE     a household keeps a store of food bought at the bazaar's stalls (its foods in proportion to the warehouses);
                   the arcology's homes, the hostels and the Devisers' lodge are messes fed from the warehouses; the hostels
                   sell a meal out
   What is not here yet: the caravans (the serai's trade by the East Gate road), money, tools and clothes, the Lamp Hall's butter.
   TH_ECON.declare(SIM, o) -> {goods, warehouses, makers:{kind: n}, carts, shops, messes, stores, snap (the opening ledger)}
     o.fields [{id, crop|bucket}]; o.rates (the tune below); o.carts (16) */
var TH_ECON=(function(){
 const FOODS=['grain','pulse','tuber','milk','honey','bread'],OTHER=['salvage','artifacts'];
 /* the tune: the diet's shares (servings eaten), the surplus the makers are sized to, a worker's hours a day; the yards' and the
    bore's rates (a worker-hour's lots); `field` the rate of a kind no one was dealt to */
 const TUNE={diet:{grain:.25,pulse:.15,tuber:.15,milk:.2,honey:.1,bread:.15},surplus:1.12,hours:9,field:3,yard:1.5,bore:.08,bake:{in:{grain:3},out:{bread:8},hours:2},
  cap:{field:600,farmstead:400,yard:2000,bore:200,'arc-kitchen':400},startDays:3,storeDays:[1,3],carts:16,dome:60000,
  items:{meals:2,perMeal:2,low:1,days:3,mins:15,cool:120,secPerMinute:18}};
 const U=(a,b)=>KRAND.unit(KRAND.hash(2219,a,b));
 function declare(SIM,o){o=o||{};const T=Object.assign({},TUNE,o.rates||{}),s='theodiga',out={goods:FOODS.concat(OTHER),warehouses:0,makers:{},carts:0,shops:0,messes:0,stores:0};
  const mine=SIM.all('place').filter(P=>P.settlement===s);
  /* the foods as item kinds (the households buy and eat them), a meal out */
  if(!SIM.ITEMS){const kinds={meal:{cat:'food'}};FOODS.forEach(f=>{kinds[f]={cat:'food',food:true};});
   SIM.items(Object.assign({kinds,free:['SOCIALIZE','TRADE','IDLE','REST']},T.items));}
  const goods={};FOODS.forEach(g=>{goods[g]={unit:'serving'};});OTHER.forEach(g=>{goods[g]={unit:'lot'};});
  const E=SIM.economy({goods,inputs:{},every:60,window:2,cart:{cap:300,load:20,unload:20,minLoad:20},imports:{days:3,scan:60},meal:{per:T.items.perMeal,foods:FOODS.slice()},useShort:true},{settlement:s});
  /* the warehouses */
  for(const P of mine)if(P.kind==='store'||P.kind==='granary'||P.kind==='serai'){SIM.store(P.id,{kind:'warehouse'});out.warehouses++;}
  /* the sites: the Dome's fall (the yards' salvage, running down) and the bore (no end) */
  SIM.site({id:'th.site.dome-fall',settlement:s,kind:'salvage',goods:['salvage'],grade:'medium',amount:T.dome,regen:0,yield:1});
  SIM.site({id:'th.site.bore',settlement:s,kind:'bore',goods:['artifacts'],grade:'rich',yield:1});
  const crop={};for(const F of o.fields||[]){const b=F.bucket||F.crop;crop['th.field.'+F.id]=FOODS.indexOf(b)>=0?b:'grain';}
  const mk=k=>{out.makers[k]=(out.makers[k]||0)+1;};
  /* THE YIELDS, sized to the people: each food a share of the town's diet (`T.diet`, servings eaten), and each kind of maker the
     rate that, with the workers populate dealt it (their worked hours a day), makes its food's share of the town's meals and
     `T.surplus` more (the bread's grain on the grain fields). A field grows its own crop (kits/crops' bucket); a farmstead is a
     dairy or a hive by turns (a recipe of both makes only the one with fewer days left: it made only milk) */
  const pop0=SIM.all('actor').filter(a=>!a.driven&&SIM.settlementOf(a)===s).length,need0=pop0*T.items.meals*T.items.perMeal;
  let fi=0;const role={};for(const P of mine)if(P.kind==='farmstead')role[P.id]=(fi++)%2===1?'honey':'milk';
  const kindOf=P=>P.kind==='field'?'field:'+(crop[P.id]||'grain'):P.kind==='farmstead'?'farm:'+role[P.id]:P.kind;
  const workers={};for(const a of SIM.all('actor')){const P=a.work&&SIM.R.place[a.work];if(P&&P.settlement===s){const k=kindOf(P);workers[k]=(workers[k]||0)+1;}}
  const D=T.diet,breadGrain=D.bread*T.bake.in.grain/T.bake.out.bread;
  const want={'field:grain':D.grain+breadGrain,'field:pulse':D.pulse,'field:tuber':D.tuber,'farm:milk':D.milk,'farm:honey':D.honey};
  const rateOf=k=>workers[k]?Math.round(need0*want[k]*T.surplus/(workers[k]*T.hours)*100)/100:T.field;
  out.rates={};
  /* the bread: the kitchens' batches sized the same way (a batch's hours from the kitchens' workers and the bread wanted) */
  const kw=workers['arc-kitchen']||0,bake=Object.assign({},T.bake);
  if(kw&&!(o.rates&&o.rates.bake))bake.hours=Math.max(.5,Math.round(kw*T.hours*T.bake.out.bread/(need0*D.bread*T.surplus)*100)/100);out.rates.bake=bake.hours;
  for(const P of mine){if(!(P.activities&&P.activities.WORK))continue;
   if(P.kind==='field'){const k=kindOf(P);SIM.recipe(P.id,{out:[crop[P.id]||'grain'],rate:rateOf(k),cap:T.cap.field});out.rates[k]=rateOf(k);mk('field');}
   else if(P.kind==='farmstead'){const k=kindOf(P);SIM.recipe(P.id,{out:[role[P.id]],rate:rateOf(k),cap:T.cap.farmstead});out.rates[k]=rateOf(k);mk(role[P.id]==='honey'?'hive':'dairy');}
   else if(P.kind==='yard'){SIM.recipe(P.id,{out:['salvage'],rate:T.yard,cap:T.cap.yard,site:'th.site.dome-fall'});mk('yard');}
   else if(P.kind==='bore'){SIM.recipe(P.id,{out:['artifacts'],rate:T.bore,cap:T.cap.bore,site:'th.site.bore'});mk('bore');}
   else if(P.kind==='arc-kitchen'){SIM.recipe(P.id,{batch:bake,cap:T.cap['arc-kitchen']});mk('arc-kitchen');}}
  /* the stalls sell the town's food; the hostels a meal out */
  for(const P of mine){if(P.kind==='bazaar'){SIM.shop(P.id,FOODS.slice());out.shops++;}else if(P.kind==='hostel'){SIM.shop(P.id,['meal']);out.shops++;}}
  /* the messes: the arcology's homes, the hostels, the Devisers' lodge */
  for(const P of mine)if(/^arc:/.test(P.kind)||P.kind==='hostel'||P.kind==='home:bore'){P.mess=true;out.messes++;}
  /* every other home a store of food, `storeDays` of its people's meals in two or three foods (a hash) */
  const people={};for(const a of SIM.all('actor'))if(a.home&&!a.driven)people[a.home]=(people[a.home]||0)+1;
  const per=T.items.meals*T.items.perMeal,rawFoods=['grain','pulse','tuber','milk','honey'];
  mine.forEach((P,i)=>{if(P.mess||!people[P.id]||!/^home:/.test(P.kind))return;P.people=people[P.id];
   const days=T.storeDays[0]+(T.storeDays[1]-T.storeDays[0])*U(i,1),serv=Math.round(P.people*per*days),k=2+Math.floor(U(i,2)*2);P.store={};
   for(let j=0;j<k;j++){const f=rawFoods[Math.floor(U(i,3+j)*rawFoods.length)%rawFoods.length];P.store[f]=(P.store[f]||0)+Math.round(serv/k);}out.stores++;});
  /* the warehouses' opening stock: `startDays` of the town's meals, the foods in the shares the makers make them */
  const pop=SIM.all('actor').filter(a=>!a.driven&&SIM.settlementOf(a)===s).length,W=E.warehouses,need=pop*per*T.startDays;
  const share={grain:.3,pulse:.15,tuber:.15,milk:.15,honey:.1,bread:.15};
  if(W.length)FOODS.forEach(g=>{const n=Math.round(need*share[g]);W.forEach((P,j)=>{P.stock[g]=Math.floor(n/W.length)+(j<n%W.length?1:0);});});
  /* the carters: driven actors, homed at the warehouses in turn */
  if(!SIM.R.role.cart)SIM.role({id:'cart',org:'town',name:'carter',sched:[[0,'HAUL']],speed:SIM.SPEED&&SIM.SPEED.cart});
  for(let c=0;c<(o.carts==null?T.carts:o.carts)&&W.length;c++){const H=W[c%W.length],a=SIM.actor({id:'th.cart'+c,role:'cart',org:'town',home:H.id,cls:'cart',job:'carters'});
   a.pos={x:H.door.x,y:H.door.y||0,z:H.door.z};SIM.cart(a);out.carts++;}
  if(SIM.placesChanged)SIM.placesChanged();
  out.people=pop;out.snap=SIM.ledgerSnap?SIM.ledgerSnap():null;
  return out;}
 /* the economy's state for a report: per good made, used, stock and days left; the books since the opening snapshot */
 function report(SIM,o){const s='theodiga',R=SIM.economyReport?SIM.withEcon?SIM.withEcon(s,()=>SIM.economyReport(s)):SIM.economyReport(s):null;
  const led=o&&o.snap&&SIM.ledger?SIM.ledger(o.snap,SIM.ledgerSnap(),{tol:.5}):null;
  const days={};FOODS.forEach(g=>{try{const d=SIM.withEcon?SIM.withEcon(s,()=>SIM.economyDays(g)):SIM.economyDays(g,s);days[g]=d==null||!isFinite(d)?null:+d.toFixed(2);}catch(e){days[g]=null;}});
  const B=SIM.ITEMS&&SIM.ITEMS.statsBy?SIM.ITEMS.statsBy[s]:null;
  return {ok:led?led.ok:null,problems:led?led.problems.slice(0,6):[],town:led&&led.towns?led.towns[s]:null,days,meals:B&&B.meals?B.meals:null,blocked:SIM.blockedReport?SIM.blockedReport(s):null,
   sites:SIM.sitesReport?SIM.sitesReport(s):null};}
 return {declare,report,FOODS,OTHER,TUNE};
})();
