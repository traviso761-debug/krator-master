// ================================================================= EXAMPLE — a 20-actor town declared into SIM
// core/simulation/PLAN.md Phase 1's acceptance sheet: the smallest world that runs on the module alone (core/rand,
// core/clock, core/simulation; no THREE). Declared in a settlement's order (SCHEMA.md, "How a world is declared"):
//   1. the host binding (the world clock), 2. the navigation layer (a street grid), 3. the places a build would read
//   from its geometry, then the ports, 4. the hand-edited records (what a world/*.json holds) through SIM.load,
//   5. the population from the roles, SIM.REF and SIM.check.
// To start a settlement's life layer: copy this, replace the streets and places with what your build placed, and move
// WORLD into world/*.json (one file per kind, one record per line, sorted by id).
const Q=new URLSearchParams(location.search);
// the standard 72-minute day, run 10 times fast (a day in about 7 minutes): scale speeds world AND motion time, so a
// walk takes as many world minutes as it would at 1x (a shorter dayLength would make every walk take hours)
const CLOCK=KCLOCK.make({hour:Q.has('hour')?+Q.get('hour'):6,scale:10,running:!Q.has('hold')});
let QUIET=false;   // the negative controls (90) feed SIM broken input on purpose: their errors are expected
function ERR(m){if(QUIET)return;const e=document.getElementById('errs');e.style.display='block';e.textContent+=m+'\n';}
SIM.init({seed:Q.has('seed')?+Q.get('seed'):20261005,hour:()=>CLOCK.hour,day:()=>CLOCK.day,t:()=>CLOCK.t,err:m=>ERR('sim: '+m)});

// ---------------------------------------------------------------- 2. the streets: a 5 x 4 grid, 40 m apart, and two roads out
const NODES=[],EDGES=[],S=40;
for(let j=0;j<4;j++)for(let i=0;i<5;i++)NODES.push({id:'n'+i+'_'+j,x:i*S,y:0,z:j*S,tag:'street'});
for(let j=0;j<4;j++)for(let i=0;i<5;i++){if(i<4)EDGES.push({a:'n'+i+'_'+j,b:'n'+(i+1)+'_'+j});if(j<3)EDGES.push({a:'n'+i+'_'+j,b:'n'+i+'_'+(j+1)});}
NODES.push({id:'east',x:200,y:0,z:40,tag:'road'},{id:'west',x:-40,y:0,z:80,tag:'road'});
EDGES.push({a:'n4_1',b:'east',kind:'road'},{a:'n0_2',b:'west',kind:'road'});
EDGES.forEach((e,k)=>{const A=NODES.find(n=>n.id===e.a),B=NODES.find(n=>n.id===e.b);e.id=k;e.kind=e.kind||'street';e.w=6;e.len=Math.hypot(A.x-B.x,A.z-B.z);});
SIM.nav.layer('pedestrian',{nodes:NODES,edges:EDGES});

// ---------------------------------------------------------------- 3. the places (a build derives these from what it placed)
const PLACES=[
 {id:'home_a',kind:'home',x:0,z:0,activities:{SLEEP:5,EAT:5,REST:5}},
 {id:'home_b',kind:'home',x:160,z:0,activities:{SLEEP:5,EAT:5,REST:5}},
 {id:'home_c',kind:'home',x:0,z:120,activities:{SLEEP:5,EAT:5,REST:5}},
 {id:'home_d',kind:'home',x:160,z:120,activities:{SLEEP:5,EAT:5,REST:5}},
 {id:'workshop',kind:'workshop',x:40,z:0,activities:{CRAFT:4},indoor:{CRAFT:true}},
 {id:'yard',kind:'yard',x:80,z:0,r:8,wander:2,activities:{PLAY:6}},
 {id:'tavern',kind:'tavern',x:120,z:0,activities:{EAT:12,SOCIALIZE:12},open:[11,24],indoor:{EAT:true}},
 {id:'market',kind:'market',x:80,z:40,r:10,wander:1.5,activities:{TRADE:8,SOCIALIZE:10},open:[6,20]},
 {id:'shrine',kind:'shrine',x:40,z:120,activities:{WORSHIP:6}},
 {id:'well',kind:'well',x:80,z:120,r:4,wander:.8,activities:{FETCH_WATER:4,WATER_BEASTS:6}},
 {id:'field',kind:'field',x:120,z:120,r:12,wander:2.5,activities:{FARM:8}},
];
PLACES.forEach(p=>SIM.place(Object.assign({name:p.id.replace('_',' '),y:0},p)));
SIM.port({id:'east',x:200,z:40});SIM.port({id:'west',x:-40,z:80});

// ---------------------------------------------------------------- 4. the hand-edited records (world/*.json in a settlement)
const WORLD={
 activities:['CRAFT','DEPART','EAT','FARM','FETCH_WATER','IDLE','PLAY','REST','SLEEP','SOCIALIZE','TRADE','WATER_BEASTS','WORSHIP']
  .map(id=>id==='SLEEP'||id==='REST'?{id,indoor:true}:{id}),
 factions:[{id:'nomads',name:'The caravan folk'},{id:'town',name:'The town'}],
 orgs:[{id:'caravan',faction:'nomads',name:'A caravan company',resident:false},{id:'townsfolk',faction:'town',name:'The townsfolk'}],
 relations:[{a:'town',b:'nomads',stance:'friendly'}],
 roles:[
  {id:'artisan',org:'townsfolk',count:4,homes:['home'],sched:[[0,'SLEEP'],[6,'WORSHIP'],[7,'CRAFT'],[12,'EAT'],[13,'CRAFT'],[17,'SOCIALIZE'],[21,'SLEEP']],prefers:{SLEEP:{pin:'home'},EAT:{kinds:['tavern']}}},
  {id:'child',org:'townsfolk',count:4,homes:['home'],sched:[[0,'SLEEP'],[7,'FETCH_WATER'],[8,'PLAY'],[12,'EAT'],[13,'PLAY'],[18,'EAT'],[19,'SLEEP']],prefers:{SLEEP:{pin:'home'},EAT:{pin:'home'}},speed:1.5},
  {id:'farmer',org:'townsfolk',count:8,homes:['home'],sched:[[0,'SLEEP'],[5,'EAT'],[6,'FARM'],[12,'EAT'],[13,'FARM'],[18,'SOCIALIZE'],[21,'SLEEP']],prefers:{SLEEP:{pin:'home'},EAT:{pin:'home'}}},
  {id:'rider',org:'caravan',transient:true,sched:[[0,'REST']],_note:'made only by the caravan event; its itinerary moves it'},
  {id:'trader',org:'townsfolk',count:4,homes:['home'],sched:[[0,'SLEEP'],[6,'TRADE'],[12,'EAT'],[13,'TRADE'],[19,'SOCIALIZE'],[22,'SLEEP']],prefers:{SLEEP:{pin:'home'},TRADE:{kinds:['market']}}}],
 events:[{id:'caravan',name:'A caravan',kind:'riders',org:'caravan',every:[3,6],window:[7,17],from:['east'],to:['west'],size:[1,2],unit:[{role:'rider',n:2}],beasts:1,mount:'camel',
  legs:[{activity:'WATER_BEASTS',mins:20},{activity:'TRADE',mins:60}],layer:'pedestrian',mode:'ride',speed:2.2,maxLive:1}],
};
const LOADED=SIM.load(WORLD);

// ---------------------------------------------------------------- 5. the people, the reference point, the check
const POP=SIM.populate({prefix:'a'});
SIM.REF={layer:'pedestrian',x:80,z:40,ports:true};
const PROBLEMS=SIM.check();
SIM.jump();
