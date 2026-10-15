// ================================================================= EXAMPLE — the world: a toy economy on core/simulation
// The world core/simulation's own test proves the stocks on (core/simulation/test-sim.js, "what things hold"): two homes,
// a market, a field and a farm, a warehouse (the shed), a caravanserai, two farmers, a grower and a cart, corn, wheat and
// salt, a shirt and a hoe. The clock is the example's own (SIM.init reads it); 98-take.js steps it with the host's clock.
// Before the page opens, the world runs from 20:00 on day 1 past midnight to 08:00 on day 3, so the stocks have a whole
// day (the daily snapshot) and today.
const EX={h:20,d:0,t:0,m:20*60};
SIM.init({seed:83,hour:()=>EX.h,day:()=>EX.d,t:()=>EX.t,err:m=>KHOST.err&&KHOST.err('sim: '+m)});
['SLEEP','BUY','FARM','SOCIALIZE','REST','IDLE','STABLE','TRADE','DEPART','LODGE','WORK','EAT','HAUL'].forEach(a=>SIM.activity({id:a,indoor:a==='SLEEP'||a==='LODGE'}));
SIM.faction({id:'town'});SIM.org({id:'folk',faction:'town'});
const EXNODES=[[0,0],[50,0],[100,0],[150,0],[100,60]].map((p,i)=>({id:i,x:p[0],y:0,z:p[1]}));
const EXEDGES=[[0,1],[1,2],[2,3],[2,4]].map((e,i)=>({id:i,a:e[0],b:e[1],kind:'ground',len:Math.hypot(EXNODES[e[0]].x-EXNODES[e[1]].x,EXNODES[e[0]].z-EXNODES[e[1]].z),w:6}));
SIM.nav.layer('pedestrian',{nodes:EXNODES,edges:EXEDGES});
SIM.place({id:'homeA',kind:'home',name:'Home A',x:0,z:0,activities:{SLEEP:2,REST:2}});
SIM.place({id:'homeB',kind:'home',name:'Home B',x:150,z:0,activities:{SLEEP:2,REST:2}});
SIM.place({id:'market',kind:'market',name:'The market',x:100,z:60,activities:{BUY:1,SOCIALIZE:10,TRADE:4},open:[6,20],r:4});
SIM.place({id:'serai',kind:'caravanserai',name:'The caravanserai',x:100,z:0,activities:{STABLE:10,LODGE:10}});
SIM.place({id:'field',kind:'field',name:'The field',x:150,z:-30,activities:{FARM:4}});
SIM.place({id:'farm',kind:'field',name:'The farm',x:150,z:30,activities:{WORK:4},open:[0,24],r:10});
SIM.place({id:'shed',kind:'warehouse',name:'The shed',x:40,z:30,activities:{}});
SIM.port({id:'east',x:150,z:0});SIM.port({id:'west',x:0,z:0});
SIM.role({id:'farmer',org:'folk',sched:[[0,'SLEEP'],[6,'FARM'],[10,'BUY'],[12,'FARM'],[20,'SLEEP']],prefers:{SLEEP:{pin:'home'},BUY:{spread:1}}});
SIM.role({id:'grower',org:'folk',sched:[[0,'WORK']],prefers:{WORK:{pin:'work'}}});SIM.role({id:'carter',org:'folk',sched:[[0,'IDLE']]});
SIM.items({kinds:{corn:{cat:'food',food:true},shirt:{cat:'clothes',slot:'torso',life:10},hoe:{cat:'tool',workLife:100}},free:['IDLE'],secPerMinute:1,hurt:0});
SIM.economy({goods:{corn:{},wheat:{},salt:{}},every:60,window:1,imports:{days:3,scan:60},cart:{cap:30,load:5,unload:5,minLoad:500}});
SIM.store('shed',{kind:'warehouse'});SIM.store('serai',{kind:'site'});SIM.recipe('farm',{out:['corn'],rate:2,cap:400});
SIM.R.place.shed.stock={corn:40,wheat:25};SIM.R.place.serai.stock={salt:12};
SIM.R.place.homeA.people=2;SIM.R.place.homeA.store={corn:6};
SIM.actor({id:'f1',role:'farmer',home:'homeA'});SIM.actor({id:'f2',role:'farmer',home:'homeB'});
{const f=SIM.R.actor.f1;SIM.equip(f,'shirt',0.4);SIM.give(f,'shirt',2);f.tool={k:'hoe',w:0.25};}
SIM.actor({id:'g1',role:'grower',home:'homeB',work:'farm'});SIM.cart(SIM.actor({id:'cart1',role:'carter',home:'homeA'}));
// one world minute: the clock, then the step (never twice for a minute)
function exMinute(){EX.m++;EX.h=(EX.m%1440)/60;EX.d=Math.floor(EX.m/1440);EX.t+=40;SIM.step();}
while(EX.m<2*1440+8*60)exMinute();
