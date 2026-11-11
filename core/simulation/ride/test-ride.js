// node core/simulation/ride/test-ride.js — riding (PLAN-RIDING.md): ride sources, frame legs, journeys across a gap,
// door windows, capacity, the export; each check with a broken input that must fail.
const fs=require('fs'),path=require('path');
global.window=global;
const CORE=path.join(__dirname,'..','..');
const SIMF=fs.readdirSync(path.join(CORE,'simulation')).filter(f=>/^77-sim-.*\.js$/.test(f)).sort().map(f=>path.join('simulation',f));
const FILES=['rand/08-core-rand.js','sched/20-core-sched.js',...SIMF,'walk/20-core-walk.js','walk/frame/26-core-walk-frame.js','simulation/ride/78-sim-ride.js','simulation/ride/lab/40-ride-lab-world.js'];
let bad=0;const ok=(name,pass,neg)=>{const r=pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const near=(a,b,e)=>Math.abs(a-b)<(e==null?1e-6:e);
function fresh(seed){
  FILES.forEach(f=>(0,eval)(fs.readFileSync(path.join(CORE,f),'utf8')));
  const S=window.SIM,clock={h:6,d:0,t:0};S.init({seed:seed||11,hour:()=>clock.h,day:()=>clock.d,t:()=>clock.t,err:()=>{}});
  return {S,clock};
}
function tick(S,clock){clock.t+=60;const m=Math.round(clock.t/60)+6*60;clock.d=Math.floor(m/1440);clock.h=(m%1440)/60;S.step();}

// ---------------------------------------------------------------- the sources refuse what cannot run
{const {S}=fresh();const L=RIDELAB.declare({});const tr=S.rideRoute([[0,0,0],[100,0,0]]);
 const base={track:tr,stops:{a:{side:1,wait:[[0,1,0]]},b:{side:1,wait:[[0,1,0]]}},cars:[{off:0,b:4}]};
 const T=(d)=>({period:2*(d+20),segments:[{dur:d,from:10,name:'stop:a'},{dur:20,from:10,to:90},{dur:d,from:90,name:'stop:b'},{dur:20,from:90,to:10}]});
 const tryS=o=>{try{S.rideSource(o);return null;}catch(e){return e.message;}};
 ok('a dwell shorter than a step is refused (a step would miss the stop)',/outlast a step/.test(tryS(Object.assign({id:'x1',timeline:T(50)},base))),tryS(Object.assign({id:'x2',timeline:T(80)},base)));
 ok('a car that would leave the track is refused',/leaves the track/.test(tryS(Object.assign({},base,{id:'x3',timeline:T(80),cars:[{off:8,b:4}]}))),false);
 ok('a timeline with no dwell is refused',/no dwell/.test(tryS(Object.assign({},base,{id:'x4',timeline:{segments:[{dur:10,from:10,to:90}]}}))),false);
 ok('a dwell at a stop the source does not know is refused',/unknown stop/.test(tryS(Object.assign({},base,{id:'x5',timeline:T(80),stops:{a:base.stops.a}}))),false);}

// ---------------------------------------------------------------- the cars move as a pure function of time
const {S,clock}=fresh(11);const L=RIDELAB.declare({});
{const P0=S.rideCarPose('line.n',1,10),P1=S.rideCarPose('line.n',1,90+75/2),P2=S.rideCarPose('line.n',1,170);
 ok('in its first dwell the middle car stands at Ledge (s 60), facing +x',near(P0.x,60)&&near(P0.yaw,Math.PI/2)&&near(P0.y,0),!near(P0.x,60));
 ok('half way along its run it is half way (the smooth ease), then at the gap station',near(P1.x,470,1)&&near(P2.x,880),near(P1.x,60));
 ok('the cars keep their places in the train (front car 14 m ahead)',near(S.rideCarPose('line.n',2,10).x-P0.x,14),false);
 const d=S.rideDwellAt('line.n',50),r=S.rideDwellAt('line.n',120);
 ok('the dwell standing: its stop, its door window 4 s after it starts to 6 s before it ends',d&&d.stop==='ledge'&&d.o0===4&&d.o1===84&&d.open&&r===null,!d);
 const runs=S.rideRuns('line.n',0,700);
 ok('the runs alternate Ledge -> the gap and back, each departing as its doors shut',runs.length>=4&&runs[0].from==='ledge'&&runs[0].to==='gap.n'&&runs[1].from==='gap.n'&&runs[0].dep[1]===84&&runs[0].arr[0]===169,runs[0].to==='ledge');
 ok('a door opens only on its side at the dwell, and never on the run',S.rideDoorOpen('line.n',0,'d+f',50)&&!S.rideDoorOpen('line.n',0,'d-f',50)&&!S.rideDoorOpen('line.n',0,'d+f',120),S.rideDoorOpen('line.n',0,'d+f',120));
 const vp=S.vehiclePose('line.n',1,50),vr=S.vehiclePose('line.n',1,120);
 ok('vehiclePose answers a ride source: at the stop\'s place in a dwell, none on the run',vp.at==='ledge.stop'&&vr.at===null&&vr.moving,vp.at===null);}

// ---------------------------------------------------------------- a journey: walk, ride, the gap walked, ride, walk
const W=KWALK.create();RIDELAB.walk(W,L);
const people=RIDELAB.people(L,60);
const plan=S.journeyPlan(people[0].pos,{x:L.stops.twenny.x,y:0,z:-40},0,{});
ok('the planner rides to the gap, walks round the fall, rides on',plan&&plan.steps.map(s=>s.kind+':'+s.from+'>'+s.to).join(' ')==='ride:ledge>gap.n walk:gap.n>gap.s ride:gap.s>twenny',!plan);
const direct=S.journeyPlan(people[0].pos,{x:L.stops.ledge.x+5,y:1.1,z:-4},0,{});
ok('a short trip is walked, not ridden',direct&&direct.steps.length===0,direct&&direct.steps.length>0);
// sixty travellers set out two a minute from the homes at Ledge for the works at Twenny
const tasks={};let failed=0;
for(let m=0;m<130;m++){
  for(const a of people){const i=+a.id.slice(2);if(Math.floor(i/2)===m&&!tasks[a.id]){const T=S.journey(a,{to:'twenny.works',t:clock.t,hold:true});if(T)tasks[a.id]=T;else failed++;}}
  tick(S,clock);}
ok('every traveller got a journey',Object.keys(tasks).length===60&&failed===0,Object.keys(tasks).length===0);
const T0=tasks.tr0,frameLegs=T0.legs.filter(l=>l.frame);
ok('a journey\'s legs: walks, waits, a board, frame legs in two cars, the walk across the gap',frameLegs.length===6&&new Set(frameLegs.map(l=>l.frame.source)).size===2&&T0.legs.some(l=>l.layer==='board'),frameLegs.length===0);
// the riders stay on their car's floor through every frame leg (the walk side: KWALKFRAME frames posed by the same function)
function onFloor(a,lift){let worst=0,n=0,miss=0;const T=a.task;let t=T.t0;
  for(const Lg of T.legs){if(Lg.frame){for(let u=0.25;u<Lg.dur;u+=Math.max(0.5,Lg.dur/40)){const tt=t+u,p=S.pose(a,tt);KWALKFRAME.at(W,tt);
        const f=W.floorBelow(p.x,p.z,p.y+lift,0.6),fr=L.frames.find(q=>q.src===Lg.frame.source&&q.k===Lg.frame.k).F;n++;
        if(!f||f[1].frame!==fr)miss++;else worst=Math.max(worst,Math.abs(f[0]-(p.y+lift)));}}t+=Lg.dur;}
  return {worst,n,miss};}
const fl=people.slice(0,12).map(a=>onFloor(a,0)),lifted=onFloor(people[0],0.5);
ok('every rider stays on its own car\'s floor through the ride (12 riders, within 2 cm)',fl.every(r=>r.n>20&&r.miss===0&&r.worst<0.02),lifted.miss===0&&lifted.worst<0.02);
// no teleports: between samples half a second apart a rider moves no more than it walks plus the car's speed
function maxStep(a){const T=a.task;let worst=0,prev=null;for(let t=T.t0;t<T.arrive;t+=0.5){const p=S.pose(a,t);if(prev)worst=Math.max(worst,Math.hypot(p.x-prev.x,p.z-prev.z));prev=p;}return worst;}
const ms=people.slice(0,12).map(maxStep);
const brokenTask=JSON.parse(JSON.stringify(people[1].task));brokenTask.legs.forEach(l=>{if(l.frame&&l.layer==='ride'&&l.route.len===0)l.frame.k=(l.frame.k+1)%3;});
const ghost=Object.assign({},people[1],{task:brokenTask});
ok('no rider jumps: every half second it moves under 9.5 m (the train\'s top speed, 16.4 m/s, for half a second, plus a step)',ms.every(d=>d<9.5),maxStep(ghost)<9.5);
// the door windows: every crossing inside its window, on the door's side; capacity on every run
const AU=S.rideAudit();
const shifted=S.RIDE.log.slice(0,1).map(e=>Object.assign({},e,{t:e.o1+20}));
ok('every boarding and alighting crosses the door inside its window ('+AU.boards+' boards, '+AU.alights+' alights)',AU.ok&&AU.boards===120&&AU.alights===120,S.rideAudit({log:shifted}).outside.length===0);
const busy=Object.keys(S.RIDE.occ).map(r=>Object.values(S.RIDE.occ[r].cars).reduce((n,c)=>n+Object.keys(c.seats).length+c.stand.length,0));
const over={'line.n:0':{cars:{0:{seats:{},stand:['a','b','c','d','e','f','g']}}}};
ok('no car on any run holds more than its seats and standing room; a busy run spilled to the next train',AU.over.length===0&&Math.max(...busy)<=42&&new Set(people.map(a=>a.task.ride.held[0].g0)).size>1,S.rideAudit({log:[],occ:over}).over.length===0);
// arrival: the stepper released nobody early; each stands at the works when its journey ends
const last=Math.max(...people.map(a=>a.task.arrive));while(clock.t<last+120)tick(S,clock);
const atWork=people.every(a=>{const p=S.pose(a,clock.t);return Math.hypot(p.x-L.stops.twenny.x,p.z+40)<1;});
ok('every traveller arrives at the works at Twenny, past the gap',atWork&&Object.keys(S.RIDE.riders).length===0,!atWork);
ok('a journey arrives within a minute of the planner\'s time',people.every(a=>Math.abs(a.task.arrive-a.task.ride.plan.arrive)<60),false);
// the export carries the frames, and its trace is SIM.pose's
const M=S.rideExportMotion({actors:people.slice(0,6),times:[0,100,400,900,1500,2500].map(x=>x-clock.t)});
ok('the motion export carries each leg\'s frame and the sources',M.ride.sources.length===2&&M.actors[0].task.legs.filter(l=>l.frame).length===6&&M.ride.sources[0].timeline.segments.length===4,!M.ride);
// determinism: the same world twice gives the same trace
function trace(){const {S:S2,clock:c2}=fresh(11);const L2=RIDELAB.declare({});const P=RIDELAB.people(L2,20);
  for(let m=0;m<60;m++){P.forEach(a=>{if(Math.floor(+a.id.slice(2)/2)===m)S2.journey(a,{to:'twenny.works',t:c2.t,hold:true});});tick(S2,c2);}
  let h='';for(let t=0;t<3000;t+=37)P.forEach(a=>{const p=S2.pose(a,t);h+=p.x.toFixed(4)+','+p.z.toFixed(4)+';';});return h;}
ok('two runs of the same world give the same trace',trace()===trace(),false);
// the golden trace Godot replays (godot/tests/ride/ride_test.gd): written with --write, else compared
const GOLD=path.join(__dirname,'golden-ride.json');
if(process.argv.includes('--write'))fs.writeFileSync(GOLD,JSON.stringify(M));
else ok('the golden trace is unchanged (node test-ride.js --write after a change meant to move it)',fs.existsSync(GOLD)&&fs.readFileSync(GOLD,'utf8')===JSON.stringify(M),false);
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
