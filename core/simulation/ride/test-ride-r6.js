// node core/simulation/ride/test-ride-r6.js — riding's R6 (PLAN-RIDING.md section 8c): travellers who choose the train in
// the resolver (81-sim-ride-choose.js) and ferries as ride sources (SIM.rideFromTransport); each check with a broken input
// that must fail. (The lojes as books, 80-sim-ride-line.js, are test-ride-cargo.js's.)
const fs=require('fs'),path=require('path');
global.window=global;
const CORE=path.join(__dirname,'..','..');
const SIMF=fs.readdirSync(path.join(CORE,'simulation')).filter(f=>/^77-sim-.*\.js$/.test(f)).sort().map(f=>path.join('simulation',f));
const FILES=['rand/08-core-rand.js','sched/20-core-sched.js',...SIMF,'simulation/ride/78-sim-ride.js','simulation/ride/81-sim-ride-choose.js','simulation/ride/lab/40-ride-lab-world.js'];
let bad=0;const ok=(name,pass,neg)=>{const r=pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
function fresh(h0){
  FILES.forEach(f=>(0,eval)(fs.readFileSync(path.join(CORE,f),'utf8')));
  const S=window.SIM,clock={h:h0==null?7:h0,d:0,t:0,m:(h0==null?7:h0)*60};S.init({seed:13,hour:()=>clock.h,day:()=>clock.d,t:()=>clock.t,err:()=>{}});
  clock.tick=()=>{clock.t+=60;clock.m++;clock.d=Math.floor(clock.m/1440);clock.h=(clock.m%1440)/60+1e-7;S.step();};
  clock.until=h=>{while(clock.m<h*60)clock.tick();};
  return {S,clock};
}
const near=(p,P,r)=>Math.hypot(p.x-P.x,p.z-P.z)<=r;

// ---------------------------------------------------------------- the resolver: shift workers at Ledge, work at Twenny past the gap
{const {S,clock}=fresh(7);const L=RIDELAB.declare({});RIDELAB.people(L,0);
 S.place({id:'ledge.shed',kind:'shed',x:L.stops.ledge.x+12,z:-40,y:0,r:3,activities:{WORK:20}});
 const sched=[[0,'SLEEP'],[8,'WORK'],[20,'SLEEP']];
 S.role({id:'shift',org:'loj',ride:true,sched,prefers:{SLEEP:{pin:'home'},WORK:{pin:'work'}}});
 S.role({id:'afoot',org:'loj',sched,prefers:{SLEEP:{pin:'home'},WORK:{pin:'work'}}});
 S.role({id:'local',org:'loj',ride:true,sched,prefers:{SLEEP:{pin:'home'},WORK:{pin:'work'}}});
 const H=S.R.place['ledge.homes'],at=i=>({x:H.x+Math.cos(i)*3,y:0,z:H.z+Math.sin(i)*3});
 const shift=[],afoot=[],local=[];
 for(let i=0;i<12;i++)shift.push(S.actor({id:'sh'+i,role:'shift',home:'ledge.homes',work:'twenny.works',pos:at(i)}));
 for(let i=0;i<4;i++)afoot.push(S.actor({id:'af'+i,role:'afoot',home:'ledge.homes',work:'twenny.works',pos:at(20+i)}));
 for(let i=0;i<3;i++)local.push(S.actor({id:'lo'+i,role:'local',home:'ledge.homes',work:'ledge.shed',pos:at(30+i)}));
 clock.until(10.5);
 const W=S.R.place['twenny.works'],t=clock.t;
 const there=shift.filter(a=>a.activity==='WORK'&&near(S.pose(a,t),W,8)).length;
 const rode=shift.filter(a=>a.task&&a.task.ride&&a.task.ride.resolver&&a.task.legs.some(l=>l.frame)).length;
 ok('at 8:00 the shift workers (ride: true) decide to work at Twenny, past the gap, and get there by train ('+there+' of 12 at work by 10:30)',there===12&&rode===12,there===0);
 ok('the same people without ride: true cannot get there (no walk joins the segments)',afoot.every(a=>!near(S.pose(a,t),W,30)),afoot.some(a=>near(S.pose(a,t),W,30)));
 ok('a short trip is walked even for a rider (the shed by the homes)',local.every(a=>a.task&&!a.task.ride&&near(S.pose(a,t),S.R.place['ledge.shed'],6)),local.some(a=>a.task&&a.task.ride));
 ok('arrived, they take up what they decided: no longer carried, working, not deciding again',shift.every(a=>!a.driven&&a.wanted==='WORK'&&!S.RIDE.riders[a.id]),false);
 const A=S.rideAudit();
 ok('their boardings and alightings are inside the door windows, no car over its room ('+A.boards+' boards)',A.ok&&A.boards===24,S.rideAudit({log:S.RIDE.log.slice(0,1).map(e=>Object.assign({},e,{t:e.o0-30}))}).ok);
 ok('the tally: twelve rode and none was left without a way (the short trips never came to the train rule: under minDist)',S.rideChosen.rode===12&&S.rideChosen.none===0,S.rideChosen.rode!==12);
 clock.until(23);
 const home=shift.filter(a=>a.activity==='SLEEP'&&near(S.pose(a,clock.t),H,8)).length;
 ok('at 20:00 they go home by train the other way ('+home+' of 12 home by 23:00)',home===12,home===0);}

// ---------------------------------------------------------------- a ferry as ride sources
{const {S,clock}=fresh(9);
 ['SLEEP','TRADE','TRAVEL'].forEach(a=>S.activity({id:a}));S.faction({id:'isles'});S.org({id:'folk',faction:'isles'});S.role({id:'folk',org:'folk',sched:[[0,'SLEEP']]});
 const N=[],E=[];const node=(id,x,z)=>{N.push({id,x,y:0,z});};const edge=(a,b)=>{const A=N.find(n=>n.id===a),B=N.find(n=>n.id===b);E.push({id:E.length,a,b,kind:'path',w:3,len:Math.hypot(A.x-B.x,A.z-B.z)});};
 node('a0',0,0);node('a1',20,0);node('a2',40,0);node('b0',300,0);node('b1',320,0);node('b2',340,0);edge('a0','a1');edge('a1','a2');edge('b0','b1');edge('b1','b2');
 S.nav.layer('pedestrian',{nodes:N.slice(),edges:E.slice()});
 const WN=[{id:'w0',x:45,y:0,z:0},{id:'w1',x:120,y:0,z:40},{id:'w2',x:220,y:0,z:40},{id:'w3',x:295,y:0,z:0}],WE=[[0,1],[1,2],[2,3]].map(([a,b],i)=>({id:i,a:'w'+a,b:'w'+b,kind:'water',w:20,len:Math.hypot(WN[a].x-WN[b].x,WN[a].z-WN[b].z)}));
 S.nav.layer('water',{nodes:WN,edges:WE});
 S.place({id:'pierA',kind:'pier',x:42,z:0,y:0,door:{x:40,y:0,z:0},pier:{x:45,y:0,z:0},activities:{}});
 S.place({id:'pierB',kind:'pier',x:298,z:0,y:0,door:{x:300,y:0,z:0},pier:{x:295,y:0,z:0},activities:{}});
 S.place({id:'market',kind:'market',x:340,z:0,y:0,activities:{TRADE:20}});
 S.transport({id:'ferry',layer:'water',stops:['pierA','pierB'],vehicleKind:'ferry',speed:4,dwell:90,vehicles:2});S.transportBake('ferry');
 const deck={b:0.25,cap:{seats:4,stand:8},seats:[{id:'s0',at:[-0.8,0.6,-2],yaw:0},{id:'s1',at:[0.8,0.6,-2],yaw:0},{id:'s2',at:[-0.8,0.6,2],yaw:0},{id:'s3',at:[0.8,0.6,2],yaw:0}],
   stand:[[-0.6,0.6,-3,3,0.6]],doors:[{id:'p',side:1,at:[1.6,0.6,0]},{id:'s',side:-1,at:[-1.6,0.6,0]}]};
 const src=S.rideFromTransport('ferry',{car:deck,stops:{pierA:{wait:[[40,0,0]]},pierB:{wait:[[300,0,0]]}}});
 ok('one ride source a vessel ('+src.map(s=>s.id).join(', ')+'), each with its stops\' dwells',src.length===2&&src[0].dwells.length===2&&src[0].dwells.every(d=>d.side===0),false);
 const R=S.R.transport.ferry;let worst=0,worstLate=0,atStop=0,atStopOk=0;
 for(let t=0;t<2*R.period;t+=3)for(let k=0;k<2;k++){const P=S.rideCarPose('ferry#'+k,0,t),V=S.vehiclePose('ferry',k,t),V2=S.vehiclePose('ferry',k,t+20);
   worst=Math.max(worst,Math.hypot(P.x-V.x,P.z-V.z));worstLate=Math.max(worstLate,Math.hypot(P.x-V2.x,P.z-V2.z));
   if(V.at){atStop++;if(Math.hypot(P.x-V.x,P.z-V.z)<0.5)atStopOk++;}}
 ok('each vessel\'s ride-source pose follows SIM.vehiclePose (worst '+worst.toFixed(3)+' m over two rounds; 20 s late it is '+worstLate.toFixed(0)+' m off)',worst<0.5&&atStop>0&&atStopOk===atStop,worstLate<0.5);
 const dA=S.rideDwellAt('ferry#0',10),run=S.rideRuns('ferry#0',0,R.period)[0];
 ok('at a stop both rails open in the door window and shut under way',dA&&S.rideDoorOpen('ferry#0',0,'p',dA.o0+1)&&S.rideDoorOpen('ferry#0',0,'s',dA.o0+1)&&!S.rideDoorOpen('ferry#0',0,'p',run.dep[1]+20),
   S.rideDoorOpen('ferry#0',0,'p',run.dep[1]+20));
 const a=S.actor({id:'traveller',role:'folk',pos:{x:2,y:0,z:0}});
 const T=S.journey(a,{to:'market',t:clock.t});
 const fr=T&&T.legs.filter(l=>l.frame);
 ok('a journey crosses the water on the ferry: walk to the pier, board, ride, alight, walk to the market',T&&T.ride.plan.steps.length===1&&/^ferry#/.test(T.ride.plan.steps[0].src)&&fr.length===3,!T);
 let onDeck=true;for(let t=T.t0;t<T.arrive;t+=2){const p=S.pose(a,t);if(p.frame){const P=S.rideCarPose(p.frame.source,0,t),dx=p.x-P.x,dz=p.z-P.z;if(Math.hypot(dx,dz)>3.6)onDeck=false;}}
 while(clock.t<T.arrive+60)clock.tick();
 const p=S.pose(a,clock.t);
 ok('aboard it stays on the deck, and it arrives at the market',onDeck&&near(p,S.R.place.market,1),!near(p,S.R.place.market,1));
 ok('its boarding and alighting are inside the ferry\'s door windows',S.rideAudit().ok&&S.rideAudit().boards===1,false);
 let threw=false;try{S.transport({id:'excl',layer:'water',stops:['pierA','pierB'],exclusive:true});S.transportBake('excl');S.rideFromTransport('excl',{car:deck});}catch(e){threw=/exclusive/.test(e.message);}
 ok('an exclusive route (a day laid out by events) is refused, not half-converted',threw,false);}
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
