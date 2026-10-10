// node core/simulation/test-sim.js — the simulation core's contract on a toy world, each check with a negative.
// (This machine has no node: python <scratch>/jsrun.py core/sched/20-core-sched.js core/simulation/77-sim-*.js core/simulation/test-sim.js)
const fs=require('fs'),path=require('path');
global.window=global;
['77-sim-0-core.js','77-sim-1-world.js','77-sim-2-places.js','77-sim-3-actors.js','77-sim-4-nav.js','77-sim-5-motion.js','77-sim-5r-routes.js','77-sim-6-population.js','77-sim-8-export.js','77-sim-9-debug.js']
  .forEach(f=>(0,eval)(fs.readFileSync(path.join(__dirname,f),'utf8')));
let bad=0;const ok=(name,pass,neg)=>{const r=pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const near=(a,b,e)=>Math.abs(a-b)<(e||1e-6);

function world(seed){
  // a fresh SIM each time: re-evaluate the module
  ['77-sim-0-core.js','77-sim-1-world.js','77-sim-2-places.js','77-sim-3-actors.js','77-sim-4-nav.js','77-sim-5-motion.js','77-sim-5r-routes.js','77-sim-6-population.js','77-sim-8-export.js','77-sim-9-debug.js']
    .forEach(f=>(0,eval)(fs.readFileSync(path.join(__dirname,f),'utf8')));
  const S=window.SIM, clock={h:2,d:0,t:0};
  S.init({seed:seed||7, hour:()=>clock.h, day:()=>clock.d, t:()=>clock.t});
  ['SLEEP','BUY','FARM','SOCIALIZE','REST','IDLE','STABLE','TRADE','DEPART','LODGE'].forEach(a=>S.activity({id:a, indoor:a==='SLEEP'||a==='LODGE'}));
  S.faction({id:'town'});S.faction({id:'nomads'});S.faction({id:'raiders'});
  S.org({id:'folk',faction:'town'});S.org({id:'riders',faction:'nomads',resident:false});S.org({id:'band',faction:'raiders',resident:false});
  S.relation({a:'town',b:'nomads',stance:'friendly'});S.relation({a:'town',b:'raiders',stance:'hostile'});
  // a street: 0 - 1 - 2 - 3 along x every 50 m, 4 off node 2 to the south; 5 is an island with no edge
  const nodes=[[0,0],[50,0],[100,0],[150,0],[100,60],[400,400]].map((p,i)=>({id:i,x:p[0],y:0,z:p[1]}));
  const edges=[[0,1],[1,2],[2,3],[2,4]].map((e,i)=>({id:i,a:e[0],b:e[1],kind:'ground',len:Math.hypot(nodes[e[0]].x-nodes[e[1]].x,nodes[e[0]].z-nodes[e[1]].z),w:6}));
  S.nav.layer('pedestrian',{nodes,edges});
  S.place({id:'homeA',kind:'home',x:0,z:0,activities:{SLEEP:2,REST:2}});
  S.place({id:'homeB',kind:'home',x:150,z:0,activities:{SLEEP:2,REST:2}});
  S.place({id:'market',kind:'market',x:100,z:60,activities:{BUY:1,SOCIALIZE:10,TRADE:4},open:[6,20],r:4});
  S.place({id:'field',kind:'field',x:150,z:0,activities:{FARM:4}});
  S.place({id:'serai',kind:'caravanserai',x:100,z:0,activities:{STABLE:10,LODGE:10}});
  S.place({id:'nowhere',kind:'market',x:400,z:400,activities:{BUY:5},open:[6,20]});
  S.port({id:'east',x:150,z:0});S.port({id:'west',x:0,z:0});
  S.role({id:'farmer',org:'folk',sched:[[0,'SLEEP'],[6,'FARM'],[10,'BUY'],[12,'FARM'],[20,'SLEEP']],prefers:{SLEEP:{pin:'home'},BUY:{spread:1}}});
  S.role({id:'rider',org:'riders',sched:[[0,'LODGE'],[7,'TRADE'],[20,'LODGE']]});
  S.actor({id:'f1',role:'farmer',home:'homeA'});S.actor({id:'f2',role:'farmer',home:'homeB'});
  return {S,clock};
}

// 1. schedules, registries, references
{const {S}=world();
 const s=S.sched([[0,'SLEEP'],[6,'FARM'],[20,'SLEEP']]);
 ok('a schedule of spans expands to 24 hours',s.length===24&&s[5]==='SLEEP'&&s[6]==='FARM'&&s[19]==='FARM'&&s[20]==='SLEEP',s[6]!=='FARM');
 let threw=false;try{S.place({id:'homeA',x:0,z:0});}catch(e){threw=true;}
 ok('a duplicate id throws',threw,!threw);
 S.role({id:'ghost',org:'nobody',sched:[[0,'FLY']]});
 const probs=S.check();
 ok('unknown references are named',probs.some(p=>/ghost.*nobody/.test(p))&&probs.some(p=>/FLY/.test(p)),!probs.length);}

// 2. stances and permissions
{const {S}=world();
 ok('a friendly faction is friendly, org to org through their factions',S.stance('folk','riders')==='friendly',S.stance('folk','riders')==='hostile');
 ok('an unknown pair is neutral; a faction is allied with itself',S.stance('riders','band')==='neutral'&&S.stance('folk','folk')==='allied',S.stance('riders','band')!=='neutral');
 const P=S.get('place','market');P.org='folk';
 ok('a public place lets a friendly org in and keeps a hostile one out',S.welcome('riders',P)&&!S.welcome('band',P),!S.welcome('riders',P));}

// 3. the resolver and the slots
{const {S,clock}=world();
 clock.h=2;S.step();
 const a=S.get('actor','f1'),b=S.get('actor','f2');
 ok('at 2:00 the schedule says SLEEP and the actor is pinned to its own home',a.activity==='SLEEP'&&a.place==='homeA'&&b.place==='homeB',a.place!=='homeA');
 clock.h=10;clock.t=100;S.step();
 const buyers=[a,b].filter(x=>x.activity==='BUY').length,fell=[a,b].filter(x=>x.activity!=='BUY');
 ok('a place with one BUY slot takes one buyer; the other falls back (and the far market with no path is never chosen first)',buyers===1&&fell.length===1&&fell[0].activity==='SOCIALIZE',buyers!==1);
 ok('slots are counted',S.get('place','market').occ.BUY===1,S.get('place','market').occ.BUY!==1);
 const wantNow=[a,b].map(x=>x.wanted);ok('the actor remembers what it wanted (BUY) when it fell back',wantNow.every(w=>w==='BUY'),!wantNow.every(w=>w==='BUY'));}

// 4. motion is a function of time
{const {S,clock}=world();
 clock.h=6;clock.t=0;S.step();
 const a=S.get('actor','f1'),T=a.task;
 ok('a decision bakes legs: home A to the field is the street, 150 m',T&&T.legs.length===1&&near(T.legs[0].route.len,150,0.01),!T);
 const mid=S.pose(a,T.t0+T.dur/2),end=S.pose(a,T.t0+T.dur+5);
 ok('half way along the street at half the time',near(mid.x,75,0.5)&&mid.moving,!mid.moving);
 ok('at the spot after arriving, not moving',near(end.x,150,0.5)&&!end.moving,end.moving);
 const again=S.pose(a,T.t0+T.dur/2);ok('the same t gives the same pose (no hidden state)',again.x===mid.x&&again.z===mid.z,again.x!==mid.x);
 clock.h=2;S.step();const s=S.pose(a,a.task.t0+a.task.dur+1);ok('indoors at home: hidden',s.hidden,!s.hidden);}

// 5. navigation: unreachable, width
{const {S}=world();
 const r=S.nav.route('pedestrian',{x:0,z:0,node:0},{x:400,z:400,node:5});
 ok('an island node is unreachable and the failure is recorded',r===null&&S.routeFail.length>=1,r!==null);
 const r2=S.nav.route('pedestrian',{x:0,z:0},{x:100,z:60},{minW:10});
 ok('a route wider than every street fails',r2===null,r2!==null);
 const r3=S.nav.route('pedestrian',{x:0,z:0},{x:100,z:60},{minW:5});
 ok('a route the streets are wide enough for succeeds (0 -> 1 -> 2 -> 4)',r3&&near(r3.len,160,0.01),!r3);}

// 6. events: a group arrives, stays, leaves
{const {S,clock}=world(11);
 S.event({id:'riders',kind:'riders',org:'riders',every:[1,1],window:[0,24],from:['east','west'],to:'other',size:[2,2],unit:[{role:'rider',n:2}],arrive:{kinds:['caravanserai'],activity:'STABLE'},stay:{nights:0,untilHour:22},maxLive:1});
 clock.h=8;clock.t=0;for(let m=0;m<90;m++){clock.h=8+m/60;clock.t=m*3;S.step();}
 const G=S.all('group')[0];
 ok('the event fired: one group of 4 riders (2 units x 2)',G&&G.members.length===4,!G);
 const lead=S.get('actor',G.members[0]);
 for(let m=90;m<300;m++){clock.h=8+m/60;clock.t=m*3;S.step();}
 ok('arrived and staying: following their own schedule (TRADE by day)',G.phase==='stay'&&lead.activity==='TRADE',G.phase!=='stay');
 for(let m=300;m<1000;m++){clock.h=(8+m/60)%24;clock.d=Math.floor((8+m/60)/24);clock.t=m*3;S.step();}
 ok('after 22:00 the group left and its actors are gone',!S.get('group',G.id)&&!S.get('actor',G.members[0]),!!S.get('group',G.id));}

// 6b. an itinerary (an event with legs): stop to stop together, then out by its port; an event that makes no one
{const {S,clock}=world(13);
 S.event({id:'convoy',kind:'riders',org:'riders',from:['east'],to:['west'],size:[1,1],unit:[{role:'rider',n:3}],legs:[{activity:'TRADE',mins:30},{activity:'STABLE',mins:20}]});
 clock.h=8;clock.t=0;const G=S.fire(S.get('event','convoy'),S.minute(),0);
 for(let m=1;m<300;m++){clock.h=8+m/60;clock.t=m*3;S.step();}
 const L=S.LOG.filter(e=>e.group===G.id),stops=L.filter(e=>e.kind==='arrived').map(e=>e.place+':'+e.act).join(',');
 ok('legs: market (TRADE), then the serai (STABLE), then out by the west port',stops==='market:TRADE,serai:STABLE'&&L.some(e=>e.kind==='left'&&e.port==='west')&&!S.get('group',G.id),stops!=='market:TRADE,serai:STABLE');
 const T0=L.find(e=>e.kind==='arrived'&&e.place==='market').m,T1=L.find(e=>e.kind==='arrived'&&e.place==='serai').m;
 ok('a stop lasts its minutes (the serai is reached 30 min + the walk after the market)',T1-T0>=30&&T1-T0<60,T1-T0<30);
 S.event({id:'empty',kind:'riders',org:'riders',from:['east'],to:['west'],legs:[{activity:'TRADE',mins:5}]});
 const n=S.problems.length,E=S.fire(S.get('event','empty'),S.minute(),clock.t);
 ok('an event whose unit makes no one is an error, not a leaderless group',E===null&&S.problems.length===n+1&&!S.all('group').some(g=>g.event==='empty'),E!==null);}

// 7. determinism
{function run(){const {S,clock}=world(5);const L=[];for(let m=0;m<600;m++){clock.h=(m/60)%24;clock.t=m*3;S.step();}return JSON.stringify(S.LOG.map(e=>[e.m,e.kind,e.actor,e.place]));}
 const a=run(),b=run();ok('two runs with one seed log the same decisions',a===b&&a.length>10,a!==b);}

// 8. the audits and the export
{const {S}=world();S.REF={layer:'pedestrian',x:0,z:0};
 const au=S.audit();
 ok('the audit finds the unreachable market and the hour BUY wants more than it has',au.unroutable.indexOf('nowhere')>=0&&au.unknownActivities.length===0,au.unroutable.indexOf('nowhere')<0);
 const ex=S.export();
 ok('the export carries the format, the convention and every place',ex.format==='krator-sim'&&ex.convention.x==='east'&&ex.places.length===6&&!('occ' in ex.places[0]),ex.places.length!==6);
 const L=S.load({places:[{id:'market',activities:{BUY:3,SOCIALIZE:10,TRADE:4}},{id:'field',remove:true},{id:'well',kind:'well',x:10,z:10,activities:{IDLE:2}}]});
 const n0=S.problems.length;S.load({relations:[{a:'nomads',b:'raiders',stance:'wary'}],presence:[{faction:'nomads',settlement:'here',status:'TRADING'}]});
 ok('a relation and a presence load without an id (a>b, faction@settlement), as SCHEMA.md says',S.problems.length===n0&&S.get('relation','nomads>raiders')&&S.get('presence','nomads@here'),S.problems.length!==n0);
 ok('the overlay overrides a field, removes a record and adds one',S.get('place','market').activities.BUY===3&&!S.get('place','field')&&S.get('place','well')&&L.overridden===1&&L.removed===1&&L.added===1,!S.get('place','well'));}

// 9. a shared cap (Shade's quarters), ports in the audit, a build's own audit, homes by place id dealt round-robin
{const {S}=world();
 S.activity({id:'EAT'});S.place({id:'quarter',kind:'quarter',x:50,z:0,activities:{SLEEP:3,EAT:3},cap:3});
 const q=S.get('place','quarter'),x={id:'x'},y={id:'y'};S.reserve(x,q,'SLEEP');S.reserve(y,q,'SLEEP');
 ok('a cap is shared: two asleep leave room for one to EAT, not three',S.free(q,'EAT')===1&&S.free(q,'SLEEP')===1,S.free(q,'EAT')===3);
 S.release(x);S.release(y);
 // at 2:00, 6 want SLEEP (the 2 farmers and 4 sleepers) and 2 want EAT, which only the quarter offers, so it fills
 // first and leaves the quarter room for 1 sleeper: homeA 2 + homeB 2 + 1 = 5 of 6
 S.role({id:'sleeper',org:'folk',sched:[[0,'SLEEP']]});S.role({id:'eater',org:'folk',sched:[[0,'EAT']]});
 for(let i=0;i<4;i++)S.actor({id:'s'+i,role:'sleeper',home:'homeA'});for(let i=0;i<2;i++)S.actor({id:'e'+i,role:'eater',home:'homeA'});
 const c=S.audit().capacity.filter(e=>e.hour===2&&e.activity==='SLEEP');
 ok('the audit fills a capped place once over all its activities, scarcest first (SLEEP short 1 of 7 slots)',c.length===1&&c[0].short===1&&c[0].slots===7&&c[0].want===6,!c.length);
 q.cap=null;const c2=S.audit().capacity.filter(e=>e.hour===2&&e.activity==='SLEEP');
 ok('without the cap the same wants fit (a plain sum of slots)',!c2.length,c2.length);
 S.REF={layer:'pedestrian',x:0,z:0,ports:true};S.port({id:'island',x:400,z:400});
 const au=S.audit();ok('ports:true routes to the ports too (the island port is named, the east port is not)',au.unroutable.indexOf('port:island')>=0&&au.unroutable.indexOf('port:east')<0,au.unroutable.indexOf('port:island')<0);
 S.audits.push(o=>{o.mine={ok:true};});const au2=S.audit();ok('a build\'s audit adds its fields to the report',au2.mine&&au2.mine.ok,!au2.mine);}
{const {S}=world();
 S.all('actor').forEach(a=>S.remove('actor',a.id));S.remove('place','homeA');S.remove('place','homeB');
 S.place({id:'quarter',kind:'quarter',x:50,z:0,activities:{SLEEP:3,REST:3},cap:3});
 S.role({id:'sleeper',org:'folk',sched:[[0,'SLEEP']]});S.role({id:'rester',org:'folk',sched:[[0,'REST']]});
 for(let i=0;i<2;i++){S.actor({id:'s'+i,role:'sleeper',home:'quarter'});S.actor({id:'r'+i,role:'rester',home:'quarter'});}
 const c=S.audit().capacity.filter(e=>e.activity==='SLEEP');
 ok('a tie in scarcity fills the fallback activity last: 2 beds before 2 resting in a quarter of 3',!c.length,c.length);}
{const {S}=world();
 S.all('actor').forEach(a=>S.remove('actor',a.id));
 S.role({id:'kin',org:'folk',count:5,homes:['home'],sched:[[0,'SLEEP']]});
 S.role({id:'clan',org:'folk',count:5,homes:['homeB','homeA'],deal:'round',sched:[[0,'SLEEP']]});
 const P=S.populate({prefix:'q'}),homes=S.all('actor').filter(a=>a.role==='clan').map(a=>a.home).join(',');
 ok('a kind means every place of the kind, bounded by beds (kin: 4 beds for 5)',P.byRole.kin===4&&P.homeless.indexOf('kin')>=0,P.byRole.kin===5);
 ok('homes may name place ids; deal:round deals them in turn, past the beds (B,A,B,A,B)',homes==='homeB,homeA,homeB,homeA,homeB'&&P.byRole.clan===5,homes!=='homeB,homeA,homeB,homeA,homeB');}
// transport routes (77-sim-5r): stops on a layer, a round of dwells and legs, poses as a function of time
{const {S}=world();
 S.transport({id:'line',layer:'pedestrian',stops:['homeA','market','homeB'],speed:2,dwell:10,vehicles:2});
 const R=S.transportBake('line');
 ok('an open line runs out and back: 4 legs, 8 segments, period 10+80+10+55 twice',R.legs.length===4&&R.segments.length===8&&near(R.period,310,0.01),!near(R.period,310,0.01));
 ok('a dwell is a segment whose from === to (PLAN.md 4.3)',R.segments[0][2]==='homeA'&&R.segments[0][3]==='homeA'&&R.segments[1][2]==='homeA'&&R.segments[1][3]==='market',R.segments[0][2]!==R.segments[0][3]);
 const p0=S.vehiclePose('line',0,5),p1=S.vehiclePose('line',0,50);
 ok('standing at the first stop while it dwells',p0.at==='homeA'&&!p0.moving,p0.moving);
 ok('80 m along the street 40 s after leaving at 2 m/s',near(p1.x,80,0.5)&&near(p1.z,0,0.5)&&p1.moving&&p1.at===null,!p1.moving);
 const again=S.vehiclePose('line',0,50);ok('the same t gives the same pose',again.x===p1.x&&again.z===p1.z,again.x!==p1.x);
 const v1=S.vehiclePose('line',1,50),v0=S.vehiclePose('line',0,50+155);ok('two vehicles are half a round apart',near(v1.x,v0.x)&&near(v1.z,v0.z),!(near(v1.x,v0.x)&&near(v1.z,v0.z)));
 const wrap=S.vehiclePose('line',0,50+310);ok('the round repeats every period',near(wrap.x,p1.x)&&near(wrap.z,p1.z),!near(wrap.x,p1.x));
 S.transport({id:'loop',layer:'pedestrian',stops:['homeA','homeB','homeA'],speed:3,dwell:0});const L=S.transportBake('loop');
 ok('first stop === last makes a loop: no legs back, period 300 m / 3',L.loop&&L.legs.length===2&&near(L.period,100,0.01),!L.loop);
 S.transport({id:'in',layer:'pedestrian',stops:['port:west','market'],speed:2,dwell:10});const I=S.transportBake('in');
 ok('no dwell at a port; a vehicle by the port is off the map',I.segments[0][2]==='port:west'&&I.segments[0][2]!==I.segments[0][3]&&S.vehiclePose('in',0,1).offMap,!S.vehiclePose('in',0,1).offMap);
 S.transport({id:'lost',layer:'pedestrian',stops:['homeA','nowhere']});const F=S.transportBake('lost');
 ok('an unroutable leg is marked failed and drawn straight',F.legs[0].failed&&near(F.legs[0].path.len,Math.hypot(400,400),0.01),!F.legs[0].failed);
 ok('stopsServing names the routes that call at a stop',S.stopsServing('market').join()==='line,in',S.stopsServing('market').length!==2);
 S.load({transports:[{id:'bad',layer:'sky',stops:['homeA','ghost']}]});const pr=S.check();
 ok('check names an unknown layer and an unknown stop',pr.some(p=>/bad: unknown layer sky/.test(p))&&pr.some(p=>/bad: unknown stop ghost/.test(p)),!pr.length);
 const ex=S.export();ok('the export carries the routes with their segments',ex.transports.length===5&&ex.transports[0].segments.length===8,!ex.transports);}
// exclusive berths: two vehicles on an out-and-back line meet at the middle stop; the later one queues
{const {S}=world();
 const mk=(id,ex)=>{S.transport({id,layer:'pedestrian',stops:['homeA','market','homeB'],speed:2,dwell:40,vehicles:2,exclusive:ex,queueGap:20});return S.transportBake(id);};
 mk('free',false);mk('one',true);
 const both=(id)=>{let n=0,w=0;for(let t=0;t<6000;t+=1){const a=S.vehiclePose(id,0,t),b=S.vehiclePose(id,1,t);if(a.at==='market'&&b.at==='market')n++;if(a.waiting||b.waiting)w++;}return {n,w};};
 const f=both('free'),o=both('one');
 ok('without exclusive berths the two vehicles stand at the market together',f.n>0,f.n===0);
 ok('with them never together, and one waits its turn',o.n===0&&o.w>0,o.n>0);
 const q=S.vehiclePose('one',1,777),q2=S.vehiclePose('one',1,777);ok('a queued timetable is still a pure function of time',q.x===q2.x&&q.z===q2.z,q.x!==q2.x);
 S.transport({id:'two',layer:'pedestrian',stops:['homeA','market','homeB'],speed:2,dwell:40,vehicles:2,exclusive:true,berths:2,berthSide:5});S.transportBake('two');
 const t2=both('two');let side=false;for(let t=0;t<6000&&!side;t++){const a=S.vehiclePose('two',0,t),b=S.vehiclePose('two',1,t);if(a.at==='market'&&b.at==='market')side=Math.hypot(a.x-b.x,a.z-b.z)>9;}
 ok('with two berths both stand at the stop together, one each side',t2.n>0&&side&&t2.w===0,!side);
 S.transport({id:'onA',layer:'pedestrian',stops:['homeA','market','homeA'],speed:2,dwell:60,vehicles:2,exclusive:true});S.transport({id:'onB',layer:'pedestrian',stops:['homeB','market','homeB'],speed:2,dwell:60,vehicles:2,exclusive:true});
 S.transportBake('onA');S.transportBake('onB');const sep=()=>{let n=0;for(let t=0;t<8000;t++){let c=0;['onA','onB'].forEach(id=>{for(let k=0;k<2;k++)if(S.vehiclePose(id,k,t).at==='market')c++;});if(c>1)n++;}return n;};
 const before=sep();S.transportQueue(['onA','onB']);const after=sep();
 ok('two lines through one stop share its berth once queued together',before>0&&after===0,after>0);
 S.transport({id:'hw',layer:'pedestrian',stops:['homeA','homeB'],speed:2,dwell:10,headway:500});const H=S.transportBake('hw');
 ok('headway sets the number of vehicles (period / headway)',H.vehicles===Math.max(1,Math.round(H.period/500)),H.vehicles===Math.round(H.period/240)&&H.period/240>1.5);}

console.log(bad?bad+' FAILED':'all passed');if(bad&&typeof process!=='undefined')process.exit(1);
