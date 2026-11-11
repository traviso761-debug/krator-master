// node core/simulation/test-sim.js — the simulation core's contract on a toy world, each check with a negative.
// (This machine has no node: python <scratch>/jsrun.py core/sched/20-core-sched.js core/simulation/77-sim-*.js core/simulation/test-sim.js)
const fs=require('fs'),path=require('path');
global.window=global;
['77-sim-0-core.js','77-sim-1-world.js','77-sim-2-places.js','77-sim-3-actors.js','77-sim-4-nav.js','77-sim-5-motion.js','77-sim-5r-routes.js','77-sim-6-build.js','77-sim-6-economy.js','77-sim-6-govern.js','77-sim-6-items.js','77-sim-6-crime.js','77-sim-6-money.js','77-sim-6-needs.js','77-sim-6-population.js','77-sim-6-trade.js','77-sim-6-unrest.js','77-sim-7-stocks.js','77-sim-7-ledger.js','77-sim-7-lod.js','77-sim-8-export.js','77-sim-9-debug.js']
  .forEach(f=>(0,eval)(fs.readFileSync(path.join(__dirname,f),'utf8')));
let bad=0;const ok=(name,pass,neg)=>{const r=pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const near=(a,b,e)=>Math.abs(a-b)<(e||1e-6);

function world(seed){
  // a fresh SIM each time: re-evaluate the module
  ['77-sim-0-core.js','77-sim-1-world.js','77-sim-2-places.js','77-sim-3-actors.js','77-sim-4-nav.js','77-sim-5-motion.js','77-sim-5r-routes.js','77-sim-6-build.js','77-sim-6-economy.js','77-sim-6-govern.js','77-sim-6-items.js','77-sim-6-crime.js','77-sim-6-money.js','77-sim-6-needs.js','77-sim-6-population.js','77-sim-6-trade.js','77-sim-6-unrest.js','77-sim-7-stocks.js','77-sim-7-ledger.js','77-sim-7-lod.js','77-sim-8-export.js','77-sim-9-debug.js']
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
 ok('a public place lets a friendly org in and keeps a hostile one out',S.welcome('riders',P)&&!S.welcome('band',P),!S.welcome('riders',P));
 const H=S.get('place','homeA');H.access='private';
 ok('a private place lets in its own people only',S.welcome(S.get('actor','f1'),H)&&!S.welcome(S.get('actor','f2'),H),S.welcome(S.get('actor','f2'),H));
 H.guests={SOCIALIZE:200};
 ok('a house that takes guests for an activity lets a neighbour in for it (home B 150 m off), and only for it',S.welcome(S.get('actor','f2'),H,'SOCIALIZE')&&!S.welcome(S.get('actor','f2'),H,'SLEEP'),S.welcome(S.get('actor','f2'),H,'SLEEP'));
 H.guests={SOCIALIZE:100};ok('a neighbour farther than its guests\' reach is not let in',!S.welcome(S.get('actor','f2'),H,'SOCIALIZE'),S.welcome(S.get('actor','f2'),H,'SOCIALIZE'));}

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

{world(17);const S=window.SIM, ps=[{type:'rack'},{type:'bed'},{type:'bed'},{type:'table'}];
 const base=S.slotsFromFurniture(ps), own=S.slotsFromFurniture(ps,{rack:'DRAW_TOOLS',table:null});
 ok('a world\'s own map reads a piece the core does not (a rack as DRAW_TOOLS)',own.DRAW_TOOLS===1&&own.SLEEP===2,base.DRAW_TOOLS!=null);
 ok('a key the map sets to null is no activity there, the rest as the core reads them',own.EAT==null&&base.EAT===1&&base.SLEEP===2,own.EAT===1);}

// a stacked layer: a point's height picks its level (a terrace over a street), only when the layer asks for it
{world(19);const S=window.SIM, nodes=[{id:'g',x:0,y:0,z:0},{id:'t',x:3,y:20,z:0}];
 S.nav.layer('stack',{nodes,edges:[],yWeight:3});S.nav.layer('flat',{nodes,edges:[]});
 const up=S.nav.nearest('stack',0,0,{y:20}), flat=S.nav.nearest('flat',0,0,{y:20}), noY=S.nav.nearest('stack',0,0);
 ok('on a yWeight layer a point 20 m up finds the terrace node, not the street under it',up===1&&noY===0,up===0);
 ok('a layer without yWeight ignores the height (as before)',flat===0,flat===1);}

// a field: every node's cost from its nearest source, and which source; nothing past max, nothing off the graph
{const {S}=world(23);const F=S.nav.field('pedestrian',[{node:0},{node:3,d:5}]);
 ok('the field labels each node with its nearest source (node 1 from 0 at 50, node 4 from 3 at 5+50+60)',F.src[1]===0&&near(F.d[1],50)&&F.src[4]===1&&near(F.d[4],115),F.src[4]===0);
 ok('an island node is not reached',F.src[5]===-1&&F.d[5]===Infinity,F.src[5]>=0);
 const G=S.nav.field('pedestrian',[{node:0}],{max:60});
 ok('past max nothing is labelled',G.src[1]===0&&G.src[2]===-1,G.src[2]===0);}

// the week: named schedules by weekday, an actor's rota day off
{const {S}=world(29);
 S.activity({id:'WORK'});
 S.role({id:'hand',org:'folk',scheds:{work:[[0,'SLEEP'],[6,'WORK'],[18,'SOCIALIZE'],[22,'SLEEP']],off:[[0,'SLEEP'],[8,'SOCIALIZE'],[22,'SLEEP']],rest:[[0,'SLEEP'],[9,'REST'],[22,'SLEEP']]},week:['work','work','work','work','work','work','rest']});
 const a=S.actor({id:'h1',role:'hand',home:'homeA',off:2}),b=S.actor({id:'h2',role:'hand',home:'homeB'});
 const at=(d,h)=>d*1440+h*60;
 ok('on a workday the role works; on its rota day off (day 2) the actor takes the off schedule',S.desire(a,at(1,10))==='WORK'&&S.desire(a,at(2,10))==='SOCIALIZE'&&S.desire(b,at(2,10))==='WORK',S.desire(a,at(2,10))==='WORK');
 ok('the rest day (weekday 6) holds for both; the week repeats (day 9 is weekday 2)',S.desire(a,at(6,10))==='REST'&&S.desire(b,at(6,10))==='REST'&&S.desire(a,at(9,10))==='SOCIALIZE',S.desire(b,at(6,10))==='WORK');
 const c=S.actor({id:'h3',role:'hand',home:'homeA',alias:{rest:'off'}}),c2=S.actor({id:'h4',role:'hand',home:'homeA',alias:{rest:'nosuch'}});
 ok('an alias makes the actor follow another of its role\'s schedules that day (rest -> off), an unknown one is ignored',S.desire(c,at(6,10))==='SOCIALIZE'&&S.desire(c2,at(6,10))==='REST',S.desire(c,at(6,10))==='REST');
 let threw=false;try{S.role({id:'bad',org:'folk',scheds:{work:[[0,'SLEEP']]},week:['work']});}catch(e){threw=true;}
 ok('a week that is not seven days throws',threw,!threw);}

// the place grid: limit and near give exactly the first places of the full nearest-first list
{const {S}=world(31);let same=0,tried=0,longer=0;
 for(let i=0;i<400;i++) S.place({id:'g'+i,kind:i%3?'shop':'inn',x:((i*7919)%2003)-1000,z:((i*104729)%1999)-1000,activities:{BUY:1+(i%4),SOCIALIZE:i%5}});
 for(let k=0;k<60;k++){const nr=[((k*389)%1800)-900,((k*733)%1800)-900],act=k%2?'BUY':'SOCIALIZE',kinds=k%3?null:['inn'];
  const full=S.placesFor(act,null,null,{near:nr,kinds}),lim=S.placesFor(act,null,null,{near:nr,kinds,limit:4});tried++;
  if(full.length>4) longer++; if(lim.length===Math.min(4,full.length)&&lim.every((P,j)=>P===full[j])) same++;}
 ok('the grid gives the first places of the full list, every time',same===tried,same<tried);
 ok('and the full list is longer (the grid looked at fewer)',longer>0,longer===0);
 const far=S.placesFor('BUY',null,null,{near:[0,0],limit:50,maxR:150}),all=S.placesFor('BUY',null,null,{near:[0,0],limit:50});
 ok('maxR returns nothing farther than it',far.every(P=>Math.hypot(P.x,P.z)<=150)&&far.length<all.length,far.length===all.length);
 ok('an activity no place offers is answered at once, empty',S.placesFor('FLY',null,null,{near:[0,0],limit:3}).length===0,false);}

// lazy routes: decided without the path, found when first asked, the arrival kept; an island still cannot be chosen
{const {S,clock}=world(37);S.lazy={pedestrian:{detour:1.35}};
 clock.h=6;clock.t=0;S.step();
 const a=S.get('actor','f1'),T=a.task,L=T.legs[0];
 ok('a lazy leg has no path at decision time, its duration from the straight line',L.route===null&&!!L.lazy&&near(T.dur,(150*1.35+0.5)/a.speed,0.01),L.route!==null);
 const mid=S.pose(a,T.t0+T.dur/2);
 ok('posing it finds the path (150 m) and keeps the arrival: half way at half the time',L.route&&near(L.route.len,150,0.01)&&near(mid.x,75,0.5)&&near(T.arrive,T.t0+T.dur,1e-6),!L.route);
 const nowhere=S.get('place','nowhere'),f=S.leg('pedestrian',{x:0,z:0},nowhere.door,1.3,'walk',0);
 ok('a place on another body is unreachable without searching (the bodies differ)',f===null,f!==null);
 const b=S.get('actor','f2'),Tb=b.task,Lb=Tb.legs[0],q=S.pose(b,Tb.t0+Tb.dur/2,{cheap:true});
 ok('a cheap pose (a decision asking where its actor is) reads the straight line and leaves the path unfound',Lb.route===null&&Number.isFinite(q.x),Lb.route!==null);
 S.pose(b,Tb.t0+Tb.dur/2);ok('a drawn pose finds it',Lb.route!==null,Lb.route===null);}


// needs (77-sim-6-needs.js): opt-in; lazy meters with the trip; happiness with traits; the free-time clause; the
// interrupt; the decision's hook; the census
{const {S,clock}=world(41);
 ['WORK','DRINK'].forEach(a=>S.activity({id:a}));
 S.place({id:'well',kind:'well',x:50,z:0,activities:{DRINK:4}});
 S.role({id:'idler',org:'folk',sched:[[0,'SLEEP'],[8,'SOCIALIZE'],[20,'SLEEP']],prefers:{SLEEP:{pin:'home'},REST:{pin:'home'}}});
 S.role({id:'hand',org:'folk',sched:[[0,'SLEEP'],[6,'WORK'],[18,'SOCIALIZE'],[21,'SLEEP']],prefers:{SLEEP:{pin:'home'},WORK:{pin:'work'}},needs:{labour:1}});
 S.role({id:'clerk',org:'folk',sched:[[0,'SLEEP'],[6,'WORK'],[18,'SOCIALIZE'],[21,'SLEEP']],prefers:{SLEEP:{pin:'home'},WORK:{pin:'work'}}});
 S.place({id:'yard',kind:'field',x:100,z:0,activities:{WORK:4}});
 const i1=S.actor({id:'i1',role:'idler',home:'homeA'}),h1=S.actor({id:'h1',role:'hand',home:'homeA',work:'yard'}),c1=S.actor({id:'c1',role:'clerk',home:'homeA',work:'yard'});
 const at=(h,d)=>(d||0)*1440+h*60;
 ok('without SIM.needs the schedule decides alone',!S.NEED&&S.desire(i1,at(10))==='SOCIALIZE',!!S.NEED);
 S.needs({list:['eat','drink','socialize','sleep'],rate:{eat:6,drink:4,socialize:3,sleep:4},work:{drink:6},
   fill:{SLEEP:{sleep:12},REST:{sleep:20},SOCIALIZE:{socialize:30},DRINK:{drink:200},BUY:{eat:60}},
   free:['SOCIALIZE','REST'],dwell:60,keep:1.2,done:10,interrupt:{drink:{at:70,act:'DRINK',until:20,max:40,cool:60}},
   bands:[{label:'content',min:70,eff:1},{label:'unhappy',min:0,eff:0.7}],loyalty:{tau:600,bands:[{label:'loyal',min:50},{label:'disloyal',min:0}]},
   traits:{chatty:{socialize:1.5}},secPerMinute:1,pain:1.5});
 // the lazy meters
 const M=at(10);i1.nd=[50,50,50,50];i1.ndT=M;i1.ndFrom=M+30;i1.activity='SOCIALIZE';
 const pk=S.needsPeek(i1,M+90);ok('needsPeek reads the meters then and leaves the actor as it was',i1.ndT===M&&i1.nd[2]===50&&near(pk[2],50+3*0.5-27,1e-6)&&near(S.happiness(i1,pk),S.happiness(Object.assign({},i1,{nd:pk})),1e-9),i1.ndT!==M);
 S.needsOf(i1,M+90);
 ok('a meter rises on the way and falls by its activity once there (30 min trip, 60 there)',near(i1.nd[2],50+3*0.5-27,1e-6)&&near(i1.nd[0],50+6*1.5,1e-6),near(i1.nd[2],50+(3-30)*1.5,1e-6));
 // happiness
 i1.nd=[0,0,0,0];ok('every need met: happiness 100',near(S.happiness(i1),100),false);
 i1.nd=[0,0,100,0];const h0=S.happiness(i1);i1.trait='chatty';const h1v=S.happiness(i1);i1.trait=null;
 ok('one meter full of four: 75; a chatty actor minds the same unmet company more',near(h0,75,1e-6)&&h1v<h0,h1v>=h0);
 ok('the band gives the efficiency',S.mood(i1).band==='content'&&S.efficiency(i1)===1,S.efficiency(i1)!==1);
 // the free-time clause
 clock.d=0;clock.h=10;i1.ndT=at(10);i1.ndFrom=at(10);i1.activity='SOCIALIZE';i1.fr=null;i1.nd=[0,0,10,90];
 const tired=S.desire(i1,at(10));i1.fr=null;i1.nd=[0,0,90,10];const lonely=S.desire(i1,at(10));
 ok('free time: the tired rest at home, the lonely go out',tired==='REST'&&lonely==='SOCIALIZE',tired===lonely);
 i1.nd=[0,0,10,90];clock.h=10.5;const held=S.desire(i1,at(10)+30);clock.h=10+61/60;const later=S.desire(i1,at(10)+61);
 ok('the choice holds its dwell, then the meters are asked again',held==='SOCIALIZE'&&later==='REST',held!=='SOCIALIZE');
 ok('outside free time the schedule stands',S.desire(i1,at(2))==='SLEEP',false);
 // a question about another minute changes nothing
 {const nd0=i1.nd.slice(),T0=i1.ndT,fr0=i1.fr;clock.d=0;clock.h=10;S.desire(i1,at(10,6));
  ok('asking what the actor will want days ahead leaves its meters and its choice alone',i1.ndT===T0&&i1.nd.every((v,j)=>v===nd0[j])&&i1.fr===fr0,i1.ndT!==T0);}
 // the interrupt: the labourer goes to the well, the clerk does not
 clock.h=12;[h1,c1].forEach(a=>{a.nd=[0,80,0,0];a.ndT=at(12);a.ndFrom=at(12);a.activity='WORK';});
 const hw=S.desire(h1,at(12)),cw=S.desire(c1,at(12));
 ok('a labourer thirsty at work goes for a drink, a clerk keeps working',hw==='DRINK'&&cw==='WORK',hw==='WORK');
 h1.activity='DRINK';h1.ndFrom=at(12);clock.h=12+20/60;const back=S.desire(h1,at(12)+20);
 ok('once drunk, back to work',back==='WORK'&&S.needsOf(h1,at(12)+20)[1]<=20,back!=='WORK');
 clock.h=12+40/60;ok('and not again before its cool-down',(h1.nd[1]=90,h1.activity='WORK',S.desire(h1,at(12)+40))==='WORK',false);
 // an interrupt with nowhere to go ends (the well closed): back to work, not left wanting a drink
 {const W=S.R.place.well;W.closed=true;clock.d=0;clock.h=14;h1.intr=null;h1.intrCool=0;h1.nd=[0,90,0,0];h1.ndT=S.minute();h1.ndFrom=S.minute();h1.activity='WORK';h1.wanted=null;
  S.decide(h1,S.minute(),clock.t);const back2=S.desire(h1,S.minute());W.closed=false;
  ok('an interrupt no place takes is dropped and cools down: the labourer works on',h1.intr===null&&h1.intrCool>S.minute()&&back2==='WORK',h1.intr!==null);}
 // the decision's hook: the trip counts, then the place fills
 clock.d=1;clock.h=10;clock.t=0;i1.nd=[0,0,90,0];i1.trait=null;S.jump();
 const s0=S.needsOf(i1,S.minute())[2],T=i1.task;
 for(let m=1;m<=90;m++){clock.h=10+m/60;clock.t+=1;S.step();}
 const s1=S.needsOf(i1,S.minute())[2];
 ok('stepped: the lonely idler went out to socialize and its meter fell',i1.activity==='SOCIALIZE'&&s1<s0-20,s1>=s0);
 // a free-time choice no place takes settles for what it got (not left wanting it)
 S.place({id:'cell',kind:'cell',x:0,z:0,activities:{SOCIALIZE:1},open:[0,1]});
 clock.h=11;S.R.place.market.closed=true;i1.nd=[0,0,95,0];i1.fr=null;i1.wanted=null;S.decide(i1,S.minute(),clock.t);
 ok('a free choice with nowhere open settles for its fallback, and wants what it got',i1.activity!=='SOCIALIZE'&&i1.wanted===i1.activity&&i1.fr===i1.activity,i1.wanted==='SOCIALIZE');
 S.R.place.market.closed=false;
 const C=S.needsCensus(a=>a.role);
 ok('the census by role: counts, happiness, means, the high meters',C.idler&&C.idler.n===1&&C.hand.n===1&&typeof C.idler.mean.socialize==='number'&&C.idler.happy>0,!C.idler);
 ok('loyalty drifts toward happiness',i1.loyal!=null&&Math.abs(i1.loyal-S.happiness(i1))<100,i1.loyal==null);}


// items (77-sim-6-items.js): the slots, wear and spares, errands to the nearest seller in free time or in work time, a
// shop nobody has, meals from the household's store, the food errand, a hurt and its poultice
{const {S,clock}=world(53);
 ['WORK','EAT'].forEach(a=>S.activity({id:a}));
 S.place({id:'yard',kind:'field',x:100,z:0,activities:{WORK:4}});
 S.place({id:'smith',kind:'shop',x:50,z:0,activities:{BUY:3},open:[6,20]});
 S.place({id:'cot',kind:'home',x:0,z:0,activities:{SLEEP:3,EAT:3,REST:3}});S.R.place.cot.people=2;
 S.role({id:'idler',org:'folk',sched:[[0,'SLEEP'],[8,'SOCIALIZE'],[12,'EAT'],[13,'SOCIALIZE'],[20,'SLEEP']],prefers:{SLEEP:{pin:'home'},EAT:{pin:'home'}}});
 S.role({id:'hand',org:'folk',sched:[[0,'SLEEP'],[6,'WORK'],[18,'SOCIALIZE'],[21,'SLEEP']],prefers:{SLEEP:{pin:'home'},WORK:{pin:'work'}}});
 ok('without SIM.items there are no errands',!S.ITEMS&&S.desire(S.actor({id:'x0',role:'idler',home:'cot'}),600)==='SOCIALIZE',!!S.ITEMS);
 S.items({kinds:{shirt:{cat:'clothes',slot:'torso',life:2},trousers:{cat:'clothes',slot:'legs',life:50},shoes:{cat:'clothes',slot:'feet',life:50},
   cuirass:{cat:'armour',slot:'torso',layer:'armour',life:200},boots:{cat:'armour',slot:'feet',life:200},helm:{cat:'armour',slot:'head',life:200},
   hoe:{cat:'tool',workLife:2},poultice:{cat:'medicine'},kayak:{cat:'gear'},corn:{cat:'food',food:true},fish:{cat:'food',food:true},trinket:{cat:'luxury',material:20}},
   free:['SOCIALIZE'],secPerMinute:1,mins:10,cool:60,hurt:0,heal:3,low:1,days:2});
 const run=(d,h0,h1)=>{clock.d=d;for(let m=h0*60;m<h1*60;m++){clock.h=m/60;clock.t+=1;S.step();}};
 // the slots
 const a=S.actor({id:'i1',role:'idler',home:'cot'});
 S.equip(a,'shirt',0.6);S.equip(a,'cuirass');S.equip(a,'shoes');S.equip(a,'boots');S.equip(a,'helm');
 ok('one clothing and one armour item on the torso; boots take the feet and the shoes go home',a.eq.torso.k==='shirt'&&a.eq['torso+'].k==='cuirass'&&a.eq.feet.k==='boots'&&a.inv.shoes===1&&S.itemsCheck(a).length===0,S.itemsCheck(a).length>0);
 const bad={eq:{torso:{k:'cuirass',w:0}}};ok('a cuirass worn as a shirt is caught',S.itemsCheck(bad).length===1,S.itemsCheck(bad).length===0);
 // wear and the spare, then the set short
 a.wears=['shirt'];a.sets=2;S.give(a,'shirt',1);a.itDay=0;clock.d=1;clock.h=1;S.desire(a,S.minute());
 ok('a worn-out shirt goes and the spare from home takes its place',a.eq.torso&&a.eq.torso.w===0&&!a.inv.shirt&&S.ITEMS.stats.worn.shirt===1,!a.eq.torso||a.eq.torso.w!==0);
 ok('a set short: no seller, so nothing to go for (and it is said)',!a.errand&&S.ITEMS.stats.noShop.shirt===1,!!a.errand);
 S.shop('smith',['shirt','hoe','poultice','corn','fish','trinket']);
 a.itDay=1;clock.d=2;clock.h=1;S.desire(a,S.minute());
 ok('with a seller, the short set is an errand for time off',a.errand&&a.errand.item==='shirt'&&a.errand.when==='free',!a.errand);
 clock.h=2;ok('not while asleep',S.desire(a,S.minute())==='SLEEP',false);
 {const sm=S.R.place.smith;sm.closed=true;clock.h=8;const w1=S.desire(a,S.minute());sm.closed=false;clock.h=8.5;const w2=S.desire(a,S.minute());clock.h=9;const w3=S.desire(a,S.minute());
  ok('the errand waits while no seller is open (asked once an hour), and goes when one is',w1==='SOCIALIZE'&&w2==='SOCIALIZE'&&w3==='BUY',w1==='BUY');}
 run(2,8,11);
 ok('in free time it walks to the seller, buys, and the shirt is its own',!a.errand&&S.owns(a,'shirt')===2&&S.ITEMS.stats.bought.shirt===1&&S.ITEMS.stats.byShop.smith.shirt===1,S.owns(a,'shirt')!==2);
 // a tool worn out at work: replaced during work time
 const h=S.actor({id:'h1',role:'hand',home:'cot',work:'yard'});h.tool={k:'hoe',w:0.9};h.itDay=3;
 run(3,5,9);
 ok('a hoe worn out at work is bought during the shift and work goes on',S.ITEMS.stats.brokenAtWork===1&&S.ITEMS.stats.replacedAtWork===1&&h.tool&&h.tool.k==='hoe'&&h.activity==='WORK',S.ITEMS.stats.replacedAtWork!==1);
 h.toolNeed='hoe';ok('a missing tool halves the worker',S.itemsEff(h)===0.5,S.itemsEff(h)===1);h.toolNeed=null;
 // meals from the store
 const H=S.R.place.cot;H.store={corn:2,fish:2};a.errand=null;clock.d=4;clock.h=12;a.wanted=null;S.decide(a,S.minute(),clock.t);
 const b1=a.boost.EAT,left=H.store.corn+H.store.fish;H.store={corn:1};a.wanted=null;S.decide(a,S.minute()+1,clock.t);const b2=a.boost.EAT;H.store={};a.wanted=null;S.decide(a,S.minute()+2,clock.t);const b3=a.boost.EAT;
 ok('two foods make a meal (x3), one food a bite (x1), an empty store scraps',b1===3&&left===2&&b2===1&&b3===0.2,b1===b2);
 // the household's food errand
 H.store={corn:1};H.shopper=null;a.errand=null;a.errCool=0;run(4,13,16);
 ok('a low store sends one of the household to buy days of food; the store is filled',(H.store.corn||0)+(H.store.fish||0)>=8&&S.ITEMS.stats.done.food>=1,(H.store.corn||0)<=1);
 // a hurt, and the poultice
 S.ITEMS.hurt=1;h.workedDay=5;h.hurt=null;h.itDay=5;h.errand=null;clock.d=6;clock.h=17;S.desire(h,S.minute());
 ok('a worked day can end hurt; the worker means to buy a poultice on time off',h.hurt===6&&h.errand&&h.errand.item==='poultice',h.hurt==null);
 ok('hurt, it works at 0.7',S.itemsEff(h)===0.7,S.itemsEff(h)===1);
 run(6,18,21);
 ok('the poultice bought, it is well',h.hurt==null&&S.ITEMS.stats.poultice===1,h.hurt!=null);
 // a treat: with needs, a high material meter buys what the wealth reaches, and the meter falls
 S.needs({list:['material'],rate:{material:1},fill:{}});S.ITEMS.treat={at:50,items:[[0,'trinket'],[0.9,'kayak']]};
 a.wealth=0.5;a.wears=[];a.nd=[80];a.ndT=null;a.errand=null;a.errCool=0;a.itDay=6;a.hurt=null;clock.d=7;clock.h=1;S.desire(a,S.minute());
 ok('a high material meter means a treat its wealth reaches (not the rich one)',a.errand&&a.errand.item==='trinket',!a.errand);
 run(7,8,11);
 ok('bought, the material meter falls by its worth',S.ITEMS.stats.bought.trinket===1&&a.nd[0]<70,S.ITEMS.stats.bought.trinket!==1);
 // issued: a worn-out item is replaced by its keeper, and no errand is run
 {const sl=S.actor({id:'sl',role:'hand',home:'cot',work:'yard'});sl.issued=true;sl.wears=['shirt'];sl.sets=2;S.equip(sl,'shirt',0.9);sl.itDay=8;sl.hurt=null;clock.d=9;clock.h=1;S.desire(sl,S.minute());
  ok('an issued actor gets its worn-out shirt replaced and runs no errand for the set short',sl.eq.torso&&sl.eq.torso.w===0&&!sl.errand&&S.ITEMS.stats.issued.shirt===1,!!sl.errand);}
 // eating out: at a meal's start, at a seller of 'meal' (by the hash and wealth, or for an empty store); none open: home
 {S.ITEMS.kinds.meal={id:'meal',cat:'meal'};S.place({id:'inn',kind:'tavern',x:50,z:0,activities:{EAT:5},open:[10,22]});S.shop('inn',['meal']);
  const e=S.actor({id:'e1',role:'idler',home:'cot'});e.itDay=10;S.R.place.cot.store={corn:9,fish:9};S.ITEMS.eatOut={base:1,wealth:0};
  clock.d=10;clock.h=11.5;e.activity='SOCIALIZE';run(10,11.9,12.5);
  ok('a meal out: the actor eats at the inn, a full meal bought',e.activity==='EAT'&&e.place==='inn'&&e.boost.EAT===3&&S.ITEMS.stats.meals.bought>=1,e.place==='cot');
  run(10,12.5,13.2);ok('and the errand ends with the meal hour',!e.errand&&S.ITEMS.stats.done.meal>=1,!!e.errand);
  S.ITEMS.eatOut={base:0,wealth:0};run(11,11.9,12.5);
  ok('with no wish to eat out and food at home, it eats at home',e.activity==='EAT'&&e.place==='cot',e.place==='inn');
  S.R.place.cot.store={};S.ITEMS.eatOut={base:0,wealth:0};S.R.place.inn.closed=true;run(12,11.9,12.5);S.R.place.inn.closed=false;
  ok('an empty store and the inn shut: scraps at home, no meal out left waiting',e.activity==='EAT'&&e.place==='cot'&&!(e.errand&&e.errand.item==='meal'),e.place==='inn');}
 // kayaks: a hut on the water reached through a landing by the boat's own layer, and left the same way
 {S.nav.layer('kayak',{route:(ax,az,bx,bz)=>({pts:[[ax,0,az],[bx,0,bz]]})});
  S.place({id:'hut',kind:'hut',x:0,z:120,activities:{SLEEP:2},layer:'kayak',via:'boat'});S.place({id:'land',kind:'landing',x:100,z:60,activities:{BOARD:50}});
  S.role({id:'grower',org:'folk',sched:[[0,'SLEEP'],[8,'SOCIALIZE'],[20,'SLEEP']],prefers:{SLEEP:{pin:'home'}}});
  const g=S.actor({id:'g1',role:'grower',home:'hut'});g.boat={dock:'land',layer:'kayak'};g.inVehicle='boat';g.pos={x:0,y:0,z:120};
  clock.d=13;clock.h=8;const T1=S.plan(g,S.R.place.market,'SOCIALIZE',{x:0,y:0,z:120},clock.t);
  ok('from the hut: by kayak to the landing, then on foot',T1.legs.length===2&&T1.legs[0].layer==='kayak'&&T1.legs[0].mode==='boat'&&T1.legs[1].layer==='pedestrian'&&!g.inVehicle,T1.legs[0].layer==='pedestrian');
  const T2=S.plan(g,S.R.place.hut,'SLEEP',{x:100,y:0,z:60},clock.t);
  ok('home: on foot to the landing, then by kayak to the hut',T2.legs.length>=1&&T2.legs[T2.legs.length-1].layer==='kayak'&&g.inVehicle==='boat',T2.legs[T2.legs.length-1].layer!=='kayak');
  // asked again on the way home while still on foot (an interrupt, a wake, a jump): its plan set inVehicle for the trip's
  // end, but it is not afloat yet: on foot from where it stands, no kayak leg over the land (SIM.vehicleAt)
  g.inVehicle=null;const mk=S.R.place.market,T4=S.plan(g,S.R.place.hut,'SLEEP',{x:mk.x-60,y:0,z:mk.z},clock.t);g.task=T4;
  const tw=clock.t+T4.legs[0].dur*0.5,T5=S.plan(g,mk,'SOCIALIZE',S.pose(g,tw,{cheap:true}),tw);
  ok('asked again while still walking to the landing: on foot, no kayak leg from the street',T4.legs[0].layer==='pedestrian'&&T4.veh==='boat'&&T5.legs.length>0&&T5.legs.every(L=>L.layer!=='kayak')&&!g.inVehicle,T5.legs.some(L=>L.layer==='kayak'));
  g.task=T4;const ta=T4.t0+T4.dur+1,T6=S.plan(g,mk,'SOCIALIZE',S.pose(g,ta,{cheap:true}),ta);
  ok('and once it got there, afloat: by kayak to the landing first',T6.legs[0].layer==='kayak'&&T6.legs[0].mode==='boat',T6.legs[0].layer!=='kayak');
  g.task=null;g.inVehicle=null;}
 ok('the slots still hold after it all',S.all('actor').every(x=>S.itemsCheck(x).length===0),false);}

// the economy (77-sim-6-economy.js): production by worked hour and efficiency into the site's store up to its cap, the
// good most needed made, inputs from the warehouses, carts by the brief's order to the warehouse with least, purchases
// and meals drawn from the warehouses (a shop can be out), turnover and days left, an import sent and delivered
{const {S,clock}=world(71);
 ['WORK','EAT','HAUL'].forEach(a=>S.activity({id:a}));
 ok('without SIM.economy nothing is stocked',!S.ECON&&S.supply('corn',3)===3,!!S.ECON);
 S.place({id:'farm',kind:'field',x:150,z:0,activities:{WORK:6},open:[0,24]});
 S.place({id:'oven',kind:'bakery',x:100,z:60,activities:{WORK:2},open:[0,24]});
 S.place({id:'shed',kind:'warehouse',x:0,z:0,activities:{}});S.place({id:'barn',kind:'warehouse',x:150,z:0,activities:{}});
 S.place({id:'stall',kind:'shop',x:50,z:0,activities:{BUY:4},open:[0,24]});
 S.place({id:'mess',kind:'mess',x:0,z:0,activities:{EAT:9}});S.R.place.mess.mess=true;
 S.role({id:'grower',org:'folk',sched:[[0,'WORK']],prefers:{WORK:{pin:'work'}}});
 S.role({id:'carter',org:'folk',sched:[[0,'IDLE']]});
 S.economy({goods:{wheat:{},corn:{},bread:{},herbs:{import:{route:'river',lot:50}}},inputs:{bread:{wheat:2}},every:60,
   cart:{cap:30,load:5,unload:5,minLoad:5},imports:{days:3,scan:30},routes:{river:{minutes:90}},window:1,meal:{per:2,foods:['corn','bread']}});
 S.store('shed',{kind:'warehouse'});S.store('barn',{kind:'warehouse'});
 S.recipe('farm',{out:['wheat','corn'],rate:2,cap:40});S.recipe('oven',{out:['bread'],rate:1,cap:100});
 const ws=[0,1,2].map(i=>S.actor({id:'g'+i,role:'grower',home:'homeA',work:'farm'}));
 // production: three at work, two units an hour each; the good with fewest days left first (both unused: wheat, then by days)
 clock.d=0;const run=(h0,h1)=>{for(let m=h0*60;m<h1*60;m++){clock.h=(m%1440)/60;clock.d=Math.floor(m/1440);clock.t+=40;S.step();}};
 run(0,3);const F=S.R.place.farm;const made1=(F.stock.wheat||0)+(F.stock.corn||0);
 ok('three at work make about two units an hour each, into the field\'s store',made1>=8&&made1<=12,made1===0);
 run(3,10);ok('the store stops at its cap (and says so)',(F.stock.wheat||0)+(F.stock.corn||0)<=40&&S.ECON.blocked['full: field']>0,(F.stock.wheat||0)+(F.stock.corn||0)>40);
 // a cart: to the field, loads, to the warehouse with least of it
 const c=S.actor({id:'cart1',role:'carter',home:'homeA'});S.cart(c);S.R.place.barn.stock.wheat=100;
 run(10,14);
 ok('a cart hauls from the site to a warehouse (the one with less of it)',S.ECON.trips>=1&&(S.R.place.shed.stock.wheat||0)+(S.R.place.shed.stock.corn||0)>0,S.ECON.trips===0);
 ok('the stepper leaves the cart to the economy',c.activity==='HAUL'&&c.wanted==null,c.wanted!=null);
 // consumption: a purchase draws on the warehouses; whole or nothing
 const b0=S.stockOf('wheat');const got=S.supply('wheat',5);
 ok('a draw takes from the warehouses (the fullest first)',got===5&&S.stockOf('wheat')===b0-5&&S.ECON.used.wheat>=5,got!==5);
 ok('a whole draw with too little takes nothing',S.supply('herbs',1,true)===0&&S.ECON.short.herbs===1,S.supply('herbs',1,true)!==0);
 // inputs: bread from wheat at the oven, from the warehouses
 S.actor({id:'bk',role:'grower',home:'homeA',work:'oven'});const u0=S.ECON.used.wheat||0;run(14,17);
 ok('bread is baked from the warehouses\' wheat, two a loaf',(S.R.place.oven.stock.bread||0)>=2&&S.ECON.used.wheat-u0===2*S.R.place.oven.stock.bread,(S.R.place.oven.stock.bread||0)===0);
 // meals at a mess
 S.R.place.shed.stock.corn=10;const c0=S.stockOf('corn')+S.stockOf('bread');
 ok('a meal out takes two units of food from the warehouses',S.economyMeal()&&c0-(S.stockOf('corn')+S.stockOf('bread'))===2,!S.economyMeal());
 // days left and the import
 S.R.place.shed.stock.herbs=0;S.R.place.barn.stock.herbs=2;S.supply('herbs',1);
 ok('days left: the stock over the day\'s use',S.economyDays('herbs')>0&&S.economyDays('herbs')<3,S.economyDays('herbs')===Infinity);
 run(17,18);ok('under three days: an import is sent by its route',S.ECON.inflight.length===1&&S.ECON.inflight[0].good==='herbs',S.ECON.inflight.length!==1);
 run(18,20);ok('and delivered to the warehouse with least of it after the route\'s minutes',S.ECON.imported.herbs===50&&S.ECON.inflight.length===0&&S.R.place.shed.stock.herbs===50,S.ECON.imported.herbs!==50);
 const R=S.economyReport();ok('the report: per good, the carts, the sites',R.goods.herbs.imported===50&&R.goods.wheat.made>0&&R.sites.length===2&&Object.keys(R.carts).length>=1,!R.goods.herbs);
 // the items module: a purchase of an item made of a good the warehouses lack fails and cools
 S.items({kinds:{poultice:{cat:'medicine',good:'herbs',per:60},corn:{cat:'food',food:true}},free:['IDLE'],secPerMinute:1,mins:5,cool:60,hurt:0});
 S.shop('stall',['poultice','corn']);S.role({id:'sick',org:'folk',sched:[[0,'IDLE']]});
 const p=S.actor({id:'p1',role:'sick',home:'homeA'});p.hurt=0;p.itDay=Math.floor(S.minute()/1440);S.errand(p,'poultice');run(20,22);
 ok('out of the herbs a poultice takes: the errand fails, nothing bought',S.ITEMS.stats.outOf.poultice===1&&!S.ITEMS.stats.bought.poultice&&p.hurt!=null,S.ITEMS.stats.bought.poultice===1);}

// two settlements on one page (P7a, settlements/isle-demo/PLAN.md section 9): each its own economy, warehouses, carts
// and books; a cart works only its own town; a draw takes only from the settlement named; the stocks split by town
{const {S,clock}=world(91);
 ['WORK','HAUL','UNLOAD','EAT'].forEach(a=>S.activity({id:a}));
 S.settlement({id:'kautoa',faction:'town'});S.settlement({id:'valapo',faction:'town'});
 S.place({id:'kFarm',kind:'field',x:0,z:0,activities:{WORK:6},open:[0,24],settlement:'kautoa'});
 S.place({id:'kShed',kind:'warehouse',x:50,z:0,activities:{},settlement:'kautoa'});
 S.place({id:'kMess',kind:'mess',x:50,z:0,activities:{EAT:9},settlement:'kautoa'});S.R.place.kMess.mess=true;
 S.place({id:'vFarm',kind:'field',x:150,z:0,activities:{WORK:6},open:[0,24],settlement:'valapo'});
 S.place({id:'vShed',kind:'warehouse',x:100,z:0,activities:{},settlement:'valapo'});
 S.place({id:'kHome',kind:'home',x:0,z:0,activities:{SLEEP:4},settlement:'kautoa'});S.place({id:'vHome',kind:'home',x:150,z:0,activities:{SLEEP:4},settlement:'valapo'});
 S.role({id:'grower',org:'folk',sched:[[0,'WORK']],prefers:{WORK:{pin:'work'}}});S.role({id:'carter',org:'folk',sched:[[0,'IDLE']]});
 const cfg=()=>({goods:{rice:{},coffee:{}},every:60,window:1,cart:{cap:30,load:5,unload:5,minLoad:5},meal:{per:2,foods:['rice','coffee']}});
 let threw=false;
 const EK=S.economy(cfg(),{settlement:'kautoa'}),EV=S.economy(cfg(),{settlement:'valapo'});
 try{S.economy(cfg());}catch(e){threw=true;}
 ok('a page that keys its economies refuses an unkeyed one, and each settlement has its own',threw&&S.econ('kautoa')===EK&&S.econ('valapo')===EV&&EK!==EV,!threw);
 S.store('kShed',{kind:'warehouse'});S.store('vShed',{kind:'warehouse'});
 S.recipe('kFarm',{out:['rice'],rate:2,cap:200});S.recipe('vFarm',{out:['coffee'],rate:2,cap:200});
 ok('a store and a recipe go to their place\'s settlement',EK.warehouses.length===1&&EK.warehouses[0].id==='kShed'&&EV.warehouses[0].id==='vShed'&&EK.recipes.kFarm&&!EK.recipes.vFarm&&EV.recipes.vFarm,!!EK.recipes.vFarm);
 [0,1,2].forEach(i=>S.actor({id:'kg'+i,role:'grower',home:'kHome',work:'kFarm'}));[0,1,2].forEach(i=>S.actor({id:'vg'+i,role:'grower',home:'vHome',work:'vFarm'}));
 const kc=S.actor({id:'kc',role:'carter',home:'kHome'}),vc=S.actor({id:'vc',role:'carter',home:'vHome'});S.cart(kc);S.cart(vc);
 ok('a cart belongs to its home\'s settlement',EK.carts.indexOf(kc)>=0&&EV.carts.indexOf(vc)>=0&&EK.carts.indexOf(vc)<0,EK.carts.indexOf(vc)>=0);
 clock.d=0;const run=(h0,h1)=>{for(let m=h0*60;m<h1*60;m++){clock.h=(m%1440)/60;clock.d=Math.floor(m/1440);clock.t+=40;S.step();}};
 run(0,12);
 ok('each town makes and books its own goods (Kautoa rice, Valapo coffee), and neither books the other\'s',
   EK.made.rice>0&&!EK.made.coffee&&EV.made.coffee>0&&!EV.made.rice,!!EK.made.coffee);
 const kh=S.R.place.kShed.stock,vh=S.R.place.vShed.stock;
 ok('a cart hauls only within its own town: Kautoa\'s shed holds rice, Valapo\'s coffee, never the other',
   (kh.rice||0)>0&&!(kh.coffee)&&(vh.coffee||0)>0&&!(vh.rice),!!kh.coffee||!!vh.rice);
 const k0=S.stockOf('rice','kautoa'),v0=S.stockOf('rice','valapo'),got=S.supply('rice',5,false,'kautoa'),none=S.supply('rice',5,true,'valapo');
 ok('a draw takes only from the settlement named (Valapo has no rice to give)',got===5&&S.stockOf('rice','kautoa')===k0-5&&none===0&&v0===0&&EV.short.rice===5,got!==5);
 S.items({kinds:{rice:{cat:'food',food:true}},free:['IDLE'],secPerMinute:1,mins:5,cool:60,hurt:0});
 const kRice=S.stockOf('rice','kautoa');const meals=S.withEcon('kautoa',()=>S.economyMeal());
 ok('a meal at Kautoa\'s mess takes from Kautoa\'s store',meals&&S.stockOf('rice','kautoa')<kRice&&S.stockOf('coffee','valapo')===(vh.coffee||0),!meals);
 run(12,26);
 const SB=S.stocksBy(),sk=S.stocks('kautoa'),sv=S.stocks('valapo');
 ok('the stocks split by town: Kautoa\'s rows count rice, Valapo\'s coffee',SB&&SB.kautoa&&SB.valapo&&sk.by.rice&&sk.by.rice.total>0&&(!sk.by.coffee||sk.by.coffee.storage===0)&&sv.by.coffee&&sv.by.coffee.total>0,!SB);
}


// the population dealt per settlement and the search scoped (P7a items 3 and 4): a town's role lives in its own town's
// homes and works in its own town; an actor looks for a place in its own town first, then anywhere
{const {S,clock}=world(93);
 ['WORK'].forEach(a=>S.activity({id:a}));
 S.settlement({id:'kautoa',faction:'town'});S.settlement({id:'valapo',faction:'town'});
 S.place({id:'kHome',kind:'home',x:0,z:0,activities:{SLEEP:3},settlement:'kautoa'});S.place({id:'vHome',kind:'home',x:150,z:0,activities:{SLEEP:4},settlement:'valapo'});
 S.place({id:'kWork',kind:'field',x:0,z:0,activities:{WORK:5},open:[0,24],settlement:'kautoa'});S.place({id:'aWork',kind:'field',x:150,z:0,activities:{WORK:5},open:[0,24],settlement:'valapo'});
 S.place({id:'kTav',kind:'tavern',x:140,z:0,activities:{SOCIALIZE:6},open:[0,24],settlement:'kautoa'});S.place({id:'vTav',kind:'tavern',x:10,z:0,activities:{SOCIALIZE:6},open:[0,24],settlement:'valapo'});
 S.role({id:'kGrower',org:'folk',settlement:'kautoa',count:5,homes:['home'],work:{kinds:['field'],act:'WORK'},sched:[[0,'SOCIALIZE']]});
 S.role({id:'vGrower',org:'folk',settlement:'valapo',count:2,homes:['home'],work:{kinds:['field'],act:'WORK'},sched:[[0,'SOCIALIZE']]});
 const pk=S.populate({prefix:'k',settlement:'kautoa'}),pv=S.populate({prefix:'v',settlement:'valapo'});
 const K=S.all('actor').filter(a=>a.role==='kGrower'),V=S.all('actor').filter(a=>a.role==='vGrower');
 ok('a town\'s role is housed in its own town only: Kautoa\'s three beds take three of five, none overflows to Valapo',K.length===3&&K.every(a=>a.home==='kHome')&&pk.homeless.indexOf('kGrower')>=0&&pk.bySettlement.kautoa===3,K.some(a=>a.home==='vHome'));
 ok('and works in its home\'s town (not Valapo\'s field, though it sorts first)',K.every(a=>a.work==='kWork')&&V.every(a=>a.work==='aWork')&&pv.bySettlement.valapo===2,K.some(a=>a.work==='aWork'));
 ok('a deal for one town counts that town\'s beds only',pk.beds===3&&pv.beds===4,pk.beds===7);
 clock.h=1;const k0=K[0];S.decide(k0,S.minute(),clock.t);const nearAny=S.placesFor('SOCIALIZE',k0,1,{near:[0,0],limit:3})[0];
 ok('the search: a Kautoan socializes in Kautoa\'s tavern, the far one, not Valapo\'s at its door',k0.place==='kTav'&&nearAny&&nearAny.id==='vTav',k0.place==='vTav');
 S.R.place.kTav.closed=true;const k1=K[1];S.decide(k1,S.minute(),clock.t);
 ok('with none open in its own town it looks anywhere',k1.place==='vTav'||k1.place==='market',k1.place==='kTav');
 S.R.place.kTav.closed=false;}

// trade between settlements (P7a item 6, 77-sim-6-trade.js): a carrier leaves one town with what the other wants and
// this one can spare; at sea the load is in neither town's stock but counted in transit; it lands in the other's
// landing; the books balance in each town; a load is always in one town, at sea, or in the other; trade shut is refused
{const {S,clock}=world(95);
 ['EAT'].forEach(a=>S.activity({id:a}));
 S.settlement({id:'kautoa',faction:'town'});S.settlement({id:'valapo',faction:'town'});
 S.place({id:'kShed',kind:'warehouse',x:0,z:0,activities:{},settlement:'kautoa'});S.place({id:'vShed',kind:'warehouse',x:150,z:0,activities:{},settlement:'valapo'});
 S.place({id:'vQuay',kind:'quay',x:150,z:0,activities:{},settlement:'valapo'});
 S.place({id:'kHome',kind:'home',x:0,z:0,activities:{SLEEP:2,EAT:2},settlement:'kautoa'});S.place({id:'vHome',kind:'home',x:150,z:0,activities:{SLEEP:2,EAT:2},settlement:'valapo'});
 const cfg=()=>({goods:{rice:{import:{route:'road',lot:50}},coffee:{}},window:1,imports:{days:3,scan:60},routes:{road:{minutes:600}}});
 const EK=S.economy(cfg(),{settlement:'kautoa'}),EV=S.economy(cfg(),{settlement:'valapo'});
 S.store('kShed',{kind:'warehouse'});S.store('vShed',{kind:'warehouse'});S.store('vQuay',{kind:'site'});
 S.R.place.kShed.stock={rice:400};S.R.place.vShed.stock={coffee:400,rice:10};
 const R=S.trade({id:'sea',stops:[{settlement:'kautoa',place:'kShed'},{settlement:'valapo',place:'vQuay'}],cap:200,minutes:600,mins:100});
 // each town eats its own and wants the other's: Valapo has a little rice and sends for more by import, Kautoa no coffee
 const run=(h0,h1)=>{for(let m=h0*60;m<h1*60;m++){clock.h=(m%1440)/60;clock.d=Math.floor(m/1440);clock.t+=40;
   if(m%60===0){S.supply('rice',1,false,'kautoa');S.supply('rice',1,false,'valapo');S.supply('coffee',1,false,'valapo');S.supply('coffee',2,false,'kautoa');} S.step();}};
 run(0,1);
 ok('docked, it has sailed nothing yet',R.voyages===0&&!EK.exported.rice,R.voyages>0);
 run(1,7);
 const sk=S.stocks('kautoa'),sv=S.stocks('valapo'),rk=sk.by.rice,rv=sv.by.rice,sea=R.carriers[0].cargo.reduce((n,c)=>n+(c.good==='rice'?c.n:0),0);
 ok('leaving Kautoa it took rice for Valapo (what Valapo wants and Kautoa can spare), booked exported in Kautoa',R.voyages===1&&sea>0&&sea<=200&&EK.exported.rice===sea&&!EK.exported.coffee,sea===0);
 ok('at sea: outbound in Kautoa\'s row, inbound in Valapo\'s, and in neither town\'s total',rk.outbound===sea&&rv.inbound===sea&&rv.total===S.stockOf('rice','valapo')&&rk.total===S.stockOf('rice','kautoa'),rv.total>=sea);
 ok('Kautoa keeps its floor: no more than its stock less six days of its own want',S.stockOf('rice','kautoa')>=6*24*0.9,S.stockOf('rice','kautoa')<100);
 ok('Kautoa\'s day balances with the load gone (change = made + imported - exported - consumed)',rk.today.change===rk.today.made+rk.today.imported-rk.today.exported-rk.today.consumed&&rk.today.exported===sea,rk.today.exported!==sea);
 ok('while it is at sea Valapo, under three days of rice in store, sends for none by import: the load at sea counts',S.tradeInbound('rice','valapo')===sea&&S.economyDays('rice','valapo')<3&&!EV.inflight.length&&!EV.sent,EV.sent>0);
 run(7,13);
 const rv2=S.stocks('valapo').by.rice;
 ok('arriving, it lands in Valapo\'s quay (the landing\'s store), booked imported in Valapo',S.R.place.vQuay.stock.rice===sea&&EV.imported.rice===sea&&R.landed['kautoa>valapo'].rice===sea&&rv2.inbound===0,S.R.place.vQuay.stock.rice!==sea);
 ok('Valapo\'s day balances with the load landed',rv2.today.change===rv2.today.made+rv2.today.imported-rv2.today.exported-rv2.today.consumed&&rv2.today.imported===sea,rv2.today.imported!==sea);
 run(13,26);
 ok('and back: leaving Valapo with coffee, landing in Kautoa\'s shed (Kautoa\'s landing is its warehouse)',(R.landed['valapo>kautoa']||{}).coffee>0&&EK.imported.coffee===R.landed['valapo>kautoa'].coffee&&(S.R.place.kShed.stock.coffee||0)>0,!(EK.imported.coffee>0));
 const acct=g=>['kautoa>valapo','valapo>kautoa'].every(k=>((R.shipped[k]||{})[g]||0)===((R.landed[k]||{})[g]||0)+R.carriers.filter(C=>C.to!=null&&(R.stops[C.from].settlement+'>'+R.stops[C.to].settlement)===k).reduce((n,C)=>n+C.cargo.filter(c=>c.good===g).reduce((m,c)=>m+c.n,0),0));
 ok('every load is accounted for: shipped = landed + at sea, each way',acct('rice')&&acct('coffee'),!acct('rice'));
 const rep=S.tradeReport('sea');ok('the report: voyages, what went each way',rep.voyages===3&&rep.shipped['kautoa>valapo'].rice>0&&rep.carriers.length===1,!rep);
 // the trade relation: a friendly faction trades; trade shut (relation trade:false) or a hostile one is refused
 S.R.settlement.valapo.faction='nomads';const fr=S.trades('kautoa','valapo');S.R.relation['town>nomads'].trade=false;const shut=S.trades('kautoa','valapo');
 S.R.settlement.valapo.faction='raiders';const host=S.trades('kautoa','valapo');
 ok('trade between friendly factions is open; shut by the relation, or between hostile ones, it is not',fr&&!shut&&!host,!fr||shut);
 const x0=EK.exported.rice,v0=R.voyages,f0=R.refused;run(26,50);
 ok('refused: the carrier keeps its round but carries nothing, and nothing more is exported',R.refused>f0&&R.voyages>v0&&EK.exported.rice===x0,EK.exported.rice!==x0);
 // the households and the items' books by town
 S.items({kinds:{rice:{cat:'food',food:true},coffee:{cat:'food',food:true}},free:['IDLE'],secPerMinute:1,meal:{mult:3,single:1,none:0.2,mess:3}});
 S.R.place.kHome.store={rice:5};S.R.place.vHome.store={rice:7};
 S.role({id:'eater',org:'folk',sched:[[0,'EAT']],prefers:{EAT:{pin:'home'}}});const ve=S.actor({id:'ve',role:'eater',home:'vHome'});ve.wanted=null;S.decide(ve,S.minute(),clock.t);
 const I=S.ITEMS,hk=S.stocks('kautoa').by.rice;
 ok('a household\'s food counts in its own town only (Kautoa\'s rice storage: its shed and its 5, not Valapo\'s)',hk.storage===S.stockOf('rice','kautoa')+5,hk.storage>S.stockOf('rice','kautoa')+5);
 ok('a Valapan\'s meal at home is booked to Valapo\'s items books, not Kautoa\'s',I.statsBy&&(I.statsBy.valapo.eaten.rice||0)>0&&!I.statsBy.kautoa,!!(I.statsBy&&I.statsBy.kautoa));
 {const VM=I.statsBy.valapo.meals,GM=I.stats.meals,n=k=>VM[k]||0;
  ok('and the meal itself is counted in Valapo\'s meals (the page-wide count too)',VM&&n('meal')+n('single')===1&&(GM.meal||0)+(GM.single||0)>=1,!VM||n('meal')+n('single')!==1);}}

// the nearest-job deal (opt-in, a role's work.near): each actor's job is the nearest place of its kinds with a post free
{const deal=near=>{const {S}=world(101);S.activity({id:'WORK'});
   S.place({id:'hut1',kind:'hut',x:0,z:0,activities:{SLEEP:3}});
   S.place({id:'aFar',kind:'field',x:150,z:0,activities:{WORK:2},open:[0,24]});S.place({id:'zNear',kind:'field',x:0,z:0,activities:{WORK:2},open:[0,24]});
   S.role({id:'hand',org:'folk',count:3,homes:['hut'],work:{kinds:['field'],act:'WORK',near:near},sched:[[0,'WORK']]});
   S.populate({prefix:'h'});return S.all('actor').filter(a=>a.role==='hand').map(a=>a.work);};
 const N=deal(true),L=deal(false);
 ok('near: the first two hands work the field at their door, the third (its posts taken) the far one',N[0]==='zNear'&&N[1]==='zNear'&&N[2]==='aFar',N[0]==='aFar');
 ok('without it the load rule deals as before (the first to the field that sorts first)',L[0]==='aFar',L[0]==='zNear');}

// two towns far apart (the isle demo: 120 km): the nearest-place search from one town for what only the other has
// answers as a full scan would, and fast (filled cells taken directly, not rings over empty sea)
{const {S}=world(103);S.activity({id:'PRAY'});
 for(let i=0;i<30;i++) S.place({id:'shrineA'+i,kind:'shrine',x:(i%6)*40,z:Math.floor(i/6)*40,activities:{PRAY:1}});
 for(let i=0;i<30;i++) S.place({id:'shrineB'+i,kind:'shrine',x:120000+(i%6)*40,z:5000+Math.floor(i/6)*40,activities:{PRAY:1}});
 const far=[119990,5010],t0=Date.now(),got=S.placesFor('PRAY',null,null,{near:[10,10],limit:3,kinds:['shrine'],ids:null,exclude:{shrineA0:1,shrineA1:1}}).map(P=>P.id),ms=Date.now()-t0;
 const brute=S.placesFor('PRAY',null,null,{near:[10,10],kinds:['shrine'],exclude:{shrineA0:1,shrineA1:1}}).slice(0,3).map(P=>P.id);
 const all=S.all('place').filter(P=>P.activities.PRAY).map(P=>P.id);for(const id of all) if(/^shrineA/.test(id)) S.R.place[id].closed=true;S.placesChanged();
 const t1=Date.now(),across=S.placesFor('PRAY',null,12,{near:[10,10],limit:3}).map(P=>P.id),ms2=Date.now()-t1;
 const bruteX=S.placesFor('PRAY',null,12,{near:[10,10]}).slice(0,3).map(P=>P.id);
 ok('the grid search finds the nearest three as a full scan does',got.join()===brute.join(),got.join()!==brute.join());
 ok('with none open at home it finds the other town\'s, 120 km off, as a full scan does, in well under a second',across.join()===bruteX.join()&&across.length===3&&/^shrineB/.test(across[0])&&ms2<300,ms2>=300||across.join()!==bruteX.join());}

// a lag at the start of time: at minute 1 an actor whose day runs 8 minutes behind is on the day before, not nowhere
{const {S,clock}=world(105);S.LAG=8;clock.d=0;clock.h=1/60;let a=null;for(let i=0;i<20&&!(a&&S.lagOf(a)>1);i++) a=S.actor({id:'early'+i,role:'farmer',home:'homeA'});
 const lag=S.lagOf(a),want=S.desire(a,1);
 ok('a lagged actor at minute 1 ('+lag+' minutes behind) wants its schedule\'s hour (the day before\'s 23:00, SLEEP), never undefined',lag>1&&want==='SLEEP',want===undefined);
 const w=S.wakeOf(Object.assign(a,{wanted:want,task:{}}),1,want);ok('and its wake is a minute ahead, not before now',w>1&&Number.isFinite(w),!(w>1));}

// the levels (77-sim-7-lod.js): a town nobody watches runs on its books only (no decisions, no routes), makes about what
// it makes when watched, hauls, eats and restocks, and its books balance; raised, everyone is where the schedule says
{const mk=(abs)=>{const {S,clock}=world(107);
   ['WORK','EAT','HAUL','UNLOAD'].forEach(a=>{ if(!S.R.activity[a]) S.activity({id:a}); });
   S.settlement({id:'kautoa',faction:'town'});S.settlement({id:'valapo',faction:'town'});
   S.place({id:'kHome',kind:'house',x:0,z:0,activities:{SLEEP:4,EAT:4},settlement:'kautoa'});S.place({id:'kFarm',kind:'field',x:50,z:0,activities:{WORK:4},open:[0,24],settlement:'kautoa'});
   S.place({id:'kShed',kind:'warehouse',x:100,z:0,activities:{},settlement:'kautoa'});
   S.place({id:'vHome',kind:'house',x:150,z:0,activities:{SLEEP:4,EAT:4},settlement:'valapo'});S.place({id:'vFarm',kind:'field',x:100,z:60,activities:{WORK:4},open:[0,24],settlement:'valapo'});
   S.place({id:'vShed',kind:'warehouse',x:50,z:0,activities:{},settlement:'valapo'});
   const cfg=()=>({goods:{rice:{},coffee:{}},every:60,window:1,cart:{cap:40,load:5,unload:5,minLoad:5}});
   const EK=S.economy(cfg(),{settlement:'kautoa'}),EV=S.economy(cfg(),{settlement:'valapo'});
   S.store('kShed',{kind:'warehouse'});S.store('vShed',{kind:'warehouse'});S.recipe('kFarm',{out:['rice'],rate:5,cap:300});S.recipe('vFarm',{out:['coffee'],rate:5,cap:300});
   S.R.place.kShed.stock={rice:50,coffee:50};S.R.place.vShed.stock={rice:200,coffee:20};
   S.role({id:'grower',org:'folk',sched:[[0,'SLEEP'],[6,'WORK'],[18,'EAT'],[19,'SLEEP']],prefers:{SLEEP:{pin:'home'},EAT:{pin:'home'},WORK:{pin:'work'}}});
   S.role({id:'carter',org:'folk',sched:[[0,'IDLE']]});
   [0,1,2].forEach(i=>S.actor({id:'kg'+i,role:'grower',home:'kHome',work:'kFarm'}));[0,1,2].forEach(i=>S.actor({id:'vg'+i,role:'grower',home:'vHome',work:'vFarm'}));
   S.cart(S.actor({id:'kc',role:'carter',home:'kHome'}));S.cart(S.actor({id:'vc',role:'carter',home:'vHome'}));
   S.items({kinds:{rice:{cat:'food',food:true},coffee:{cat:'food',food:true}},free:['IDLE'],secPerMinute:40,days:2,low:1});
   S.R.place.kHome.store={rice:6,coffee:6};S.R.place.vHome.store={rice:6,coffee:6};S.R.place.kHome.people=3;S.R.place.vHome.people=3;
   clock.d=0;clock.h=0;if(abs) S.level('valapo','abstract');
   const run=(h0,h1)=>{for(let m=h0*60;m<h1*60;m++){clock.h=(m%1440)/60;clock.d=Math.floor(m/1440);clock.t+=40;S.step();}};
   return {S,clock,EK,EV,run};};
 const P=mk(false),A=mk(true);P.run(0,26);
 const V0=A.S.all('actor').filter(a=>/^vg/.test(a.id)).map(a=>a.wanted),T0=A.S.R.actor.vg0.task;A.run(0,26);
 const VA=A.S.all('actor').filter(a=>/^vg/.test(a.id)),KA=A.S.all('actor').filter(a=>/^kg/.test(a.id));
 ok('abstract: Valapo\'s people are not decided (no wants, no routes) while Kautoa\'s are',A.S.levelOf('valapo')==='abstract'&&VA.every(a=>a.wanted==null&&a.task==null)&&KA.every(a=>a.wanted!=null&&a.task),VA.some(a=>a.task!=null));
 const mp=P.EV.made.coffee||0,ma=A.EV.made.coffee||0;
 ok('and makes about what it makes watched, by its schedules ('+ma+' coffee abstract, '+mp+' watched)',ma>0&&ma>=0.8*mp&&ma<=1.3*mp,ma===0);
 ok('Kautoa, watched, is the same in both worlds',(A.EK.made.rice||0)===(P.EK.made.rice||0),(A.EK.made.rice||0)!==(P.EK.made.rice||0));
 const vc=A.S.R.actor.vc;ok('its cart hauls on timed trips, no route',(A.EV.hauled.coffee||0)>0&&A.EV.trips>0&&(!vc.task||vc.task.abstract&&vc.task.legs.length===0),!(A.EV.hauled.coffee>0));
 const I=A.S.ITEMS,VB=(I.statsBy||{}).valapo||{};
 ok('its households eat from their stores and restock from the warehouses (booked to Valapo)',(VB.meals&&VB.meals.meal>0)&&(VB.eaten&&(VB.eaten.rice||0)>0)&&(VB.bought&&((VB.bought.rice||0)+(VB.bought.coffee||0))>0)&&(A.EV.used.rice||0)>0,!(VB.meals&&VB.meals.meal>0));
 const sv=A.S.stocks('valapo'),bal=g=>{const f=sv.by[g].today;return f.change===f.made+f.imported-f.exported-f.consumed;};
 ok('its books balance at the abstract level (change = made + imported - exported - consumed, both goods)',sv.today&&bal('rice')&&bal('coffee'),!bal('coffee'));
 ok('lowered, it draws nothing: Valapo abstract leaves Kautoa\'s decisions as in the watched world',KA.every(a=>a.place===P.S.R.actor[a.id].place&&a.activity===P.S.R.actor[a.id].activity),KA.some(a=>a.place!==P.S.R.actor[a.id].place));
 // raised mid-morning with the cart on a trip: everyone where the schedule says, the cart given its route, arriving at the same minute
 A.run(26,30);const C=A.S.R.actor.vc;let h=30;for(;h<40;h+=1/60){A.run(h,h+1/60);if(C.task&&C.task.abstract&&A.clock.t<C.task.arrive)break;}
 const ct=C.task,onTrip=!!(ct&&ct.abstract&&A.clock.t<ct.arrive),arr=ct&&ct.arrive;
 A.S.level('valapo','presented');
 ok('raised: each Valapan decided where its schedule says (in the working day, WORK at the farm)',A.S.levelOf('valapo')==='presented'&&VA.every(a=>a.task&&a.activity==='WORK'&&a.place==='vFarm'),VA.some(a=>!a.task));
 ok('and a cart caught on a trip given its route, arriving at the same minute',onTrip&&C.task.legs.length>0&&C.task.arrive===arr&&!C.task.abstract,!!C.task.abstract);
 A.run(h+1/60,h+2);ok('watched again it runs as before (decisions, carts walking)',VA.every(a=>a.wanted!=null)&&(A.EV.made.coffee||0)>ma,VA.some(a=>a.wanted==null));}

// the abstract day (77-sim-6-items.js SIM.itemsAbstractDay): a town nobody watches wears its clothes and tools out and
// buys them again, and its people's material meter rises and buys treats, booked to its economy as a watched town's
// purchases are, so its governor learns their demand; without the abstract day it buys none
{const mk=(off)=>{const {S,clock}=world(139);
   ['WORK','EAT','HAUL','UNLOAD'].forEach(a=>{ if(!S.R.activity[a]) S.activity({id:a}); });
   S.settlement({id:'kautoa',faction:'town'});S.settlement({id:'valapo',faction:'town'});
   S.place({id:'vHome',kind:'house',x:150,z:0,activities:{SLEEP:6,EAT:6},settlement:'valapo'});S.place({id:'vFarm',kind:'field',x:100,z:60,activities:{WORK:6},open:[0,24],settlement:'valapo'});
   S.place({id:'vShed',kind:'warehouse',x:50,z:0,activities:{},settlement:'valapo'});S.place({id:'vShop',kind:'shop',x:60,z:0,activities:{BUY:4},open:[6,20],settlement:'valapo'});
   S.place({id:'kHome',kind:'house',x:0,z:0,activities:{SLEEP:4},settlement:'kautoa'});S.place({id:'kShed',kind:'warehouse',x:10,z:0,activities:{},settlement:'kautoa'});
   const cfg=()=>({goods:{rice:{},garments:{},tools:{},kava:{}},every:60,window:1});
   S.economy(cfg(),{settlement:'kautoa'});const EV=S.economy(cfg(),{settlement:'valapo'});
   S.store('kShed',{kind:'warehouse'});S.store('vShed',{kind:'warehouse'});S.recipe('vFarm',{out:['rice'],rate:1,cap:300});
   S.R.place.vShed.stock={rice:500,garments:100,tools:100,kava:100};
   S.needs({list:['eat','material'],rate:{eat:0,material:1},init:10});
   S.items({kinds:{rice:{cat:'food',food:true},shirt:{cat:'clothes',slot:'torso',life:2,good:'garments'},hoe:{cat:'tool',workLife:20,good:'tools'},
     kava:{cat:'luxury',material:30,good:'kava'}},free:['IDLE'],secPerMinute:40,treat:{at:30,items:[[0,'kava']]}});
   S.shop('vShop',['shirt','hoe','kava','rice']);
   S.role({id:'grower',org:'folk',sched:[[0,'SLEEP'],[6,'WORK'],[18,'EAT'],[19,'SLEEP']],prefers:{SLEEP:{pin:'home'},EAT:{pin:'home'},WORK:{pin:'work'}}});
   const ps=[0,1,2,3].map(i=>{const a=S.actor({id:'vg'+i,role:'grower',home:'vHome',work:'vFarm'});a.wears=['shirt'];a.sets=1;S.equip(a,'shirt',0.4);a.tool={k:'hoe',w:0};return a;});
   S.R.place.vHome.store={rice:20};S.R.place.vHome.people=4;
   if(off) S.itemsAbstractDay=()=>{};
   clock.d=0;clock.h=0;S.level('valapo','abstract');
   for(let m=0;m<5*1440;m++){clock.h=(m%1440)/60;clock.d=Math.floor(m/1440);clock.t+=40;S.step();}
   return {S,EV,ps,B:(S.ITEMS.statsBy||{}).valapo||{}};};
 const A=mk(false),Z=mk(true),bA=A.B.bought||{},bZ=Z.B.bought||{};
 ok('abstract day: Valapo, unwatched, wears its shirts out and buys them again, booked to it ('+(bA.shirt||0)+' shirts, garments used '+(A.EV.used.garments||0)+')',bA.shirt>=4&&A.EV.used.garments===bA.shirt&&A.ps.every(a=>a.eq.torso),!(bA.shirt>0));
 ok('its tools worn by the scheduled hours and bought again ('+(bA.hoe||0)+'), its material meter risen to a treat ('+(bA.kava||0)+' bowls)',bA.hoe>=4&&bA.kava>=4&&A.ps.every(a=>a.tool),!(bA.hoe>0));
 ok('and nobody in it decided (no wants, no routes)',A.ps.every(a=>a.wanted==null&&a.task==null),A.ps.some(a=>a.task!=null));
 ok('without the abstract day it buys none',!(bZ.shirt>0)&&!(bZ.hoe>0)&&!(bZ.kava>0),bZ.shirt>0);}

// trade on a transport line: the carrier is the line's vehicle; a load leaves as it leaves a landing and lands as it docks
{const {S,clock}=world(97);
 S.settlement({id:'kautoa',faction:'town'});S.settlement({id:'valapo',faction:'town'});
 S.place({id:'kShed',kind:'warehouse',x:0,z:0,activities:{},settlement:'kautoa'});S.place({id:'vShed',kind:'warehouse',x:150,z:0,activities:{},settlement:'valapo'});
 const cfg=()=>({goods:{rice:{}},window:1});const EK=S.economy(cfg(),{settlement:'kautoa'}),EV=S.economy(cfg(),{settlement:'valapo'});
 S.store('kShed',{kind:'warehouse'});S.store('vShed',{kind:'warehouse'});S.R.place.kShed.stock={rice:500};
 S.transport({id:'canoe',layer:'pedestrian',stops:['kShed','vShed'],speed:2,dwell:60});S.transportBake('canoe');
 const R=S.trade({id:'line',line:'canoe',stops:[{settlement:'kautoa',place:'kShed'},{settlement:'valapo',place:'vShed'}],cap:20});
 let seenSea=false,sumOk=true;
 for(let m=0;m<240;m++){clock.h=(m%1440)/60;clock.t+=40;if(m%10===0)S.supply('rice',1,false,'valapo');S.step();
   const C=R.carriers[0],sea=C.cargo.reduce((n,c)=>n+c.n,0);if(sea>0)seenSea=true;
   if(S.stockOf('rice','kautoa')+sea+S.stockOf('rice','valapo')+(EV.used.rice||0)!==500) sumOk=false;}
 const out=S.LOG.filter(e=>e.kind==='trade out'&&e.route==='line'),inn=S.LOG.filter(e=>e.kind==='trade in'&&e.route==='line');
 ok('on a line: loads leave Kautoa as the vehicle leaves and land in Valapo as it docks',seenSea&&EV.imported.rice>0&&(R.landed['kautoa>valapo']||{}).rice===EV.imported.rice&&inn.length>=1&&out.length>=inn.length,!(EV.imported.rice>0));
 ok('and rice is conserved every minute: Kautoa\'s, at sea, Valapo\'s and used add to the 500 there were',sumOk,!sumOk);}

// the economy's rules (77-sim-6-govern.js, lifted from the isle demo 2026-10-26): the governor holds a good's supply line
// near its target (a pile slows its makers, a drain speeds them), spoilage rots a share a night and books it used, a
// keeper (salt) keeps a share of what would rot, the seasoning follows the warehouses, a failed tool errand is asked again
{const mk=(rules,start,use)=>{const {S,clock}=world(113);
   ['WORK','HAUL','UNLOAD'].forEach(a=>S.activity({id:a}));
   S.place({id:'shed',kind:'warehouse',x:0,z:0,activities:{}});S.place({id:'farm',kind:'field',x:150,z:0,activities:{WORK:4},open:[0,24]});
   S.role({id:'grower',org:'folk',sched:[[0,'WORK']],prefers:{WORK:{pin:'work'}}});S.role({id:'carter',org:'folk',sched:[[0,'IDLE']]});
   const E=S.economy(Object.assign({goods:{rice:{},fish:{},salt:{}},every:60,window:1,cart:{cap:500,load:5,unload:5,minLoad:5}},rules));
   S.store('shed',{kind:'warehouse'});S.recipe('farm',{out:['rice'],rate:10,cap:100000});S.R.place.shed.stock={rice:start};
   [0,1,2].forEach(i=>S.actor({id:'g'+i,role:'grower',home:'homeA',work:'farm'}));S.cart(S.actor({id:'c',role:'carter',home:'homeA'}));
   const run=(h0,h1)=>{for(let m=h0*60;m<h1*60;m++){clock.h=(m%1440)/60;clock.d=Math.floor(m/1440);clock.t+=40;if(m%60===0&&use)S.supply('rice',use);S.step();}};
   return {S,E,run};};
 const G={govern:{every:60,cover:3,ti:1.5,alpha:0.3,min:0.3,max:1.5}};
 const pile=mk(G,3000,10),free=mk({},3000,10);pile.run(0,96);free.run(0,96);
 const pm=pile.E.made.rice||0,fm=free.E.made.rice||0,v=pile.S.economyGoverned().rice;
 ok('governed, a pile slows its makers ('+pm+' rice made in four days, '+fm+' ungoverned; the farm at x'+(pile.E.recipes.farm.rate/10).toFixed(2)+')',pm<0.6*fm&&pile.E.recipes.farm.rate<10&&v&&v.mult<1&&!(pile.E.short.rice>0),pile.E.recipes.farm.rate>=10);
 ok('ungoverned, the farm keeps its full rate',free.E.recipes.farm.rate===10&&!free.E.govern,free.E.recipes.farm.rate!==10);
 const drain=mk(G,0,40);drain.run(0,72);const dv=drain.S.economyGoverned().rice;
 ok('governed, a drain speeds them (to at most max: x'+(drain.E.recipes.farm.rate/10).toFixed(2)+')',drain.E.recipes.farm.rate>10&&drain.E.recipes.farm.rate<=15+1e-9&&dv.mult>1,drain.E.recipes.farm.rate<=10);
 // spoilage and keeping, at midnight (the fish laid in after the first minute's midnight)
 const sp=mk({spoil:{fish:0.04}},0,0);sp.run(0,1);sp.S.R.place.shed.stock.fish=1000;sp.run(1,25);
 ok('spoilage: 4% of the fish rots at midnight, booked used',sp.E.spoiled.fish===40&&sp.S.R.place.shed.stock.fish===960&&sp.E.used.fish===40,sp.S.R.place.shed.stock.fish===1000);
 const no=mk({},0,0);no.run(0,1);no.S.R.place.shed.stock.fish=1000;no.run(1,25);
 ok('without spoilage nothing rots',no.S.R.place.shed.stock.fish===1000&&!no.E.spoiled,no.S.R.place.shed.stock.fish!==1000);
 const kp=mk({spoil:{fish:0.04},keep:{by:'salt',goods:['fish'],share:0.75,per:4}},0,0);kp.run(0,1);kp.S.R.place.shed.stock.fish=1000;kp.S.R.place.shed.stock.salt=100;kp.run(1,25);
 ok('keeping: three quarters of what would rot is salted, a salt for four (30 kept, 8 salt, 10 rotten)',kp.E.kept.fish===30&&kp.E.kept.salt===8&&kp.E.spoiled.fish===10&&kp.S.R.place.shed.stock.salt===92,kp.E.spoiled.fish===40);
 const ks=mk({spoil:{fish:0.04},keep:{by:'salt',goods:['fish'],share:0.75,per:4}},0,0);ks.run(0,1);ks.S.R.place.shed.stock.fish=1000;ks.run(1,25);
 ok('and with no salt in the warehouses it all rots',ks.E.spoiled.fish===40&&!(ks.E.kept.fish>0),ks.E.kept.fish>0);
 // seasoning: while the warehouses hold salt
 const se=mk({season:{by:'salt',mult:1.15}},0,0);se.S.R.place.shed.stock.salt=5;se.run(0,2);
 ok('seasoning: a town holding salt seasons its meals (x1.15)',se.S.economySeasoned()===true&&se.S.economySeasoning()===1.15,se.S.economySeasoning()!==1.15);
 se.S.R.place.shed.stock.salt=0;se.run(2,3);
 ok('and none once it is out (looked at hourly); a town without the rule never',se.S.economySeasoned()===false&&se.S.economySeasoning()===1&&no.S.economySeasoning()===1,se.S.economySeasoned()!==false);
 // a failed tool errand asked again (items' retry)
 const tr=(retry)=>{const W=mk({},0,0);W.S.items({kinds:{axe:{cat:'tool',workLife:100}},free:['IDLE'],secPerMinute:40,retry:retry});W.S.shop('market',['axe']);
   const a=W.S.R.actor.g0;a.toolNeed='axe';a.errand=null;a.present=true;a.activity='WORK';W.S.itemsRetry(60);return a;};
 const r1=tr(60),r0=tr(0);
 ok('retry: a worker short of its tool asks again on the hour of work',r1.errand&&r1.errand.item==='axe'&&r1.errand.when==='work',!r1.errand);
 ok('and without the rule it does not',!r0.errand,!!r0.errand);}

// unmet draws as use (77-sim-6-economy.js `useShort`): a good its buyers could not get is wanted, so a maker of several
// goods makes it; without it the good has no use, never runs out, and is never made
{const mk=(useShort)=>{const {S,clock}=world(127);
   ['WORK','HAUL','UNLOAD'].forEach(a=>S.activity({id:a}));
   S.place({id:'shed',kind:'warehouse',x:0,z:0,activities:{}});S.place({id:'kiln',kind:'workshop',x:150,z:0,activities:{WORK:4},open:[0,24]});
   S.role({id:'potter',org:'folk',sched:[[0,'WORK']],prefers:{WORK:{pin:'work'}}});S.role({id:'carter',org:'folk',sched:[[0,'IDLE']]});
   const E=S.economy(Object.assign({goods:{pots:{},lamps:{}},every:60,window:1,cart:{cap:500,load:5,unload:5,minLoad:5}},useShort?{useShort:true}:{}));
   S.store('shed',{kind:'warehouse'});S.recipe('kiln',{out:['pots','lamps'],rate:2,cap:10000});S.R.place.shed.stock={pots:500,lamps:0};
   [0,1].forEach(i=>S.actor({id:'p'+i,role:'potter',home:'homeA',work:'kiln'}));S.cart(S.actor({id:'c',role:'carter',home:'homeA'}));
   for(let m=0;m<48*60;m++){clock.h=(m%1440)/60;clock.d=Math.floor(m/1440);clock.t+=40;if(m%60===0){S.supply('pots',3);S.supply('lamps',2,true);}S.step();}
   return {S,E};};
 const on=mk(true),off=mk(false);
 ok('unmet draws as use: the lamps nobody could buy are made ('+(on.E.made.lamps||0)+' in two days; short '+JSON.stringify([(on.E.day[0].short||{}).lamps,(on.E.day[1].short||{}).lamps,on.E.used.lamps])+')',(on.E.made.lamps||0)>0&&((on.E.day[1].short||{}).lamps||0)<((on.E.day[0].short||{}).lamps||0),!(on.E.made.lamps>0));
 ok('without it the lamps are never made (no use booked: never short of days)',!(off.E.made.lamps>0)&&off.E.made.pots>0&&off.S.economyDays('lamps')===Infinity,off.E.made.lamps>0);}
 // governed, a maker of two goods with both over target runs at the floor: the lamps nobody wants (never made, no
 // capacity learnt) do not ask for the most, and the pots piling at the kiln's own store are counted
 const gv=(()=>{const {S,clock}=world(131);['WORK','HAUL','UNLOAD'].forEach(a=>S.activity({id:a}));
   S.place({id:'shed',kind:'warehouse',x:0,z:0,activities:{}});S.place({id:'kiln',kind:'workshop',x:150,z:0,activities:{WORK:4},open:[0,24]});
   S.role({id:'potter',org:'folk',sched:[[0,'WORK']],prefers:{WORK:{pin:'work'}}});
   const E=S.economy({goods:{pots:{},lamps:{}},every:60,window:1,useShort:true,govern:{every:60,cover:3,ti:1.5,alpha:0.3,min:0.3,max:1.5}});
   S.store('shed',{kind:'warehouse'});S.recipe('kiln',{out:['pots','lamps'],rate:2,cap:100000});S.R.place.shed.stock={pots:100,lamps:200};
   [0,1].forEach(i=>S.actor({id:'p'+i,role:'potter',home:'homeA',work:'kiln'}));
   for(let m=0;m<72*60;m++){clock.h=(m%1440)/60;clock.d=Math.floor(m/1440);clock.t+=40;if(m%60===0)S.supply('pots',1);S.step();}
   return {S,E};})();
 const gk=gv.E.recipes.kiln.rate/2,gV=gv.S.economyGoverned();
 ok('governed, two goods both over target (pots piling at the kiln, lamps unwanted): the kiln at its floor (x'+gk.toFixed(2)+'), not the most',Math.abs(gk-0.3)<1e-9&&gV.lamps.mult===0.3&&gV.pots.pos>gv.S.stockOf('pots'),gk>=1.5);
 // `least`: a shelf stock kept with no demand: the lamps nobody buys yet are made up to it, then the kiln slows
 const lt=(least)=>{const {S,clock}=world(137);['WORK','HAUL','UNLOAD'].forEach(a=>S.activity({id:a}));
   S.place({id:'shed',kind:'warehouse',x:0,z:0,activities:{}});S.place({id:'kiln',kind:'workshop',x:150,z:0,activities:{WORK:4},open:[0,24]});
   S.role({id:'potter',org:'folk',sched:[[0,'WORK']],prefers:{WORK:{pin:'work'}}});
   const E=S.economy({goods:{pots:{},lamps:{}},every:60,window:1,govern:Object.assign({every:60,cover:3,ti:1.5,alpha:0.3,min:0.3,max:1.5},least?{least:{lamps:40}}:{})});
   S.store('shed',{kind:'warehouse'});S.recipe('kiln',{out:['pots','lamps'],rate:2,cap:100000});S.R.place.shed.stock={pots:100,lamps:0};
   [0,1].forEach(i=>S.actor({id:'p'+i,role:'potter',home:'homeA',work:'kiln'}));
   for(let m=0;m<96*60;m++){clock.h=(m%1440)/60;clock.d=Math.floor(m/1440);clock.t+=40;if(m%60===0)S.supply('pots',4);S.step();}
   return E;};
 const L1=lt(true),L0=lt(false);
 ok('least: the lamps nobody buys are kept on the shelf ('+(L1.made.lamps||0)+' made, about its 40) while the pots go on',(L1.made.lamps||0)>=40&&(L1.made.lamps||0)<=70&&L1.made.pots>0,!(L1.made.lamps>0));
 ok('without it no lamp is made',!(L0.made.lamps>0),L0.made.lamps>0);
 // the first day: a recipe whose every good already has its shelf stock runs at its floor, not flat out (no history yet)
 const fd=(stock)=>{const {S,clock}=world(151);['WORK'].forEach(a=>S.activity({id:a}));
   S.place({id:'shed',kind:'warehouse',x:0,z:0,activities:{}});S.place({id:'loom',kind:'workshop',x:150,z:0,activities:{WORK:4},open:[0,24]});
   S.role({id:'weaver',org:'folk',sched:[[0,'WORK']],prefers:{WORK:{pin:'work'}}});
   const E=S.economy({goods:{mats:{}},every:60,window:1,govern:{every:60,cover:3,ti:1.5,alpha:0.3,min:0.3,max:1.5,least:{mats:100}}});
   S.store('shed',{kind:'warehouse'});S.recipe('loom',{out:['mats'],rate:2,cap:100000});S.R.place.shed.stock={mats:stock};
   [0,1].forEach(i=>S.actor({id:'w'+i,role:'weaver',home:'homeA',work:'loom'}));
   for(let m=0;m<12*60;m++){clock.h=(m%1440)/60;clock.t+=40;S.step();}
   return E;};
 const F1=fd(150),F0=fd(0);
 ok('the first day: a shelf already held (150 mats, least 100) runs at the floor (x'+(F1.recipes.loom.rate/2).toFixed(2)+'), an empty one flat out',Math.abs(F1.recipes.loom.rate/2-0.3)<1e-9&&F0.recipes.loom.rate===2&&F1.made.mats<F0.made.mats,F1.recipes.loom.rate===2);

// an urgent load (cart.urgent): a good the warehouses hold under that many days of is fetched from a maker's store in
// any amount; without it a load under minLoad waits
{const mk=(urgent)=>{const {S,clock}=world(149);['WORK','HAUL','UNLOAD'].forEach(a=>S.activity({id:a}));
   S.place({id:'shed',kind:'warehouse',x:0,z:0,activities:{}});S.place({id:'kiln',kind:'workshop',x:150,z:0,activities:{WORK:4},open:[0,24]});
   S.role({id:'carter',org:'folk',sched:[[0,'IDLE']]});
   const E=S.economy({goods:{lamps:{}},every:60,window:1,useShort:true,cart:Object.assign({cap:50,load:5,unload:5,minLoad:10},urgent?{urgent:1}:{})});
   S.store('shed',{kind:'warehouse'});S.store('kiln',{kind:'site'});S.R.place.kiln.stock={lamps:3};S.R.place.shed.stock={lamps:0};S.cart(S.actor({id:'c',role:'carter',home:'homeA'}));
   for(let m=0;m<6*60;m++){clock.h=(m%1440)/60;clock.t+=40;if(m===90)S.supply('lamps',2);S.step();}
   return {S,E};};
 const U=mk(true),N=mk(false);
 ok('urgent: three lamps at the kiln, none on the shelf and buyers short: fetched though under minLoad',U.S.R.place.shed.stock.lamps===3&&U.E.hauled.lamps===3,!(U.E.hauled.lamps>0));
 ok('without it they wait at the kiln for a load of ten',N.S.R.place.kiln.stock.lamps===3&&!(N.E.hauled.lamps>0),N.E.hauled.lamps>0);}

// the diet (SIM.itemsDiet): a household buys a named food at its share of its days of food (split by largest remainders,
// so a small share is bought too), the rest by the warehouses' stock; without it, all by the stock
{const buy=(diet)=>{const {S}=world(157);
   S.place({id:'shed',kind:'warehouse',x:0,z:0,activities:{}});S.place({id:'stall',kind:'shop',x:50,z:0,activities:{BUY:4},open:[0,24]});
   S.economy({goods:{corn:{},rice:{}},window:1});S.store('shed',{kind:'warehouse'});S.R.place.shed.stock={corn:1000,rice:1000};
   S.items({kinds:{corn:{cat:'food',food:true},rice:{cat:'food',food:true}},free:['IDLE'],secPerMinute:40,meals:2,perMeal:2,days:3,low:1});
   S.shop('stall',['corn','rice']);if(diet) S.itemsDiet(null,diet);
   const H=S.R.place.homeA;H.people=5;H.store={};S.itemsAbstractHome(H,1,null,5);return H.store;};
 const D=buy({rice:0.03}),N=buy(null);
 ok('diet: rice at its 3% of 60 servings ('+D.rice+'), the corn the rest ('+D.corn+')',D.rice===2&&D.corn===58,D.rice!==2);
 ok('without it the stock splits them (equal stock: '+N.rice+' and '+N.corn+')',N.rice===30&&N.corn===30,N.rice===2);}

// a route's `expect`: the receiver's planned use of a good, a floor on its want, so a load sails before anyone there
// has bought any; without it the carrier sails empty
{const go=(expect)=>{const {S,clock}=world(163);
   S.settlement({id:'kautoa',faction:'town'});S.settlement({id:'valapo',faction:'town'});
   S.place({id:'kShed',kind:'warehouse',x:0,z:0,activities:{},settlement:'kautoa'});S.place({id:'vShed',kind:'warehouse',x:150,z:0,activities:{},settlement:'valapo'});
   const cfg=()=>({goods:{rice:{}},window:1});S.economy(cfg(),{settlement:'kautoa'});const EV=S.economy(cfg(),{settlement:'valapo'});
   S.store('kShed',{kind:'warehouse'});S.store('vShed',{kind:'warehouse'});S.R.place.kShed.stock={rice:2000};
   S.trade(Object.assign({id:'line',stops:[{settlement:'kautoa',place:'kShed'},{settlement:'valapo',place:'vShed'}],cap:500,minutes:60,mins:30,keep:0,want:3},expect?{expect:{valapo:{rice:100}}}:{}));
   for(let m=0;m<200;m++){clock.h=(m%1440)/60;clock.t+=40;S.step();}
   return EV;};
 const X=go(true),N=go(false);
 ok('expect: a load of rice sails to Valapo before anyone there wanted it (3 days of its 100 a day: '+(X.imported.rice||0)+')',X.imported.rice===300,!(X.imported.rice>0));
 ok('without it the line carries none',!(N.imported.rice>0),N.imported.rice>0);}

// the stagger (items.stagger): each household buys days x (1 +- stagger) of food by a hash of its home, so the rounds
// drift apart; without it every house buys the same days
{const run=(st)=>{const {S}=world(167);
   S.place({id:'shed',kind:'warehouse',x:0,z:0,activities:{}});S.place({id:'stall',kind:'shop',x:50,z:0,activities:{BUY:4},open:[0,24]});
   S.economy({goods:{corn:{}},window:1});S.store('shed',{kind:'warehouse'});S.R.place.shed.stock={corn:100000};
   S.items({kinds:{corn:{cat:'food',food:true}},free:['IDLE'],secPerMinute:40,meals:2,perMeal:2,days:3,low:1,stagger:st});S.shop('stall',['corn']);
   const got=[];for(let i=0;i<20;i++){S.place({id:'h'+i,kind:'home',x:i,z:0,activities:{SLEEP:4}});const H=S.R.place['h'+i];H.people=5;H.store={};S.itemsAbstractHome(H,1,null,5);got.push(H.store.corn);}
   return got;};
 const A=run(0.5),B=run(0);
 ok('stagger: twenty homes buy between 1.5 and 4.5 days of food, no two rounds alike ('+Math.min(...A)+'-'+Math.max(...A)+' servings)',Math.min(...A)>=30&&Math.max(...A)<=90&&new Set(A).size>=10,new Set(A).size===1);
 ok('without it every home buys three days (60 servings)',B.every(x=>x===60),!B.every(x=>x===60));}

// the ledger (77-sim-7-ledger.js, SCHEMA.md "The books"): deterministic small scenarios, each with a negative: a town's goods
// balance with spoilage on its own line, a load is in one town, at sea or in the other, what leaves the map is abroad
{const two=()=>{const {S,clock}=world(179);
   S.settlement({id:'kautoa',faction:'town'});S.settlement({id:'valapo',faction:'town'});
   S.place({id:'kShed',kind:'warehouse',x:0,z:0,activities:{},settlement:'kautoa'});S.place({id:'vShed',kind:'warehouse',x:150,z:0,activities:{},settlement:'valapo'});
   const cfg=()=>({goods:{rice:{unit:'serving'},salt:{unit:'lot'}},window:1,spoil:{rice:0.1}});const EK=S.economy(cfg(),{settlement:'kautoa'}),EV=S.economy(cfg(),{settlement:'valapo'});
   S.store('kShed',{kind:'warehouse'});S.store('vShed',{kind:'warehouse'});S.R.place.kShed.stock={rice:1000,salt:100};S.R.place.vShed.stock={rice:10,salt:5};
   const R=S.trade({id:'line',stops:[{settlement:'kautoa',place:'kShed'},{settlement:'valapo',place:'vShed'}],cap:300,minutes:300,mins:30,keep:0,want:3,goods:{kautoa:['rice'],valapo:[]},expect:{valapo:{rice:50}}});
   const run=(m0,m1)=>{for(let m=m0;m<m1;m++){clock.h=(m%1440)/60;clock.d=Math.floor(m/1440);clock.t+=40;if(m%60===0)S.supply('rice',2,false,'valapo');S.step();}};
   return {S,run,R,EK,EV};};
 let W=two(),a=W.S.ledgerSnap();W.run(0,200);
 let mid=W.S.ledgerSnap(),L=W.S.ledger(a,mid);
 ok('the ledger: both towns balance with a load at sea, the load in neither',L.ok&&mid.sea.line['kautoa>valapo'].rice>0&&L.towns.valapo.rice.inbound===mid.sea.line['kautoa>valapo'].rice,!L.ok);
 ok('a statement says whose, in what unit, and the opening',L.towns.kautoa.rice.unit==='serving'&&L.towns.kautoa.rice.owner==='kautoa'&&L.towns.kautoa.rice.opening===1000,L.towns.kautoa.rice.owner!=='kautoa');
 W.run(200,1500);const c=W.S.ledgerSnap(),L2=W.S.ledger(a,c);
 ok('over a day: spoilage on its own line, not in consumed',L2.ok&&L2.towns.kautoa.rice.spoiled>0&&L2.towns.kautoa.rice.consumed===0,L2.towns.kautoa.rice.consumed>0);
 ok('a route\'s leg: shipped = landed + the change at sea',L2.routes.line['kautoa>valapo'].rice.shipped>0&&L2.towns.kautoa.rice.abroadOut===0&&L2.towns.valapo.rice.abroadIn===0,L2.towns.kautoa.rice.abroadOut!==0);
 W.S.R.place.kShed.stock.rice+=7;const P1=W.S.ledger(a,W.S.ledgerSnap());W.S.R.place.kShed.stock.rice-=7;
 ok('negative: 7 rice from nowhere is caught, and named',!P1.ok&&/kautoa rice/.test(P1.problems[0]),P1.ok);
 const lost=JSON.parse(JSON.stringify(c));lost.routes.line.landed['kautoa>valapo'].rice-=10;const P2=W.S.ledger(a,lost);
 ok('negative: 10 lost on the road is caught',!P2.ok&&P2.problems.some(p=>/line kautoa>valapo rice/.test(p)),P2.ok);
 const unb=JSON.parse(JSON.stringify(c));unb.towns.valapo.rice.imported-=20;unb.towns.valapo.rice.total-=20;const P3=W.S.ledger(a,unb);
 ok('negative: a load landed but never booked imported is caught',!P3.ok&&P3.problems.some(p=>/never booked imported/.test(p)),P3.ok);
 W.S.withEcon('kautoa',()=>{const n=W.S.economyTake('salt',30);W.S.economyBook('exported','salt',n);});const c2=W.S.ledgerSnap(),L3=W.S.ledger(c,c2);
 ok('what leaves the map is abroad, on no route',L3.ok&&L3.towns.kautoa.salt.abroadOut===30,L3.towns.kautoa.salt.abroadOut!==30);}
{const {S}=world(181);S.place({id:'shed',kind:'warehouse',x:0,z:0,activities:{}});S.economy({goods:{corn:{}},window:1});S.store('shed',{kind:'warehouse'});S.R.place.shed.stock={corn:50};
 const a=S.ledgerSnap();S.supply('corn',5);const L=S.ledger(a,S.ledgerSnap());
 ok('an unkeyed page has one ledger, under _',L.ok&&L.towns._.corn.consumed===5&&L.towns._.corn.closing===45,!L.ok);
 ok('no economy, an empty ledger',Object.keys(world(183).S.ledgerSnap().towns).length===0,false);}

// resource sites and stockpile policies (PLAN-ECONOMY.md Phase 1): a site's grade sets the yield, its id keys its take, an
// endless site never stops (the owner's rule), a finite one blocks and says so, regrows by night; a policy's max stops the
// makers, its reserve stays out of a route, its min holds a shelf
{const mk=(site,pol,gov)=>{const {S,clock}=world(191);['WORK','HAUL','UNLOAD'].forEach(a=>S.activity({id:a}));
   S.place({id:'shed',kind:'warehouse',x:0,z:0,activities:{}});S.place({id:'pit',kind:'mine',x:150,z:0,activities:{WORK:4},open:[0,24]});
   S.role({id:'miner',org:'folk',sched:[[0,'WORK']],prefers:{WORK:{pin:'work'}}});S.role({id:'carter',org:'folk',sched:[[0,'IDLE']]});
   const E=S.economy(Object.assign({goods:{ore:{unit:'lot'}},every:60,window:1,cart:{cap:500,load:5,unload:5,minLoad:5}},gov?{govern:{every:60,cover:3,ti:1.5,alpha:.3,min:.3,max:1.5}}:{}));
   S.store('shed',{kind:'warehouse'});if(site)S.site(Object.assign({id:'world:node-7',kind:'iron',goods:['ore']},site));
   S.recipe('pit',Object.assign({out:['ore'],rate:2,cap:100000},site?{site:'world:node-7'}:{}));S.R.place.shed.stock={ore:0};if(pol)S.stockpile(null,pol);
   [0,1].forEach(i=>S.actor({id:'m'+i,role:'miner',home:'homeA',work:'pit'}));S.cart(S.actor({id:'c',role:'carter',home:'homeA'}));
   const run=(h)=>{for(let m=E._m||0,e=m+h*60;m<e;m++){clock.h=(m%1440)/60;clock.d=Math.floor(m/1440);clock.t+=40;S.step();E._m=m+1;}};return {S,E,run};};
 const P=mk(null),H=mk({grade:'high',yield:2}),L=mk({grade:'low',yield:.5});[P,H,L].forEach(W=>W.run(10));
 ok('a site\'s grade sets the yield ('+H.E.made.ore+' high, '+P.E.made.ore+' plain, '+L.E.made.ore+' low)',H.E.made.ore>1.8*P.E.made.ore&&L.E.made.ore<.6*P.E.made.ore,H.E.made.ore<=P.E.made.ore);
 const R0=H.S.sitesReport()[0];ok('a site reports by its world id what it gave, and an endless one has no amount',R0.id==='world:node-7'&&R0.taken===H.E.made.ore&&R0.amount===null,R0.taken!==H.E.made.ore);
 const a=H.S.ledgerSnap();H.run(5);const LG=H.S.ledger(a,H.S.ledgerSnap());ok('the ledger reconciles a site\'s take with what was made',LG.ok&&LG.sites['world:node-7'].taken>0,!LG.ok);
 const bad=JSON.parse(JSON.stringify(H.S.ledgerSnap()));bad.sites['world:node-7'].taken+=50;ok('negative: a site that gave more than was made is caught',!H.S.ledger(a,bad).ok,H.S.ledger(a,bad).ok);
 const F=mk({amount:30});F.run(12);ok('a finite site stops at nothing left and says why',F.E.made.ore===30&&F.S.sitesReport()[0].amount===0&&F.E.blocked['depleted: world:node-7']>0,F.E.made.ore>30);
 const Fr=mk({amount:30,regen:10});Fr.run(30);ok('a site with regen grows back by night',Fr.E.made.ore>30,Fr.E.made.ore<=30);
 const noMax=mk(null,null,true),Mx=mk(null,{ore:{max:60}},true);[noMax,Mx].forEach(W=>W.run(72));
 ok('a policy\'s max stops the makers ('+Mx.E.made.ore+' made, '+noMax.E.made.ore+' without; rate '+Mx.E.recipes.pit.rate+')',Mx.E.recipes.pit.rate===0&&Mx.E.made.ore<noMax.E.made.ore,Mx.E.recipes.pit.rate>0);
 const Mn=mk(null,{ore:{min:100}},true);Mn.run(72);const sm=Mn.S.economyGoverned().ore;ok('a policy\'s min holds a shelf with no demand',sm.target===100&&noMax.S.economyGoverned().ore.target===0,sm.target!==100);}
{const go=(pol)=>{const {S,clock}=world(193);S.settlement({id:'kautoa',faction:'town'});S.settlement({id:'valapo',faction:'town'});
   S.place({id:'kShed',kind:'warehouse',x:0,z:0,activities:{},settlement:'kautoa'});S.place({id:'vShed',kind:'warehouse',x:150,z:0,activities:{},settlement:'valapo'});
   const cfg=()=>({goods:{rice:{}},window:1});S.economy(cfg(),{settlement:'kautoa'});const EV=S.economy(cfg(),{settlement:'valapo'});S.store('kShed',{kind:'warehouse'});S.store('vShed',{kind:'warehouse'});S.R.place.kShed.stock={rice:400};
   if(pol)S.stockpile('kautoa',pol);S.trade({id:'line',stops:[{settlement:'kautoa',place:'kShed'},{settlement:'valapo',place:'vShed'}],cap:1000,minutes:60,mins:30,keep:0,want:100,goods:{kautoa:['rice'],valapo:[]},expect:{valapo:{rice:50}}});
   for(let m=0;m<200;m++){clock.h=(m%1440)/60;clock.t+=40;S.step();}return EV.imported.rice||0;};
 const r=go({rice:{reserve:300}}),n=go(null);ok('a policy\'s reserve stays out of a route ('+r+' sent, '+n+' without)',r===100&&n===400,r>100);}

// better tools (77-sim-6-items.js `prefer`, `base`; the isles' iron tools): a worn tool's errand buys the better kind when
// its seller sells it and the town holds its good, else its own, the miss booked short of the better good; a better tool
// worn out is sought as its base, so a town out of iron falls back; an undeclared good is never bought free
{const mk=(o)=>{o=o||{};const {S,clock}=world(211);
   ['WORK','EAT'].forEach(a=>{ if(!S.R.activity[a]) S.activity({id:a}); });
   S.settlement({id:'valapo',faction:'town'});
   S.place({id:'vHome',kind:'house',x:150,z:0,activities:{SLEEP:6,EAT:6},settlement:'valapo'});S.place({id:'vFarm',kind:'field',x:100,z:60,activities:{WORK:6},open:[0,24],settlement:'valapo'});
   S.place({id:'vShed',kind:'warehouse',x:50,z:0,activities:{},settlement:'valapo'});S.place({id:'vShop',kind:'shop',x:60,z:0,activities:{BUY:4},open:[6,20],settlement:'valapo'});
   const goods={rice:{},tools:{}};if(o.declared!==false)goods.irontools={};
   const EV=S.economy({goods:goods,every:60,window:1},{settlement:'valapo'});S.store('vShed',{kind:'warehouse'});
   S.R.place.vShed.stock={rice:500,tools:100,irontools:2};
   S.items({kinds:{rice:{cat:'food',food:true},stone:Object.assign({cat:'tool',workLife:20,good:'tools'},o.prefer===false?{}:{prefer:['iron']}),iron:{cat:'tool',workLife:30,good:'irontools',base:'stone'},hoe:{cat:'tool',workLife:20,good:'tools',prefer:['iron']}},free:['IDLE'],secPerMinute:40});
   S.shop('vShop',o.sells===false?['stone','rice']:['stone','iron','hoe','rice']);
   S.role({id:'grower',org:'folk',sched:[[0,'SLEEP'],[6,'WORK'],[18,'EAT'],[19,'SLEEP']],prefers:{SLEEP:{pin:'home'},EAT:{pin:'home'},WORK:{pin:'work'}}});
   const ps=[0,1,2,3].map(i=>{const a=S.actor({id:'vg'+i,role:'grower',home:'vHome',work:'vFarm'});a.tool={k:o.given?'iron':o.hoe?'hoe':'stone',w:0.1*i};return a;});
   S.R.place.vHome.store={rice:200};S.R.place.vHome.people=4;
   clock.d=0;clock.h=0;S.level('valapo','abstract');
   for(let m=0;m<6*1440;m++){clock.h=(m%1440)/60;clock.d=Math.floor(m/1440);clock.t+=40;S.step();}
   return {S,EV,ps,B:(S.ITEMS.statsBy||{}).valapo||S.ITEMS.stats};};
 const A=mk(),bA=A.B.bought||{},brA=A.S.ITEMS.stats.brokenBy||{};
 ok('better tools: the town\'s two iron tools bought first, then stone ('+(bA.iron||0)+' iron, '+(bA.stone||0)+' stone; irontools used '+(A.EV.used.irontools||0)+')',bA.iron===2&&A.EV.used.irontools===2&&bA.stone>=2&&A.ps.every(a=>a.tool),!(bA.iron>0));
 ok('out of iron, the miss is booked short of the better good (the town\'s want: '+(A.EV.short.irontools||0)+')',A.EV.short.irontools>0,!(A.EV.short.irontools>0));
 ok('an iron tool worn out is sought as stone and replaced from it ('+(brA.iron||0)+' worn out)',brA.iron>=1&&A.ps.every(a=>a.tool&&!a.toolNeed),!(brA.iron>=1));
 const N=mk({prefer:false}),bN=N.B.bought||{};ok('without prefer, stone is replaced by stone',!(bN.iron>0)&&bN.stone>=4&&!(N.EV.short.irontools>0),bN.iron>0);
 const U=mk({declared:false}),bU=U.B.bought||{};ok('a better good the economy does not hold is never bought free',!(bU.iron>0)&&bU.stone>=4,bU.iron>0);
 const W=mk({sells:false}),bW=W.B.bought||{};ok('a seller without the better tool sells its own',!(bW.iron>0)&&bW.stone>=4,bW.iron>0);
 // a better tool remembers what it stood in for: a field hand's iron tool, worn out, is sought as its hoe again (not the
 // iron kind's `base`, the stone tool); an iron tool given at the start, with nothing remembered, falls back to the base
 const H=mk({hoe:true}),bH=H.B.bought||{};
 ok('a field hand\'s iron tool worn out is sought as its hoe again ('+(bH.iron||0)+' iron, '+(bH.hoe||0)+' hoes, '+(bH.stone||0)+' stone)',bH.iron===2&&bH.hoe>=2&&!(bH.stone>0)&&H.ps.every(a=>a.tool),bH.stone>0);
 const G=mk({given:true}),bG=G.B.bought||{};ok('an iron tool given at the start falls back to its kind\'s base ('+(bG.stone||0)+' stone)',bG.stone>0,!(bG.stone>0));}

// batch recipes (PLAN-ECONOMY.md Phase 2): inputs claimed once at the start, outputs and byproducts at the end, and what
// stops a batch said by place: no input, a partial input, no workers, a full store, an empty site
{const mk=(o)=>{o=o||{};const {S,clock}=world(197);['WORK'].forEach(a=>S.activity({id:a}));
   S.place({id:'shed',kind:'warehouse',x:0,z:0,activities:{}});S.place({id:'forge',kind:'smithy',x:150,z:0,activities:{WORK:4},open:[0,24]});
   S.role({id:'smith',org:'folk',sched:[[0,'WORK']],prefers:{WORK:{pin:'work'}}});
   const E=S.economy({goods:{ore:{},coal:{},iron:{},slag:{}},every:60,window:1});S.store('shed',{kind:'warehouse'});if(o.site)S.site(Object.assign({id:'n1',goods:['iron']},o.site));
   S.recipe('forge',Object.assign({batch:{'in':{ore:2,coal:1},out:{iron:1},by:{slag:1},hours:2},cap:o.cap==null?1000:o.cap},o.site?{site:'n1'}:{}));S.R.place.shed.stock=o.stock||{ore:20,coal:10};
   if(o.smiths!==0)[0,1].forEach(i=>S.actor({id:'s'+i,role:'smith',home:'homeA',work:'forge'}));
   const run=(h)=>{for(let m=E._m||0,e=m+h*60;m<e;m++){clock.h=(m%1440)/60;clock.d=Math.floor(m/1440);clock.t+=40;S.step();E._m=m+1;}};return {S,E,run};};
 const A=mk();const a0=A.S.ledgerSnap();A.run(30);const L=A.S.ledger(a0,A.S.ledgerSnap());
 ok('a batch makes its outputs and byproduct from its inputs (10 batches from 20 ore and 10 coal)',A.E.made.iron===10&&A.E.made.slag===10&&A.E.used.ore===20&&A.E.used.coal===10,A.E.made.iron!==10);
 ok('the ledger balances over batches',L.ok,!L.ok);
 ok('out of input it says what is missing',A.S.blockedReport().forge.reason==='missing'&&A.S.blockedReport().forge.goods.indexOf('ore')>=0,!A.S.blockedReport().forge);
 const P=mk({stock:{ore:1,coal:9}});P.run(10);ok('a partial input claims nothing',!(P.E.used.coal>0)&&P.S.R.place.shed.stock.coal===9&&P.S.blockedReport().forge.goods.join()==='ore',P.E.used.coal>0);
 const N=mk({smiths:0});N.run(3);ok('nobody at work is said',N.S.blockedReport().forge.reason==='no workers',!N.S.blockedReport().forge);
 const F=mk({cap:3});F.run(10);ok('a full store stops it and says so',F.S.blockedReport().forge.reason==='full'&&F.E.made.iron<=2,F.E.made.iron>3);
 const D=mk({site:{amount:3}});D.run(20);ok('an empty site stops it, its batch whole',D.S.blockedReport().forge.reason==='depleted'&&D.E.made.iron===3&&D.S.sitesReport()[0].amount===0,D.E.made.iron!==3);
 const R=mk();R.run(30);R.S.R.place.shed.stock.ore=4;R.S.R.place.shed.stock.coal=2;R.run(10);ok('fed again it runs',R.E.made.iron===12,R.E.made.iron!==12);}

// a work camp's controls (core/camp 40): a recipe held while its crew marches (its hours lost, the reason said, released at
// `until`), pointed at the stand it moved to, and a stand grown back while nobody worked it booked `regrown`, which the
// ledger allows (an amount raised without it is caught)
{const mk=()=>{const {S,clock}=world(203);['WORK'].forEach(a=>S.activity({id:a}));
   S.place({id:'shed',kind:'warehouse',x:0,z:0,activities:{}});S.place({id:'camp',kind:'fellcamp',x:150,z:0,activities:{WORK:4},open:[0,24]});
   S.role({id:'feller',org:'folk',sched:[[0,'WORK']],prefers:{WORK:{pin:'work'}}});
   const E=S.economy({goods:{logs:{},brush:{}},every:60,window:1});S.store('shed',{kind:'warehouse'});
   S.site({id:'s1',goods:['logs'],amount:40});S.site({id:'s2',goods:['logs'],amount:400});
   S.recipe('camp',{batch:{'in':{},out:{logs:1},by:{brush:1},hours:1},cap:1000,site:'s1'});[0,1].forEach(i=>S.actor({id:'feller'+i,role:'feller',home:'homeA',work:'camp'}));
   const run=(h)=>{for(let m=E._m||0,e=m+h*60;m<e;m++){clock.h=(m%1440)/60;clock.d=Math.floor(m/1440);clock.t+=40;S.step();E._m=m+1;}};return {S,E,run};};
 const A=mk();A.run(4);const m0=A.E.made.logs||0;A.S.recipeHold('camp','moving camp',A.E._m+5*60);A.run(4);const held=(A.E.made.logs||0)-m0,why=A.S.blockedReport().camp;A.run(4);
 ok('a held recipe makes nothing and says why ('+(why&&why.reason)+'), then runs at its minute',held===0&&why&&why.reason==='moving camp'&&(A.E.made.logs||0)>m0&&!A.S.blockedReport().camp,held>0);
 const B=mk();B.run(3);const t1=B.S.R&&B.E.resSites.s1.taken;B.S.recipeSite('camp','s2');B.run(3);
 ok('a recipe pointed at another site draws on it ('+B.E.resSites.s2.taken+' from s2, s1 stays at '+B.E.resSites.s1.taken+')',B.E.resSites.s2.taken>0&&B.E.resSites.s1.taken===t1,(()=>{try{B.S.recipeSite('camp','nowhere');return true;}catch(e){return false;}})());
 const C=mk();C.run(30);const a0=C.S.ledgerSnap();const left=C.E.resSites.s1.amount;C.S.siteRestore('s1',30);C.run(2);const L=C.S.ledger(a0,C.S.ledgerSnap());
 const D=mk();D.run(30);const d0=D.S.ledgerSnap();D.E.resSites.s1.amount=30;D.run(2);const LD=D.S.ledger(d0,D.S.ledgerSnap());
 ok('a stand grown back is booked regrown and the ledger allows it ('+left+' to 30, regrown '+C.E.resSites.s1.regrown+')',left<30&&C.E.resSites.s1.regrown===30-left&&L.ok,LD.ok);}

// crime and punishment (77-sim-6-crime.js; the Voth brief 1.7): a pickpocket at the market unseen takes from a
// victim's purse (its material meter); seen with a guard on duty near, it is arrested and held at the jail for its days,
// then let go; seen with no guard near, it escapes; a burglar carries food from another household to its own, none lost;
// a jailed worker does not work at the abstract level either. Each with its negative
{const mk=(o)=>{o=o||{};const {S,clock}=world(229);['WORK'].forEach(a=>S.activity({id:a}));
   S.place({id:'post',kind:'post',x:100,z:50,activities:{WORK:2}});S.place({id:'cell',kind:'barracks',x:0,z:0,activities:{SLEEP:4}});S.place({id:'homeC',kind:'home',x:100,z:0,activities:{SLEEP:2,REST:2}});
   S.role({id:'loafer',org:'folk',sched:[[0,'SLEEP'],[6,'SOCIALIZE'],[20,'SLEEP']],prefers:{SLEEP:{pin:'home'},SOCIALIZE:{kinds:['market']}}});
   S.role({id:'guard',org:'folk',sched:[[0,'WORK']],prefers:{WORK:{pin:'work'}}});
   S.actor({id:'thief',role:'loafer',home:'homeC'});S.actor({id:'v1',role:'loafer',home:'homeA'});S.actor({id:'v2',role:'loafer',home:'homeB'});
   if(o.guard!==false) S.actor({id:'g1',role:'guard',home:'homeA',work:'post'});
   S.needs({list:['material'],rate:{material:0},init:10});
   S.R.place.homeA.store={rice:100,fish:60};S.R.place.homeB.store={rice:80};S.R.place.homeC.store={};
   S.crime({seed:5,share:1,who:a=>a.id==='thief',guard:a=>a.role==='guard',jails:['barracks'],guardActs:['WORK'],
     crimes:o.crimes||{pickpocket:{acts:['SOCIALIZE'],at:['market'],hours:[6,20],chance:1,loss:20,gain:20}},
     seen:{base:o.seen==null?0:o.seen,perWitness:0,guard:0,night:1},arrest:{reach:300,base:1},jail:{days:o.days||7,resist:0}});
   const run=(h)=>{for(let m=S._m||0,e=m+h*60;m<e;m++){clock.h=(m%1440)/60;clock.d=Math.floor(m/1440);clock.t+=40;S.step();S._m=m+1;}};return {S,run};};
 const A=mk();A.run(14);const RA=A.S.crimeReport(),mat=a=>{A.S.needsOf(a,A.S.minute());return a.nd[A.S.NEED.idx.material];};
 ok('a pickpocket unseen at the market takes from its victims ('+(RA.stats[''].done.pickpocket||0)+' done; the victims\' material '+Math.round(mat(A.S.R.actor.v1))+' and '+Math.round(mat(A.S.R.actor.v2))+')',
   RA.criminals===1&&RA.stats[''].done.pickpocket>0&&!RA.jailed.length&&(mat(A.S.R.actor.v1)>10||mat(A.S.R.actor.v2)>10),!(RA.stats[''].done.pickpocket>0));
 const B=mk({seen:1});B.run(12);const RB=B.S.crimeReport(),th=B.S.R.actor.thief;B.run(1);
 ok('seen, with a guard on duty near, it is arrested and held at the jail for its seven days ('+(RB.jailed[0]&&RB.jailed[0].place)+')',
   RB.stats[''].arrested.pickpocket===1&&RB.jailed.length===1&&RB.jailed[0].place==='cell'&&B.S.jailed(th)&&th.place==='cell'&&th.cmd.until===RB.jailed[0].until&&B.S.CRIME.held.thief.until-B.S.CRIME.held.thief.since===7*1440,
   !(RB.stats[''].arrested.pickpocket>0));
 B.run(3*24);const held3=B.S.jailed(th)&&th.place==='cell';const until=th.cmd.until;B.run(Math.ceil((until-B.S.minute())/60)+1);const RB2=B.S.crimeReport();
 ok('it stays in its cell through its term and is let go at its end (served '+RB2.stats[''].served+', out at day '+Math.floor(B.S.minute()/1440)+')',held3&&!B.S.jailed(th)&&RB2.stats[''].served===1&&!RB2.jailed.length,!held3);
 B.run(36);ok('let go, it lies low two days before it tries again ('+(B.S.crimeReport().stats[''].attempts.pickpocket)+' attempts in all)',B.S.crimeReport().stats[''].attempts.pickpocket===1,B.S.crimeReport().stats[''].attempts.pickpocket>1);
 const C=mk({seen:1,guard:false});C.run(14);const RC=C.S.crimeReport();
 ok('seen with no guard near, it escapes ('+(RC.stats[''].escaped.pickpocket||0)+' escaped)',RC.stats[''].escaped.pickpocket>0&&!RC.jailed.length,RC.jailed.length>0);
 const food=W=>['homeA','homeB','homeC'].reduce((n,id)=>n+Object.values(W.S.R.place[id].store||{}).reduce((a,b)=>a+b,0),0);
 const D=mk({crimes:{burglary:{hours:[1,4],chance:1,share:0.5}}}),f0=food(D);D.run(30);const RD=D.S.crimeReport();
 const Z=mk({crimes:{burglary:{hours:[1,4],chance:1,share:0}}});Z.run(30);
 ok('a burglar carries food from another household to its own, none lost ('+RD.stats[''].stolen+' servings to its home)',RD.stats[''].stolen>0&&food(D)===f0&&Object.values(D.S.R.place.homeC.store).reduce((a,b)=>a+b,0)===RD.stats[''].stolen,
   Z.S.crimeReport().stats[''].stolen>0);
 // the abstract level: a jailed worker is not counted at work
 const W=(jail)=>{const {S,clock}=world(233);S.activity({id:'WORK'});S.settlement({id:'valapo',faction:'town'});
   S.place({id:'vH',kind:'house',x:150,z:0,activities:{SLEEP:4},settlement:'valapo'});S.place({id:'vF',kind:'field',x:100,z:60,activities:{WORK:4},open:[0,24],settlement:'valapo'});
   S.place({id:'vS',kind:'warehouse',x:50,z:0,activities:{},settlement:'valapo'});
   const E=S.economy({goods:{rice:{}},every:60,window:1},{settlement:'valapo'});S.store('vS',{kind:'warehouse'});S.recipe('vF',{out:['rice'],rate:1,cap:3000});
   S.role({id:'grower',org:'folk',sched:[[0,'WORK']],prefers:{WORK:{pin:'work'}}});const a=S.actor({id:'vg',role:'grower',home:'vH',work:'vF'});
   S.level('valapo','abstract');if(jail)S.command(a,{act:'SLEEP',place:'vH',until:2*1440,by:'jail'});
   for(let m=0;m<1440;m++){clock.h=(m%1440)/60;clock.d=Math.floor(m/1440);clock.t+=40;S.step();}return E.made.rice||0;};
 const wj=W(true),wf=W(false);ok('a jailed worker does not work at the abstract level ('+wj+' made, '+wf+' free)',wj===0&&wf>0,wf===0);}

// the thieves' guild (77-sim-6-crime.js `guild`; owner, 2026-11-02): one a town, the tavern farthest from the jail; a
// burglar's loot (food, and a spare shirt) carried there in a free hour and fenced (the food into its store, the shirt on
// its shelf, the thief's material meter down); a thief seen near it hides there, out of the guard's reach, and is not
// arrested; an arrested thief's loot goes back to the household; nobody picks a pocket in the guild. Each with a negative
{const mk=(o)=>{o=o||{};const {S,clock}=world(239);['WORK'].forEach(a=>S.activity({id:a}));
   S.place({id:'post',kind:'post',x:o.postX==null?100:o.postX,z:o.postZ==null?50:o.postZ,activities:{WORK:2}});S.place({id:'cell',kind:'barracks',x:0,z:0,activities:{SLEEP:4}});
   S.place({id:'homeC',kind:'home',x:100,z:0,activities:{SLEEP:2,REST:2}});
   S.place({id:'nearTav',kind:'tavern',x:10,z:0,activities:{SOCIALIZE:6}});S.place({id:'den',kind:'tavern',x:120,z:60,activities:{SOCIALIZE:6}});
   S.role({id:'loafer',org:'folk',sched:[[0,'SLEEP'],[6,'SOCIALIZE'],[20,'SLEEP']],prefers:{SLEEP:{pin:'home'},SOCIALIZE:{kinds:o.at||['market']}}});
   S.role({id:'guard',org:'folk',sched:[[0,'WORK']],prefers:{WORK:{pin:'work'}}});
   S.actor({id:'thief',role:'loafer',home:'homeC'});const v1=S.actor({id:'v1',role:'loafer',home:'homeA'});S.actor({id:'v2',role:'loafer',home:'homeB'});
   S.actor({id:'g1',role:'guard',home:'homeA',work:'post'});
   S.needs({list:['material'],rate:{material:0},init:30});
   S.items({kinds:{shirt:{cat:'clothes',slot:'torso',life:900}},free:['IDLE'],secPerMinute:40});v1.inv={shirt:2};
   S.R.place.homeA.store={rice:100,fish:60};S.R.place.homeB.store={rice:80};S.R.place.homeC.store={};
   S.crime({seed:5,share:1,who:a=>a.id==='thief',guard:a=>a.role==='guard',jails:['barracks'],guardActs:['WORK'],crimes:o.crimes,
     seen:{base:o.seen==null?0:o.seen,perWitness:0,guard:0,night:1},arrest:{reach:300,base:1},jail:{days:7,resist:0},
     guild:o.guild===false?null:{kinds:['tavern'],hideReach:300,hideMins:120,items:1,fence:{acts:['SOCIALIZE'],mins:30,perServing:0.2,perItem:8}}});
   const run=(h)=>{for(let m=S._m||0,e=m+h*60;m<e;m++){clock.h=(m%1440)/60;clock.d=Math.floor(m/1440);clock.t+=40;S.step();S._m=m+1;}};return {S,run};};
 const food=W=>['homeA','homeB','homeC','den'].reduce((n,id)=>n+Object.values(W.S.R.place[id].store||{}).reduce((a,b)=>a+b,0),0);
 const A=mk({crimes:{burglary:{hours:[1,4],chance:1,share:0.5}}}),G=A.S.guildOf(null);
 ok('the guild is the tavern farthest from the jail ('+(G&&G.id)+')',G&&G.id==='den'&&G.guild,!(G&&G.id==='den'));
 const f0=food(A);A.run(5);const R1=A.S.crimeReport(),car=R1.carrying.length;A.run(10);const R2=A.S.crimeReport(),th=A.S.R.actor.thief;
 A.S.needsOf(th,A.S.minute());
 ok('a burglar\'s loot is fenced at the guild in a free hour ('+R2.stats[''].fenced+' servings, '+R2.stats[''].fencedItems+' shirt; the stash '+JSON.stringify(R2.guild.stash)+'), none lost',
   car===1&&R2.stats[''].fenced>0&&R2.guild.stash.shirt===1&&!R2.carrying.length&&food(A)===f0&&A.S.R.actor.v1.inv.shirt===1&&th.nd[A.S.NEED.idx.material]<30,
   !(R2.stats[''].fenced>0));
 // hiding: a pickpocket seen at the market, the guild 20 m off, the guard 120 m off
 const pp={pickpocket:{acts:['SOCIALIZE'],at:['market'],hours:[6,20],chance:1}};
 const H=mk({crimes:pp,seen:1,postX:0,postZ:10});H.run(8);const RH=H.S.crimeReport();
 const N=mk({crimes:pp,seen:1,postX:0,postZ:10,guild:false});N.run(8);const RN=N.S.crimeReport();
 ok('a thief seen near the guild hides there and is not arrested ('+(RH.stats[''].hid.pickpocket||0)+' hid; without a guild '+(RN.stats[''].arrested.pickpocket||0)+' arrested)',
   RH.stats[''].hid.pickpocket>0&&!(RH.stats[''].arrested.pickpocket>0)&&!RH.jailed.length,!(RN.stats[''].arrested.pickpocket>0));
 // recovery: a thief carrying loot arrested gives it back
 const Rc=mk({crimes:{}}),thc=Rc.S.R.actor.thief;Rc.run(1);Rc.S.R.place.homeA.store.rice-=20;Rc.S.R.place.homeC.store.rice=20;Rc.S.R.actor.v1.inv.shirt--;
 Rc.S.crimeLoot(thc,{from:'homeA',food:{rice:20},items:[{item:'shirt',owner:'v1'}]});const caught=Rc.S.crimeAlarm(thc,'burglary',{x:100,z:50,place:'post'});
 ok('an arrested thief\'s loot goes back to the household ('+Rc.S.R.place.homeA.store.rice+' rice, '+Rc.S.R.actor.v1.inv.shirt+' shirts)',caught&&Rc.S.R.place.homeA.store.rice===100&&Rc.S.R.actor.v1.inv.shirt===2&&!thc.loot,
   Rc.S.R.place.homeC.store.rice>0);
 // no pocket picked in the guild: the loafers spend their day there
 const Q=mk({crimes:pp,at:['tavern']});Q.run(14);const RQ=Q.S.crimeReport(),inDen=Q.S.R.actor.thief.place;
 const Q2=mk({crimes:{pickpocket:{acts:['SOCIALIZE'],at:['tavern'],hours:[6,20],chance:1}},at:['tavern'],guild:false});Q2.run(14);
 ok('nobody picks a pocket inside the guild (the thief at '+inDen+', '+(RQ.stats[''].attempts.pickpocket||0)+' tried there)',!(RQ.stats[''].attempts.pickpocket>0),Q2.S.crimeReport().stats[''].attempts.pickpocket>0===false);}

// money (77-sim-6-money.js, PLAN-MONEY.md M0): accounts in a nation's currency, integers; mint and burn the only faucet and
// sink; a payment conserves its currency, never overdraws, is booked out of one settlement and into another; an exchange
// goes through the changers at the rates to the Talent less their spread; the ledger holds every settlement's money to its
// books, exactly, and catches a balance changed by hand, an account gone, money paid out of a town that never came in
{const mk=()=>{const {S,clock}=world(241);S.settlement({id:'kautoa',faction:'town'});S.settlement({id:'valapo',faction:'town'});
   S.money({currencies:{talent:{name:'Izani Talent',talent:1},shell:{name:'Kautoan shells',talent:0.05}},spread:0.03});
   S.account({id:'hhA',kind:'household',currency:'shell',settlement:'kautoa'});S.account({id:'hhB',kind:'household',currency:'shell',settlement:'valapo'});
   S.account({id:'tre',kind:'treasury',currency:'shell',settlement:'kautoa'});S.account({id:'shop',kind:'workplace',currency:'shell',settlement:'kautoa',ownedBy:'tre'});
   S.account({id:'player',kind:'player',currency:'talent'});
   S.mint('hhA',200,'endowment');S.mint('hhB',100,'endowment');S.mint('tre',5000,'reserve');S.mint('player',50,'endowment');
   S.mint('changer:shell',10000,'reserve');S.mint('changer:talent',1000,'reserve');return S;};
 const S=mk(),a0=S.ledgerSnap();
 const p1=S.pay('hhA','shop',30,'purchase'),p2=S.pay('hhA','hhB',500,'gift'),p3=S.pay('hhB','tre',90,'tribute',true),p4=S.pay('hhB','tre',500,'tribute',true);
 const b1=S.burn('tre',100,'offering'),ex=S.exchange('player','hhA',10,'player buys');
 const L=S.ledger(a0,S.ledgerSnap()),R=S.moneyReport();
 ok('a payment conserves its currency and never overdraws ('+p1+' paid, '+p2+' of 500 asked, '+p3+' of 90 whole, '+p4+' of 500 whole)',p1===30&&p2===170&&p3===90&&p4===0&&S.acct('hhA').balance===200-30-170+ex&&S.acct('hhB').balance===100+170-90&&S.accounts().every(A=>A.balance>=0),p2===500);
 ok('only mint and burn change the supply ('+R.currencies.shell.supply+' shells, '+JSON.stringify(R.currencies.shell.minted)+' minted, '+JSON.stringify(R.currencies.shell.burned)+' burned)',
   R.currencies.shell.supply===200+100+5000+10000-100&&R.currencies.talent.supply===1050,R.currencies.shell.supply!==15200);
 ok('an exchange goes through the changers at the rates to the Talent, less the spread (10 Talents to '+ex+' shells)',ex===Math.floor(10/0.05*0.97)&&S.acct('changer:talent').balance===1010&&S.acct('changer:shell').balance===10000-ex,ex===200);
 let threw=false;try{S.pay('player','hhA',1,'x');}catch(e){threw=true;}
 ok('a payment between currencies is refused (an exchange is the way)',threw,!threw);
 ok('the ledger holds every settlement\'s money to its books (kautoa: '+JSON.stringify(L.money&&L.money.towns.kautoa.shell)+')',L.ok&&L.money.towns.valapo.shell['in']===170&&L.money.towns.valapo.shell.out===90&&L.money.towns.kautoa.shell.out===170&&L.money.towns.kautoa.shell['in']===90+ex,!L.ok);
 const T1=mk(),c0=T1.ledgerSnap();T1.acct('hhA').balance+=25;const L1=T1.ledger(c0,T1.ledgerSnap());
 ok('a balance changed by hand is caught ('+L1.problems[0]+')',!L1.ok&&/off by 25/.test(L1.problems.join()),L1.ok);
 const T2=mk(),d0=T2.ledgerSnap(),sn=T2.ledgerSnap();sn.money.towns.valapo.shell['in']+=40;sn.money.towns.valapo.shell.total+=40;const L2=T2.ledger(d0,sn);
 ok('money paid into a town that no town paid out is caught',!L2.ok&&L2.problems.some(p=>/paid out of settlements/.test(p)),L2.ok);
 const T3=mk(),e0=T3.ledgerSnap(),sg=T3.ledgerSnap();delete sg.money.accounts.hhB;const L3=T3.ledger(e0,sg);
 ok('an account gone is caught',!L3.ok&&L3.problems.some(p=>/is gone/.test(p)),L3.ok);
 let bad=false;try{S.mint('hhA',1.5,'x');}catch(e){bad=true;}ok('money is whole numbers only',bad,!bad);}

// money M1 (77-sim-6-money.js `m1`; PLAN-MONEY.md): prices at labour cost (bread its baking plus its rice), a calibration
// day that measures and pays nothing, then wages at midnight for the rota's hours into each worker's household, the
// households paying for their food, a household with no wage and no money fed on the treasury's dole, nobody paid while
// held, the circular flow (wages = spending + saving) and the ledger holding. Each with a negative
{const mk=(o)=>{o=o||{};const {S,clock}=world(251);S.activity({id:'WORK'});S.settlement({id:'kautoa',faction:'town'});
   const P=(id,kind,x,acts)=>S.place({id,kind,x,z:0,activities:acts,open:[0,24],settlement:'kautoa'});
   P('shed','warehouse',10,{});P('farm','field',60,{WORK:4});P('bake','bakehouse',80,{WORK:2});P('hA','house',100,{SLEEP:4,EAT:4});P('hB','house',120,{SLEEP:4,EAT:4});P('hC','house',140,{SLEEP:4,EAT:4});
   S.economy(Object.assign({goods:o.treat?{rice:{},bread:{},kava:{}}:{rice:{},bread:{}},inputs:{bread:{rice:1}},every:60,window:1,meal:{per:2,foods:['rice','bread']}},o.govern?{govern:{every:60,cover:3,ti:1.5,alpha:0.3,min:0.3,max:1.5,smooth:2,window:1}}:{}),{settlement:'kautoa'});S.store('shed',{kind:'warehouse'});
   S.recipe('farm',{out:['rice'],rate:2,cap:5000});S.recipe('bake',{out:['bread'],rate:4,cap:5000});S.R.place.shed.stock={rice:400,bread:200};
   if(o.treat){S.needs({list:['material'],rate:{material:0.5},init:10});P('shop','shop',90,{BUY:6});S.R.place.shed.stock.kava=5000;}
   if(o.stations){S.needs({list:['material'],rate:{material:0.2},init:10});P('shop','shop',90,{BUY:6,WORK:2});}
   S.items(Object.assign({kinds:Object.assign({rice:{cat:'food',food:true},bread:{cat:'food',food:true}},o.treat?{'kava bowl':{cat:'luxury',material:25,good:'kava'}}:{}),free:['IDLE'],secPerMinute:40,meals:2,perMeal:2,low:1,days:1},o.treat?{treat:{at:30,items:[[0,'kava bowl']]}}:{}));
   if(o.treat) S.shop('shop',['kava bowl']);
   if(o.stations) S.shop('shop',['rice','bread']);
   S.role({id:'grower',org:'folk',sched:[[0,'SLEEP'],[6,'WORK'],[18,'SLEEP']],prefers:{WORK:{pin:'work'}}});S.role({id:'idler',org:'folk',sched:[[0,'SLEEP']]});
   const gs=[0,1,2].map(i=>S.actor({id:'gr'+i,role:'grower',home:'hA',work:i<2?'farm':'bake'}));S.actor({id:'gr3',role:'grower',home:'hB',work:'farm'});S.actor({id:'id0',role:'idler',home:'hC'});
   S.all('actor').forEach(a=>{a.cls='poor';a.wealth=0.1;});
   ['hA','hB','hC'].forEach(h=>{S.R.place[h].store={rice:4};S.R.place[h].people=h==='hA'?3:1;});
   S.money({currencies:{shell:{name:'shells',talent:0.05}},m1:{wage:()=>3,priceWage:3,calibrate:o.calibrate===false?false:o.calibrate||1,ration:!!o.ration,spend:o.spend||null,stations:o.stations||null},m2:o.m2||null});
   S.account({id:'treasury:kautoa',kind:'treasury',currency:'shell',settlement:'kautoa'});S.mint('treasury:kautoa',o.reserve==null?3000:o.reserve,'reserve');
   ['farm','bake'].concat(o.stations?['shop']:[]).forEach(w=>S.account({id:'wp:'+w,owner:w,kind:'workplace',currency:'shell',settlement:'kautoa',ownedBy:'treasury:kautoa'}));
   ['hA','hB','hC'].forEach(h=>S.account({id:'hh:'+h,owner:h,kind:'household',currency:'shell',settlement:'kautoa'}));S.mint('hh:hA',o.rich==null?60:o.rich,'endowment');S.mint('hh:hB',30,'endowment');
   if(o.jail) S.command(gs[0],{act:'SLEEP',place:'hA',until:3*1440,by:'jail'});
   clock.d=0;clock.h=0;S.level('kautoa','abstract');const run=(d)=>{for(let m=S._m||0,e=m+Math.round(d*1440);m<e;m++){clock.h=(m%1440)/60;clock.d=Math.floor(m/1440);clock.t+=40;S.step();S._m=m+1;}};return {S,run};};
 const A=mk();A.run(1+1/1440);const day0=A.S.moneyReport().currencies.shell.paid,mk0=A.S.moneyM1().markup.kautoa,a0=A.S.ledgerSnap(),hh0=['hA','hB','hC'].map(h=>A.S.acct('hh:'+h).balance);A.run(2);const R=A.S.moneyM1(),L=A.S.ledger(a0,A.S.ledgerSnap());
 const P=A.S.MONEY.m1.price.kautoa,C=A.S.MONEY.m1.cost.kautoa;
 ok('prices at labour cost: rice '+C.rice+', bread '+C.bread+' (its baking and its rice); at the markup '+mk0.toFixed(2)+': rice '+P.rice+', bread '+P.bread,
   Math.abs(C.rice-1.5)<1e-9&&Math.abs(C.bread-(0.75+1.5))<1e-9&&P.bread>P.rice&&P.rice>=1&&Number.isInteger(P.bread),Math.abs(C.bread-2.25)>1e-9);
 ok('the calibration day measures, no purchase paid; the market opens at its end, with its wages ('+JSON.stringify(day0)+'); the markup the wage bill over the spending at cost',!day0.purchase&&day0.wage===4*12*3&&mk0>1&&R.live,!!day0.purchase);
 const D=R.days.kautoa.slice(1),wages=D.reduce((n,d)=>n+d.wages,0),spent=D.reduce((n,d)=>n+d.spent,0),dole=D.reduce((n,d)=>n+d.dole,0),dHof=(L)=>L.reduce((n,h)=>n+A.S.acct('hh:'+h).balance-hh0[['hA','hB','hC'].indexOf(h)],0),dH=dHof(['hA','hB','hC']);
 ok('wages paid at midnight for the rota\'s hours: 4 workers x 12 h x 3 a day ('+wages+' in two days)',wages===2*4*12*3,wages===0);
 ok('the circular flow: wages = the households\' spending + their saving ('+wages+' = '+spent+' + '+dH+')',wages===spent+dH&&spent>0,wages===spent+dHof(['hB','hC']));
 ok('a household with no wage and no money is fed on the treasury\'s dole ('+dole+' in two days; hC holds '+A.S.acct('hh:hC').balance+')',dole>0&&A.S.acct('hh:hC').balance===0,!(dole>0));
 ok('the ledger holds the town\'s money to its books',L.ok,!L.ok);
 const J=mk({jail:true});J.run(3+1/1440);const JD=J.S.moneyM1().days.kautoa.slice(1).reduce((n,d)=>n+d.wages,0);
 ok('nobody is paid while held ('+JD+' to the three free workers)',JD===2*3*12*3,JD===2*4*12*3);
 const T=mk({calibrate:3});T.run(3+1/1440);const RT=T.S.moneyM1();ok('a longer calibration measures over its days ('+RT.days.kautoa.length+' days, markup '+(RT.markup.kautoa||0).toFixed(2)+')',RT.live&&RT.days.kautoa.length===3&&!(T.S.moneyReport().currencies.shell.paid.purchase>0)&&RT.markup.kautoa>1,!RT.live);
 // the chief's redistribution (m1.ration): each member with no work kept by the treasury, the markup on the earners' keep
 const Q=mk({ration:true,calibrate:3}),q0=()=>['hA','hB','hC'].map(h=>Q.S.acct('hh:'+h).balance);Q.run(3+1/1440);const qh=q0(),qt=Q.S.acct('treasury:kautoa').balance+Q.S.acct('wp:farm').balance+Q.S.acct('wp:bake').balance;Q.run(4);
 const QR=Q.S.moneyM1(),QD=QR.days.kautoa.slice(3),qw=QD.reduce((n,d)=>n+d.wages,0),qr=QD.reduce((n,d)=>n+d.ration,0),qs=QD.reduce((n,d)=>n+d.spent,0),qd=QD.reduce((n,d)=>n+d.dole,0),qdh=q0().reduce((n,b,i)=>n+b-qh[i],0);
 const qt1=Q.S.acct('treasury:kautoa').balance+Q.S.acct('wp:farm').balance+Q.S.acct('wp:bake').balance;
 ok('the ration keeps the household with no work ('+qr+' paid, ration '+QR.ration.kautoa+' a head; dole '+qd+'), and wages + rations = spending + saving ('+qw+' + '+qr+' = '+qs+' + '+qdh+')',
   qr>0&&qd<0.05*(qs+qd)&&qw+qr===qs+qdh,!(qr>0));
 ok('the treasury breaks even, near enough, on the earners\' markup ('+(qt1-qt)+' over four days on '+(qw+qr)+' paid out)',Math.abs(qt1-qt)<0.25*(qw+qr),false);
 // M2 (moving prices): a governed good kept scarce gets dearer, one glutted cheaper, within the clamp, eased in; when the
 // households save, the price level rises until the takings meet the wages and the rations, the ration a day's keep with it
 const G2=mk({govern:true,calibrate:1,ration:true,m2:{k:0.5,lo:0.5,hi:2,smooth:3,level:false}});G2.run(1+1/1440);
 const E2=G2.S.econ('kautoa');G2.S.R.place.shed.stock.rice=2;G2.S.R.place.shed.stock.bread=40000;G2.S.R.place.farm.stock={};G2.S.R.place.bake.stock={};G2.S.R.place.farm.cap=0;
 G2.run(4);const rel=G2.S.MONEY.m1.rel.kautoa,PR=G2.S.MONEY.m1.price.kautoa,base=G2.S.MONEY.m1.cost.kautoa,mk2=G2.S.MONEY.m1.markup.kautoa;
 ok('scarce rice dearer ('+rel.rice.toFixed(2)+'), glutted bread cheaper ('+rel.bread.toFixed(2)+'), within half to double, eased in',rel.rice>1.2&&rel.rice<=2&&rel.bread<0.85&&rel.bread>=0.5&&PR.rice===Math.max(1,Math.round(base.rice*mk2*rel.rice)),!(rel.rice>1));
 const lv=(m2)=>{const T=mk({ration:true,calibrate:3,m2});T.run(3+1/1440);const t0=()=>T.S.acct('treasury:kautoa').balance+T.S.acct('wp:farm').balance+T.S.acct('wp:bake').balance;T.run(8);
   const H=T.S.moneyM1().days.kautoa.slice(-5),owed=H.reduce((n,d)=>n+d.wages+d.rationDue,0),took=H.reduce((n,d)=>n+d.spent,0);return {T,owed,took,gap:(owed-took)/owed,mk:T.S.MONEY.m1.markup.kautoa,ra:T.S.MONEY.m1.ration.kautoa};};
 const L2=lv({level:{gain:0.5,step:0.05},smooth:3}),L0=lv(null);
 ok('the price level closes the gap between what the treasury owes and what it takes ('+Math.round(100*L0.gap)+'% short at fixed prices, '+Math.round(100*L2.gap)+'% with M2; markup '+L0.mk.toFixed(2)+' to '+L2.mk.toFixed(2)+', ration '+L0.ra+' to '+L2.ra+')',
   Math.abs(L2.gap)<Math.abs(L0.gap)&&L2.mk>L0.mk&&L2.ra>L0.ra,Math.abs(L2.gap)>=Math.abs(L0.gap));
 const L2L=L2.T.S.ledgerSnap();ok('the books still hold with prices moving',L2.T.S.ledger(L2L,L2L).ok,false);
 // spending that follows savings (m1.spend): wealth within the class's band by the household's savings; a treat bought only
 // with money in hand; savings lower the treat's bar, so saved money is spent
 const SP={bands:{poor:[0,0.2]},days:5,treatDrop:15},kv=(W,h)=>W.kava[h]||0;
 const tr=(o)=>{const W=mk(Object.assign({treat:true,calibrate:1},o));W.kava={};W.first={};const mb=W.S.moneyBuy;W.S.moneyBuy=function(home,place,g,n,s){if(g==='kava'&&W.S.MONEY.m1.live){W.kava[home]=(W.kava[home]||0)+n;if(W.first[home]==null)W.first[home]=W.S.minute();}return mb.apply(this,arguments);};W.run(1+1/1440);W.run(6);return W;};
 const S1=tr({spend:SP,rich:20000}),S0=tr({spend:null,rich:20000}),S2=tr({spend:Object.assign({},SP,{treatDrop:0}),rich:20000});
 const wA=S1.S.R.actor.gr0.wealth,wC=S1.S.R.actor.id0.wealth;
 ok('wealth follows savings within the class\'s band (the saving household '+wA.toFixed(2)+', the broke one '+wC.toFixed(2)+', the band 0 to 0.2)',Math.abs(wA-0.2)<1e-9&&Math.abs(wC-0)<1e-9,Math.abs(S0.S.R.actor.gr0.wealth-0.2)<1e-9);
 ok('a treat only with money in hand (the broke household '+kv(S1,'hC')+' bowls; without the rule, on the dole, '+kv(S0,'hC')+')',kv(S1,'hC')===0&&kv(S0,'hC')>0,kv(S1,'hC')>0);
 const fb1=S1.first.hA,fb2=S2.first.hA;
 ok('savings lower the treat\'s bar, so saved money is spent sooner (the saving household\'s first bowl at day '+(fb1/1440).toFixed(2)+', '+kv(S1,'hA')+' bowls; without the drop day '+(fb2/1440).toFixed(2)+', '+kv(S2,'hA')+')',
   fb1<fb2&&kv(S1,'hA')>=kv(S2,'hA'),!(fb1<fb2));
 // stations (m1.stations): a household whose purse holds the price buys a vacant shop and one of its workers rises to its
 // merchant (its class with it); the owned shop keeps its margin, the rest to the treasury wholesale; a household that
 // cannot cover its shop's wages falls back, the shop to the treasury, its people unhappier; one rise a life (two where fluid)
 const ST=(o)=>Object.assign({of:a=>'worker',cls:{worker:'poor',merchant:'middle'},rise:{merchant:{places:['shop'],cost:3,hold:1}},margin:0.15,reserve:2,fall:{unhappy:30,days:20}},o||{});
 const R1=mk({stations:ST(),rich:6000,calibrate:1});R1.run(1+1/1440);R1.run(1);const gr=R1.S.R.actor.gr0,shopA=R1.S.acct('wp:shop'),ev=R1.S.moneyStations();
 ok('a household whose purse holds the price buys the vacant shop and its worker rises ('+JSON.stringify(ev.rises)+'; '+gr.id+' a '+gr.station+', '+gr.cls+', the shop the '+shopA.ownedBy+'\'s)',
   gr.station==='merchant'&&gr.cls==='middle'&&shopA.ownedBy==='hh:hA'&&gr.work==='shop'&&ev.events[0].price>0,gr.station!=='merchant');
 R1.run(2);const wh=R1.S.moneyReport().currencies.shell.paid.wholesale||0,pu=R1.S.MONEY.flows.shell.paid.purchase||0;
 ok('the owned shop keeps its margin and pays the treasury the rest wholesale ('+wh+' wholesale)',wh>0,!(wh>0));
 const F1=mk({stations:ST({margin:0}),rich:6000,calibrate:1});F1.run(1+1/1440);F1.run(1);const fg=F1.S.R.actor.gr0,was=fg.station;F1.S.burn('hh:hA',F1.S.acct('hh:hA').balance,'lost');F1.run(2);
 const fev=F1.S.moneyStations(),pool=F1.S.happinessPool('kautoa'),hA=F1.S.R.actor.gr1,hB=F1.S.R.actor.gr3;
 ok('a household that cannot cover its shop\'s wages falls: the shop to the treasury, its merchant a '+fg.station+' ('+fg.cls+'), its people '+Math.round(F1.S.happiness(hA))+' happy to '+Math.round(F1.S.happiness(hB))+' next door',
   was==='merchant'&&fg.station==='worker'&&fg.cls==='poor'&&F1.S.acct('wp:shop').ownedBy==='treasury:kautoa'&&(fev.falls.kautoa||{}).merchant===1&&F1.S.happiness(hA)<F1.S.happiness(hB)-20,fg.station==='merchant');
 ok('the happiness pool by class ('+Object.keys(pool.byClass).map(c=>c+' '+Math.round(pool.byClass[c].mean)).join(', ')+')',pool.all.n===5&&pool.byClass.poor&&pool.byClass.poor.n===5,!pool.byClass.poor);
 F1.S.mint('hh:hA',9000,'endowment');F1.run(2);ok('one rise a life: the fallen merchant does not rise again ('+fg.station+', '+fg.rises+' rise)',fg.station==='worker'&&fg.rises===1,fg.station!=='worker');
 const F2=mk({stations:ST({margin:0,perLife:2}),rich:6000,calibrate:1});F2.run(1+1/1440);F2.run(1);F2.S.burn('hh:hA',F2.S.acct('hh:hA').balance,'lost');F2.run(2);F2.S.mint('hh:hA',9000,'endowment');F2.run(2);
 const f2=F2.S.R.actor.gr0;ok('where the nation is fluid (two a life) it may rise again ('+f2.station+', '+f2.rises+' rises)',f2.rises===2&&f2.station==='merchant',f2.rises<2);
 const N=mk({calibrate:false});N.run(1+1/1440);ok('without calibration it pays from the first day',(N.S.moneyReport().currencies.shell.paid.wage||0)>0,!((N.S.moneyReport().currencies.shell.paid.wage||0)>0));}

// a page with no settlements: the trade fragment is inert (every older check in this file runs with it loaded)
{const {S}=world(99);ok('no trade routes: no report, nothing at sea, the step does nothing',S.tradeReport()===null&&S.tradeInbound('rice')===0&&S.tradeStep(0,0)===undefined,S.tradeReport()!==null);}

// the economy's carriers: an import comes as a caravan by its port, unloads into the caravanserai's store on arrival,
// stays, buys the city's most plentiful made good as it leaves, and goes out the way it came
{const {S,clock}=world(73);
 ['WORK','HAUL','UNLOAD'].forEach(a=>S.activity({id:a}));
 S.place({id:'shed',kind:'warehouse',x:0,z:0,activities:{}});S.place({id:'farm',kind:'field',x:150,z:0,activities:{WORK:4},open:[0,24]});
 S.role({id:'driver',org:'riders',sched:[[0,'LODGE']]});S.role({id:'guard',org:'riders',sched:[[0,'LODGE']]});S.role({id:'grower',org:'folk',sched:[[0,'WORK']],prefers:{WORK:{pin:'work'}}});
 S.economy({goods:{salt:{import:{route:'road',lot:70}},corn:{}},window:1,imports:{days:3,scan:30},routes:{road:{minutes:600}},exports:{minDays:2},
   carriers:{road:{kind:'caravan',org:'riders',from:['east'],unit:[{role:'driver',n:1},{role:'guard',n:2}],size:[1,4],cap:30,layer:'pedestrian',mode:'walk',speed:1.3,beasts:1,at:'serai',activity:'LODGE',mins:120}}});
 S.store('shed',{kind:'warehouse'});S.store('serai',{kind:'site'});S.recipe('farm',{out:['corn'],rate:30});S.actor({id:'gr',role:'grower',home:'homeA',work:'farm'});
 S.R.place.shed.stock={salt:2,corn:500};
 const run=(h0,h1)=>{for(let m=h0*60;m<h1*60;m++){clock.h=(m%1440)/60;clock.d=Math.floor(m/1440);clock.t+=30;S.step();}};
 run(0,1);S.supply('salt',1);S.supply('corn',10);run(1,3);
 const G=S.all('group')[0];
 ok('salt under three days: a caravan is sent for it by its port, three units for a lot of 70 at 30 a unit',G&&G.kind==='caravan'&&G.members.length===9&&S.LOG.some(e=>e.kind==='import'&&e.by===G.id),!G);
 {const St=S.stocks().by.salt,f=St.today;
  ok('the stocks: the caravan\'s lot on the map counts in transit and as imported, and the day balances (change = made + imported - exported - used up)',St.transit===70&&f.imported===70&&f.change===f.made+f.imported-f.exported-f.consumed,St.transit!==70);}
 run(3,5);
 {const f=S.stocks().by.salt.today;ok('landed, it is still imported once (not twice)',f.imported===70&&f.change===f.made+f.imported-f.exported-f.consumed,f.imported!==70);}
 ok('on arrival it unloads into the caravanserai\'s store (the carts take it on), not by a timer; landed, it counts: no second caravan',S.R.place.serai.stock.salt===70&&S.ECON.imported.salt===70&&S.ECON.inflight.length===0&&S.ECON.sent===1&&S.ECON.landed.carrier===1&&!S.ECON.landed.timer,S.R.place.serai.stock.salt!==70);
 run(5,9);
 ok('leaving, it buys the good the city has most days of (made, over the floor), no more than the day\'s surplus, and keeps the floor',G.cargo&&G.cargo.good==='corn'&&G.cargo.n>0&&G.cargo.n<=2*S.ECON.day[0].made.corn&&S.stockOf('corn')>=2*10*0.9,!G.cargo);
 run(9,14);
 ok('and goes out the way it came: the group is gone',!S.R.group[G.id]&&S.LOG.some(e=>e.kind==='left'&&e.group===G.id),!!S.R.group[G.id]);
 {const f=S.stocks().by.corn.today;ok('the stocks: the cargo counts as exported once its group has left the map, and the day still balances',f.exported===G.cargo.n&&f.change===f.made+f.imported-f.exported-f.consumed,f.exported!==G.cargo.n);}
 const R=S.economyReport();ok('the report counts the export',R.goods.corn.exported===G.cargo.n,R.goods.corn.exported!==G.cargo.n);}

// animals (the needs' role `free`, a herd recipe, SIM.command): a cow at its pen feeds, drinks and rests by its meters,
// not by the citizens' free time; the herd makes milk by its condition; a command sends it elsewhere until it ends
{const {S,clock}=world(79);
 ['FEED','GRAZE','DRINK','REST','IDLE','FIGHT','WORK'].forEach(a=>{ if(!S.R.activity[a]) S.activity({id:a}); });
 S.place({id:'pen',kind:'ranch',x:150,z:0,activities:{FEED:4,GRAZE:6,DRINK:4,REST:6,IDLE:6},open:[0,24],r:6});
 S.place({id:'sand',kind:'arena',x:100,z:60,activities:{FIGHT:2},open:[0,24]});
 S.needs({list:['eat','drink','sleep','socialize'],rate:{eat:4,drink:5,sleep:3,socialize:2},fill:{FEED:{eat:40},GRAZE:{eat:20},DRINK:{drink:60},REST:{sleep:20},SOCIALIZE:{socialize:30}},
   free:['SOCIALIZE','IDLE'],dwell:30,keep:1.2,done:10,init:[50,50,50,50],secPerMinute:1});
 S.role({id:'cow',org:'folk',sched:[[0,'IDLE']],prefers:{FEED:{pin:'home'},GRAZE:{pin:'home'},DRINK:{pin:'home'},REST:{pin:'home'},IDLE:{pin:'home'}},
   needs:{rate:{socialize:0},free:['FEED','GRAZE','DRINK','REST','IDLE']}});
 const c=S.actor({id:'cow1',role:'cow',home:'pen'});c.herd='pen';c.nd=[90,20,20,0];c.ndT=0;c.ndFrom=0;
 clock.d=0;clock.h=1;const w1=S.desire(c,S.minute());
 ok('a hungry cow feeds (its own free choices: not the citizens\' socializing)',w1==='FEED',w1==='SOCIALIZE');
 c.nd=[5,95,20,0];c.fr=null;clock.h=2;const w2=S.desire(c,S.minute());ok('a thirsty one drinks',w2==='DRINK',w2==='FEED');
 S.economy({goods:{milk:{},cheese:{}},inputs:{cheese:{milk:4}}});S.recipe('pen',{out:['cheese'],rate:1,herd:{out:['milk'],rate:2}});
 const run=(h0,h1)=>{for(let m=h0*60;m<h1*60;m++){clock.h=(m%1440)/60;clock.d=Math.floor(m/1440);clock.t+=30;S.step();}};
 run(2,6);const milk=S.R.place.pen.stock.milk||0;
 ok('the herd makes milk at home by the animal-hour (no workers)',milk>=4&&milk<=9&&!S.R.place.pen.stock.cheese,milk===0);
 S.role({id:'dairyman',org:'folk',sched:[[0,'WORK']],prefers:{WORK:{pin:'work'}},needs:{rate:{eat:0,drink:0,sleep:0,socialize:0}}});S.R.place.pen.activities.WORK=2;
 S.actor({id:'dm',role:'dairyman',home:'homeB',work:'pen'});S.R.place.pen.stock.milk=40;run(6,9);
 ok('a dairyman turns the milk into cheese, four to one',(S.R.place.pen.stock.cheese||0)>=1&&S.ECON.used.milk===4*S.R.place.pen.stock.cheese,!S.R.place.pen.stock.cheese);
 // the forced command
 const cm=S.command(c,{act:'FIGHT',place:'sand',mins:60,by:'keeper'});run(9,9.2);
 ok('commanded: it goes to the sand to fight, whatever its meters want',c.activity==='FIGHT'&&c.place==='sand',c.activity!=='FIGHT');
 run(9.2,10.5);ok('and when the command ends it is back to its own wants',!c.cmd&&c.activity!=='FIGHT',!!c.cmd);
 {S.place({id:'coop',kind:'coop',x:0,z:0,activities:{FEED:4,REST:4,IDLE:4},open:[0,24]});S.ECON.goods.eggs={id:'eggs'};S.ECON.goods.fowl={id:'fowl'};
  S.recipe('coop',{herd:{out:['eggs','fowl'],share:[0.6,0.4],rate:10}});for(let i=0;i<5;i++){ const d=S.actor({id:'duck'+i,role:'cow',home:'coop'});d.herd='coop';d.place='coop';d.task=null; }
  const e0=S.ECON.made.eggs||0;run(10.5,12.5);const ce=S.R.place.coop.stock;
  ok('a herd with shares makes each co-product (a duck\'s eggs and its meat), not only the one most needed',(ce.eggs||0)>0&&(ce.fowl||0)>0&&Math.abs((ce.eggs||0)/((ce.eggs||0)+(ce.fowl||0))-0.6)<0.15,!(ce.fowl>0));}
 {const P=S.R.place.pen, m0=S.ECON.made.milk||0; c.grownAt=S.minute()+365*1440; c.cmd=null;run(12.5,14.5);const m1=S.ECON.made.milk||0, s1=P.stock.milk||0;c.grownAt=null;
  ok('the young yield nothing until grown',m1===m0,m1>m0);
  const k=S.produce('pen','milk',12.7);ok('a one-off yield (a slaughter\'s meat) goes into the store, whole units, and counts as made',k===12&&(P.stock.milk||0)===s1+12&&S.ECON.made.milk===m1+12,k!==12);}
 // food quality: cheese makes a better meal than milk
 S.items({kinds:{milk:{cat:'food',food:true},cheese:{cat:'food',food:true,quality:1.5},bread:{cat:'food',food:true}},free:['SOCIALIZE'],secPerMinute:1,meal:{mult:3,single:1,none:0.2,mess:3}});
 ['EAT'].forEach(a=>{ if(!S.R.activity[a]) S.activity({id:a}); });S.place({id:'cot',kind:'home',x:0,z:0,activities:{EAT:3,SLEEP:3}});
 S.role({id:'eater',org:'folk',sched:[[0,'EAT']],prefers:{EAT:{pin:'home'}}});const e=S.actor({id:'e1',role:'eater',home:'cot'});
 S.R.place.cot.store={milk:5,bread:5};e.wanted=null;S.decide(e,S.minute(),clock.t);const b1=e.boost.EAT;
 S.R.place.cot.store={cheese:5,bread:5};e.wanted=null;S.decide(e,S.minute()+1,clock.t);const b2=e.boost.EAT;
 ok('a meal with cheese fills more than one with milk',b2>b1&&b1===3,b2<=b1);
 // a kitchen without its pot (meal.pot): what it cooks is worth noPot; with the pot, or no rule, a full meal
 const c0=S.place({id:'cot2',kind:'home',x:0,z:0,activities:{EAT:3,SLEEP:3}});S.ITEMS.kinds.pot={id:'pot',cat:'household',slot:'lhand',life:60};
 const e2=S.actor({id:'e2',role:'eater',home:'cot2'});c0.potBy='e2';S.ITEMS.meal.pot='pot';S.ITEMS.meal.noPot=0.6;
 const bite=(m)=>{c0.store={milk:5,bread:5};e2.wanted=null;S.decide(e2,S.minute()+m,clock.t);return e2.boost.EAT;};
 const none=bite(2);S.equip(e2,'pot',0);const has=bite(3);
 ok('a kitchen without its pot cooks a poorer meal ('+none.toFixed(1)+'), with it a full one ('+has.toFixed(1)+')',Math.abs(none-1.8)<1e-9&&has===3,none>=has);}
// the treat's mix (treat.mix): over days a person buys any treat its wealth reaches, by a hash; without it only the dearest
{const {S}=world(173);S.needs({list:['material'],rate:{material:1},fill:{}});
 S.items({kinds:{kava:{cat:'luxury',material:1},mat:{cat:'household',material:1},gem:{cat:'luxury',material:1}},free:['IDLE'],secPerMinute:1});S.shop('market',['kava','mat','gem']);
 S.role({id:'buyer',org:'folk',sched:[[0,'IDLE']]});const a=S.actor({id:'t1',role:'buyer',home:'homeA'});a.wealth=0.5;
 const seen=(mix)=>{S.ITEMS.treat={at:10,items:[[0,'kava'],[0.3,'mat'],[0.9,'gem']],mix:mix};const n={};a.itDay=0;a.nd=[60];a.ndT=S.minute();
   for(let d=1;d<=40;d++){a.errand=null;a.errCool=null;a.nd=[60];S.itemsAbstractDay(a,d,null);}
   Object.keys(S.ITEMS.stats.errands).forEach(k=>{n[k]=S.ITEMS.stats.errands[k];});S.ITEMS.stats.errands={};return n;};
 const M=seen(true),D=seen(false);
 ok('mix: a person of middling wealth buys both treats it reaches ('+JSON.stringify(M)+'), not the one past it',M.kava>5&&M.mat>5&&!M.gem,!(M.kava>0));
 ok('without it only the dearest it reaches',D.mat===40&&!D.kava,D.kava>0);}


// what things hold and the settlement's stocks (77-sim-7-stocks.js): SIM.contents(id) by record, SIM.stocks() by item
// (production, transit, storage, owned; the daily snapshot's change and flows; the low and out marks), SIM.holders
{const {S,clock}=world(83);
 ['WORK','EAT','HAUL'].forEach(a=>S.activity({id:a}));
 ok('without the economy or the items there are no stocks',S.stocks()===null,S.stocks()!==null);
 S.place({id:'farm',kind:'field',x:150,z:0,activities:{WORK:4},open:[0,24],r:10});
 S.place({id:'shed',kind:'warehouse',x:0,z:0,activities:{}});
 S.role({id:'grower',org:'folk',sched:[[0,'WORK']],prefers:{WORK:{pin:'work'}}});S.role({id:'carter',org:'folk',sched:[[0,'IDLE']]});
 S.items({kinds:{corn:{cat:'food',food:true},shirt:{cat:'clothes',slot:'torso',life:10},hoe:{cat:'tool',workLife:100}},free:['IDLE'],secPerMinute:1,hurt:0});
 S.economy({goods:{corn:{},wheat:{},salt:{}},every:60,window:1,imports:{days:3,scan:60},cart:{cap:30,load:5,unload:5,minLoad:500}});
 S.store('shed',{kind:'warehouse'});S.store('serai',{kind:'site'});S.recipe('farm',{out:['corn'],rate:2,cap:400});
 S.R.place.shed.stock={corn:40,wheat:25};S.R.place.serai.stock={salt:12};
 const H=S.R.place.homeA;H.people=2;H.store={corn:6};
 const f=S.R.actor.f1;S.equip(f,'shirt',0.4);S.give(f,'shirt',2);f.tool={k:'hoe',w:0.25};
 S.actor({id:'g1',role:'grower',home:'homeB',work:'farm'});const c=S.actor({id:'cart1',role:'carter',home:'homeA'});S.cart(c);
 const run=(m0,m1)=>{for(let m=m0;m<m1;m++){clock.h=(m%1440)/60;clock.d=Math.floor(m/1440);clock.t+=40;S.step();}};
 run(20*60,20*60+1);const T0=S.stocks();
 ok('before a midnight there is no whole day yet, only today',T0.day===null&&T0.today&&T0.today.from===1200,T0.day!==null);
 run(20*60+1,24*60+1);const T1=S.stocks();
 const Fc=S.contents('farm');
 ok('a producer\'s contents: its stock, made here (production), what it makes',Fc.type==='place'&&Fc.items.length===1&&Fc.items[0].item==='corn'&&Fc.items[0].n===S.R.place.farm.stock.corn&&Fc.items[0].state==='production'&&Fc.makes.join()==='corn',Fc.items.length===0);
 ok('an id no record has: null',S.contents('nope')===null&&S.contents(null)===null,S.contents('farm')===null);
 const Wc=S.contents('shed'),Lc=S.contents('serai');
 ok('a warehouse holds in storage; a carrier\'s landing site (a store with no recipe) in transit',Wc.items.every(e=>e.state==='storage')&&Wc.store.kind==='warehouse'&&Lc.items[0].item==='salt'&&Lc.items[0].state==='transit',Lc.items[0].state!=='transit');
 const Ac=S.contents('f1'),worn=Ac.items.filter(e=>e.as==='worn')[0],tool=Ac.items.filter(e=>e.as==='tool')[0],home=Ac.items.filter(e=>e.as==='kept at home')[0];
 ok('a citizen\'s contents: worn (its wear of its life), its tool, what it keeps at home, its household\'s food',worn&&worn.item==='shirt'&&worn.life===10&&worn.wear>=0.4&&tool.item==='hoe'&&home.n===2&&Ac.household.id==='homeA'&&Ac.household.items[0].item==='corn',!worn);
 // stocks: every holder once; the states sum to the total
 c.cart.load={good:'corn',n:7};const St=S.stocks(),R=St.by.corn;
 const all=S.R.place.farm.stock.corn+S.R.place.shed.stock.corn+H.store.corn+7;
 ok('the stocks: a good\'s total is every holder\'s, split by state (a cart\'s load in transit)',R.total===all&&R.production===S.R.place.farm.stock.corn&&R.transit===7&&R.storage===S.R.place.shed.stock.corn+H.store.corn&&R.production+R.transit+R.storage+R.owned===R.total,R.transit!==7);
 c.cart.load=null;
 ok('possessions are owned: one worn and two at home',St.by.shirt.owned===3&&St.by.shirt.production===0&&St.by.hoe.owned===1,St.by.shirt.owned!==3);
 ok('the salt landed counts in transit, the warehoused wheat in storage',St.by.salt.transit===12&&St.by.wheat.storage===25,St.by.salt.storage>0);
 // the day: the snapshots at the first step (20:00) and at midnight
 ok('the last day: from the first snapshot to midnight (partial), its change the totals\' difference',T1.day&&T1.day.from===1200&&T1.day.to===1440&&T1.day.partial&&T1.by.corn.day.change===T1.by.corn.total-T0.by.corn.total&&T1.by.corn.day.change!==0&&T1.by.corn.day.made===S.ECON.made.corn,!T1.day);
 ok('its flows are the counters\' difference (corn made at the farm over the evening)',T1.by.corn.day.made>0&&T1.by.corn.day.imported===0,T1.by.corn.day.made===0);
 // the marks: a good used with little stock is low; one unused has no days and is not low
 S.supply('corn',35);run(24*60+1,24*60+90);const M=S.stocks();
 ok('low: under the import threshold\'s days of cover; an unused good is not',M.by.corn.low===true&&M.by.corn.days<3&&M.by.wheat.low===false&&M.by.wheat.days===null,M.by.wheat.low);
 S.supply('wheat',100);const M2=S.stocks();
 ok('out: a draw that went unmet today',M2.by.wheat.out===true&&M2.by.wheat.today.unmet>0&&M.by.corn.out===false,M2.by.wheat.out===false);
 // holders, a place at a point, where a record is
 const Ho=S.holders('corn',5);
 ok('the holders of an item, most first',Ho.count>=2&&Ho.list[0].n>=Ho.list[Ho.list.length-1].n&&Ho.list.some(h=>h.id==='homeA'&&h.state==='storage'),Ho.count===0);
 ok('nobody holds what nobody has',S.holders('nothing').count===0&&S.holders('shirt').list[0].id==='f1',S.holders('nothing').count!==0);
 ok('the place that holds something at a point, none where none does',S.placeAt(150,2)==='farm'&&S.placeAt(400,400)===null,S.placeAt(400,400)!==null);
 const wp=S.whereIs('shed'),wa=S.whereIs('f1');
 ok('where a place and an actor are',wp.x===0&&wp.z===0&&wa&&isFinite(wa.x),!wa);}

// the wake (SIM.WAKE): asked only when its wish could change; no wish left waiting, far fewer questions
{const run=(wake)=>{const {S,clock}=world(61);S.WAKE=wake;S.skipped=0;
  for(let i=0;i<60;i++) S.actor({id:'w'+i,role:'farmer',home:i%2?'homeA':'homeB'});
  let asked=0;const d0=S.desire;S.desire=function(a,m){asked++;return d0.apply(this,arguments);};
  let stale=0;clock.d=0;for(let m=0;m<24*60;m++){clock.h=m/60;clock.t+=1;S.step();
    if(m%7===0) S.all('actor').forEach(a=>{ if(a.present && a.task && d0(a,S.minute())!==a.wanted) stale++; });}
  S.desire=d0;return {asked,stale,skipped:S.skipped,acts:S.all('actor').map(a=>a.activity+'@'+a.place).join(',')};};
 const A=run(false),B=run(true);
 ok('with the wake no wish is left waiting',B.stale===0,B.stale>0);
 ok('the same day, the same places',A.acts===B.acts,A.acts!==B.acts);
 ok('and far fewer questions (under a fifth)',B.asked<A.asked/5&&B.skipped>0,B.asked>=A.asked);}

// the lag (SIM.LAG): a schedule change falls due over its first minutes, not all at :00; the same day's activities after
{const run=(lag)=>{const {S,clock}=world(67);S.WAKE=true;S.LAG=lag;
  for(let i=0;i<120;i++) S.actor({id:'l'+i,role:'farmer',home:i%2?'homeA':'homeB'});
  let peak=0,acts10=null;clock.d=0;for(let m=0;m<13*60;m++){clock.h=m/60;clock.t+=1;const made=S.step();if(m>0 && m%60<=lag) peak=Math.max(peak,made);
    if(m===10*60+lag+1) acts10=S.all('actor').map(a=>a.activity).sort().join(',');}
  const lags=S.all('actor').map(a=>S.lagOf(a));return {peak,acts10,spread:new Set(lags).size,maxLag:Math.max(...lags)};};
 const A=run(0),B=run(10);
 ok('with a lag the hour\'s decisions spread over its minutes (a lower peak)',B.peak<A.peak/2&&B.spread>5&&B.maxLag<=10,B.peak>=A.peak);
 ok('and once its minutes are past, everyone does what the schedule says, as without',B.acts10===A.acts10,B.acts10!==A.acts10);
 // two buckets half an hour apart: half the actors' day 30 minutes later; each turn's peak about halved again
 {const {S,clock}=world(67);S.WAKE=true;S.LAG=10;for(let i=0;i<120;i++){ const a=S.actor({id:'b'+i,role:'farmer',home:i%2?'homeA':'homeB'}); a.lagBase=i%2?30:0; }
  let peak=0,at0=null,at30=null;clock.d=0;for(let m=0;m<13*60;m++){clock.h=m/60;clock.t+=1;const made=S.step();if(m>0 && (m%60<=10 || (m%60>=30 && m%60<=40))) peak=Math.max(peak,made);
    if(m===10*60+15){ const mm=S.minute(); at0=S.all('actor').filter(a=>!a.lagBase && S.desire(a,mm)==='BUY').length; at30=S.all('actor').filter(a=>a.lagBase && S.desire(a,mm)==='BUY').length; } }
  ok('two buckets: the half-hour bucket keeps its old hour until :30; the peak lower again',at30===0&&at0>40&&peak<=B.peak,at30>0);}}

// a vital need (SIM.needs `vital`): past its line hunger caps happiness, to nothing at a full meter, so a starving man is not
// kept content by his other needs; without it the weighted mean leaves him at three quarters
{const {S}=world(223);S.needs({list:['eat','rest','talk','pray'],rate:{},weight:{eat:1.5},vital:{eat:60},pain:1});const a=S.actor({id:'v1',role:Object.keys(S.R.role)[0]||'x',home:'homeA'});
 const h=(e)=>S.happiness(a,[e,0,0,0]),N=S.NEED,v=N.vital;N.vital=[];const flat=h(90);N.vital=v;
 ok('a vital need past its line caps happiness (hunger 90: '+h(90).toFixed(0)+', 100: '+h(100).toFixed(0)+'; under the line, 50: '+h(50).toFixed(0)+'; without the rule, 90: '+flat.toFixed(0)+')',
   Math.abs(h(90)-25)<1e-9&&h(100)===0&&Math.abs(h(50)-(100-1.5*50/4.5))<1e-9,flat<=25);}
// building (77-sim-6-build.js; PLAN-POLITICS.md section 4): a town with two empty lots and four builders; a house's bill
// drawn from the warehouses as the work goes (booked used), the work never ahead of the bill delivered, the next lot
// started and the hands moved when one is done; and upkeep, every standing house wearing its bill over its life, owed
// when the warehouses are empty, the neglect shown on a hashed share of the houses, paid back when the goods return
{const mk=(o)=>{o=o||{};const {S,clock}=world(229);
   ['WORK'].forEach(a=>{ if(!S.R.activity[a]) S.activity({id:a}); });
   S.settlement({id:'kautoa',faction:'town'});
   S.place({id:'kShed',kind:'warehouse',x:10,z:0,activities:{},settlement:'kautoa'});
   for(let i=0;i<10;i++) S.place({id:'kH'+i,kind:'house',x:20*i,z:40,activities:{SLEEP:5},settlement:'kautoa'});
   S.place({id:'lot0',kind:'lot',x:0,z:80,activities:{WORK:4},settlement:'kautoa'});S.place({id:'lot1',kind:'lot',x:40,z:80,activities:{WORK:4},settlement:'kautoa'});
   const EK=S.economy({goods:{stone:{},mats:{}},every:60,window:1},{settlement:'kautoa'});S.store('kShed',{kind:'warehouse'});
   S.R.place.kShed.stock={stone:o.stone==null?500:o.stone,mats:o.mats==null?500:o.mats};
   const built=[];S.build({kinds:{house:{bill:{stone:20,mats:10,timber:5},hours:96,life:o.life==null?100:o.life}},of:P=>P.kind==='house'?'house':null,pace:o.pace,grace:10,
     onBuilt:(L,P)=>{const Q=S.R.place[L.id];Q.kind='house';built.push(L.id);S.buildChanged('kautoa');}});
   S.buildLot({id:'lot0',kind:'house'});S.buildLot({id:'lot1',kind:'house'});
   S.role({id:'builder',org:'folk',sched:[[0,'SLEEP'],[6,'WORK'],[18,'SLEEP']]});
   const ps=[0,1,2,3].map(i=>S.actor({id:'b'+i,role:'builder',home:'kH0',work:'lot0'}));
   clock.d=0;clock.h=0;S.level('kautoa','abstract');
   const run=(days,each)=>{for(let m=S._m||0,e=m+Math.round(days*1440);m<e;m++){clock.h=(m%1440)/60;clock.d=Math.floor(m/1440);clock.t+=40;S.step();S._m=m+1;if(each)each(m);}};
   return {S,EK,ps,built,run};};
 const A=mk(),L0=A.S.ledgerSnap();A.run(2.6);const RA=A.S.buildReport('kautoa').towns.kautoa,P0=RA.projects.find(p=>p.lot==='lot0');
 ok('a house goes up on an empty lot: four builders, 96 worker-hours, two working days ('+(P0&&P0.state)+' on day '+(P0&&P0.m1/1440).toFixed(2)+'; stone '+(P0&&P0.got.stone)+', mats '+(P0&&P0.got.mats)+', timber gathered '+(P0&&P0.local&&P0.local.timber)+')',
   P0&&P0.state==='built'&&P0.m1<2*1440&&P0.got.stone===20&&P0.got.mats===10&&P0.local.timber===5&&A.built[0]==='lot0',!(P0&&P0.state==='built'));
 const P1=RA.projects.find(p=>p.lot==='lot1');
 ok('the next lot started as it was done, its hands moved there ('+A.ps.map(a=>a.work).join(', ')+')',P1&&P1.state==='building'&&P1.m0===P0.m1&&A.ps.every(a=>a.work==='lot1'),A.ps.some(a=>a.work==='lot0'));
 const LA=A.S.ledger(L0,A.S.ledgerSnap());ok('the materials booked used: the books hold ('+A.EK.used.stone+' stone used)',LA.ok&&A.EK.used.stone>=20,!LA.ok);
 const B=mk({stone:8});B.run(3);const PB=B.S.buildReport('kautoa').towns.kautoa.projects[0];
 ok('short of stone (the houses\' upkeep takes its share), the work waits on the bill delivered ('+(PB.done/PB.hours*100).toFixed(0)+'% done, '+PB.got.stone+' of 20 stone)',PB.state==='building'&&PB.done/PB.hours<=PB.got.stone/20+1e-9&&PB.got.stone<20&&PB.done>0,PB.state==='built');
 B.S.R.place.kShed.stock.stone+=100;B.run(2);const PB2=B.S.buildReport('kautoa').towns.kautoa.projects[0];
 ok('and goes on when the stone comes',PB2.state==='built',PB2.state!=='built');
 const C=mk({pace:2});C.run(0.6);const RC=C.S.buildReport('kautoa').towns.kautoa;
 ok('a town keeps `pace` projects going ('+RC.building+' at pace 2)',RC.building===2,RC.building!==2);
 // upkeep: 10 houses, a bill of 20 stone and 10 mats over 100 days: 2 stone and 1 mat a day for the town
 const U=mk({life:100});U.ps.forEach(a=>{a.work=null;});U.run(10);const RU=U.S.buildReport('kautoa').towns.kautoa;
 ok('upkeep: ten houses wear their bills over their lives, drawn hourly ('+RU.upkeep.taken.stone+' stone, '+RU.upkeep.taken.mats+' mats in ten days; '+RU.buildings+' buildings)',
   Math.abs(RU.upkeep.taken.stone-20)<=1&&Math.abs(RU.upkeep.taken.mats-10)<=1&&RU.buildings===10&&!RU.upkeep.taken.timber,!(RU.upkeep.taken.stone>0));
 U.S.R.place.kShed.stock.stone=0;U.run(10);const q=U.S.buildReport('kautoa').towns.kautoa.upkeep,worn=['kH0','kH1','kH2','kH3','kH4','kH5','kH6','kH7','kH8','kH9'].filter(id=>U.S.buildWorn(id)>0);
 ok('the stone out, the upkeep owed and the neglect shown on a share of the houses ('+q.owed.stone+' stone owed, neglect '+q.neglect.toFixed(2)+', '+worn.length+' houses worn)',q.owed.stone>=19&&q.neglect>0.9&&worn.length>=8,worn.length===0);
 ok('the want booked short once, not each hour\'s retry ('+(U.EK.short.stone||0)+' short for '+q.owed.stone+' owed)',U.EK.short.stone===q.owed.stone,U.EK.short.stone>q.owed.stone);
 U.S.R.place.kShed.stock.stone=100;U.run(1);const q2=U.S.buildReport('kautoa').towns.kautoa.upkeep,worn2=['kH0','kH1','kH2','kH3','kH4','kH5','kH6','kH7','kH8','kH9'].filter(id=>U.S.buildWorn(id)>0);
 ok('the stone back, the debt repaid and the houses kept again ('+q2.owed.stone+' owed, '+worn2.length+' worn)',!q2.owed.stone&&worn2.length===0,worn2.length>0);
 const LU=U.S.ledgerSnap();ok('the upkeep booked used: the books hold',U.S.ledger(LU,LU).ok,false);}
// growth (77-sim-6-build.js `growth`): building follows demand. A town of 50 growing 365% a year (a household of 5 every
// ten days, to keep the test short) keeps one house ahead: the first goes up at once, the next only when a household has
// moved in; when the lots are out the host opens another (onFull)
{const mk=(o)=>{o=o||{};const {S,clock}=world(233);
   ['WORK'].forEach(a=>{ if(!S.R.activity[a]) S.activity({id:a}); });
   S.settlement({id:'kautoa',faction:'town'});
   S.place({id:'kShed',kind:'warehouse',x:10,z:0,activities:{},settlement:'kautoa'});S.place({id:'kHome',kind:'house',x:0,z:40,activities:{SLEEP:60},settlement:'kautoa'});
   const lot=(i)=>S.place({id:'lot'+i,kind:'lot',x:40*i,z:80,activities:{WORK:1},settlement:'kautoa'});lot(0);lot(1);
   const EK=S.economy({goods:{stone:{}},every:60,window:1},{settlement:'kautoa'});S.store('kShed',{kind:'warehouse'});S.R.place.kShed.stock={stone:900};
   const settled=[],opened=[];
   S.build({kinds:{house:{bill:{stone:5},hours:48}},pace:2,growth:o.noGrowth?null:{rate:3.65,per:5,ahead:1,settle:(L,s)=>settled.push([L.id,S.minute()])},
     onBuilt:(L)=>{S.R.place[L.id].kind='house';S.R.place[L.id].activities={SLEEP:5};S.buildChanged('kautoa');},
     onFull:(s)=>{if(opened.length>=1)return false;const P=lot(9);opened.push(P.id);S.buildLot({id:P.id,kind:'house'});return true;}});
   S.buildLot({id:'lot0',kind:'house'});S.buildLot({id:'lot1',kind:'house'});
   S.role({id:'builder',org:'folk',sched:[[0,'SLEEP'],[6,'WORK'],[18,'SLEEP']]});S.role({id:'kin',org:'folk',sched:[[0,'SLEEP']]});
   for(let i=0;i<4;i++)S.actor({id:'b'+i,role:'builder',home:'kHome',work:'lot0'});for(let i=0;i<46;i++)S.actor({id:'k'+i,role:'kin',home:'kHome'});
   clock.d=0;clock.h=0;S.level('kautoa','abstract');
   const run=(days)=>{for(let m=S._m||0,e=m+Math.round(days*1440);m<e;m++){clock.h=(m%1440)/60;clock.d=Math.floor(m/1440);clock.t+=40;S.step();S._m=m+1;}};
   return {S,run,settled,opened};};
 const A=mk();A.run(6);const R6=A.S.buildReport('kautoa').towns.kautoa;
 ok('building follows demand: one house ahead goes up, then the builders wait ('+R6.built+' built, '+R6.building+' building, '+R6.empty+' lots empty on day 6)',R6.built===1&&R6.building===0&&R6.empty===1,R6.building>0||R6.built!==1);
 const Z=mk({noGrowth:true});Z.run(6);const RZ=Z.S.buildReport('kautoa').towns.kautoa;
 ok('without growth the town builds on every lot ('+RZ.built+' built by day 6)',RZ.built>=2,RZ.built<2);
 A.run(30);const R36=A.S.buildReport('kautoa').towns.kautoa;
 ok('a household moves in every ten days or so, and the next house goes up as it does ('+A.settled.map(x=>x[0]+' day '+(x[1]/1440).toFixed(0)).join(', ')+'; '+R36.built+' built)',
   A.settled.length>=2&&A.settled[0][0]==='lot0'&&R36.built>=2,A.settled.length<2);
 ok('the lots out, the host opens another (onFull: '+A.opened.join(', ')+')',A.opened.length===1&&A.S.BUILD.lots[A.opened[0]],!A.opened.length);
 // a crew sized pace (crewPer): four builders at two a project keep two houses going; at four a project, one
 const P2=mk({noGrowth:true});P2.S.BUILD.cfg.crewPer=2;P2.S.BUILD.cfg.pace=1;P2.run(0.3);const R2=P2.S.buildReport('kautoa').towns.kautoa;
 const P1=mk({noGrowth:true});P1.S.BUILD.cfg.crewPer=4;P1.S.BUILD.cfg.pace=1;P1.run(0.3);const R1=P1.S.buildReport('kautoa').towns.kautoa;
 ok('a town keeps a project for every crewPer hands ('+R2.hands+' hands at two a project: '+R2.building+' going up; at four: '+R1.building+')',R2.building===2&&R1.building===1,R1.building===2);}
// unrest (77-sim-6-unrest.js; PLAN-MONEY.md M6): two towns of one faction, both unwatched; the workers' want rises a little
// each day and nothing fills it, so their pool sinks and walks the stages (grumbling, demands, strikes, treason) while
// the merchants stay content; Valapo, short of rice, asks the faction and Kautoa ships it from its spare; the ruler's
// demand is refused (no political system), and the refused strike
{const mk=(o)=>{o=o||{};const {S,clock}=world(211);
   ['WORK','EAT'].forEach(a=>{ if(!S.R.activity[a]) S.activity({id:a}); });
   S.settlement({id:'kautoa',faction:o.kFaction||'town'});S.settlement({id:'valapo',faction:'town'});if(o.kFaction)S.faction({id:o.kFaction});
   S.place({id:'vHome',kind:'house',x:150,z:0,activities:{SLEEP:6},settlement:'valapo'});S.place({id:'vFarm',kind:'field',x:100,z:60,activities:{WORK:6},open:[0,24],settlement:'valapo'});
   S.place({id:'vMill',kind:'mill',x:110,z:60,activities:{WORK:6},open:[0,24],settlement:'valapo'});
   S.place({id:'vShed',kind:'warehouse',x:50,z:0,activities:{},settlement:'valapo'});S.place({id:'kShed',kind:'warehouse',x:10,z:0,activities:{},settlement:'kautoa'});
   S.place({id:'kHome',kind:'house',x:0,z:0,activities:{SLEEP:4},settlement:'kautoa'});
   const cfg=()=>({goods:{rice:{},flour:{}},every:60,window:1});S.economy(cfg(),{settlement:'kautoa'});const EV=S.economy(cfg(),{settlement:'valapo'});
   S.store('kShed',{kind:'warehouse'});S.store('vShed',{kind:'warehouse'});S.recipe('vFarm',{out:['rice'],rate:0,cap:300});S.recipe('vMill',{out:['flour'],rate:0,cap:300});
   S.R.place.kShed.stock={rice:o.kRice==null?2000:o.kRice};S.R.place.vShed.stock={rice:o.short?60:0};   /* two days' rice, then none */
   S.needs({list:['want'],rate:{want:o.rate==null?0.5:o.rate},init:0,pain:1});
   S.role({id:'hand',org:'folk',sched:[[0,'SLEEP'],[6,'WORK'],[18,'SLEEP']]});S.role({id:'clerk',org:'folk',sched:[[0,'SLEEP'],[8,'WORK'],[16,'SLEEP']],needs:{rate:{want:0}}});
   const ps=[];for(let i=0;i<6;i++){const a=S.actor({id:'vw'+i,role:'hand',home:'vHome',work:i<4?'vFarm':'vMill'});a.cls='poor';ps.push(a);}
   for(let i=0;i<2;i++){const a=S.actor({id:'vc'+i,role:'clerk',home:'vHome',work:'vMill'});a.cls='middle';ps.push(a);}
   for(let i=0;i<4;i++){const a=S.actor({id:'kw'+i,role:'clerk',home:'kHome'});a.cls='poor';}
   S.unrest(Object.assign({smooth:1,hyst:5},o.unrest||{}));
   clock.d=0;clock.h=0;S.level('valapo','abstract');S.level('kautoa','abstract');
   const run=(days)=>{for(let m=S._m||0,e=m+days*1440;m<e;m++){clock.h=(m%1440)/60;clock.d=Math.floor(m/1440);clock.t+=40;
     if(o.short && m%1440===600) S.withEcon('valapo',()=>S.supply('rice',30));   /* the town draws rice it has none of: short */
     S.step();S._m=m+1;}};
   return {S,EV,ps,run};};
 const A=mk({short:true});A.run(12);const RA=A.S.unrestReport('valapo').towns.valapo,EVA=A.S.unrestReport().events.filter(e=>e.settlement==='valapo'&&e.key==='poor'&&e.kind==='stage').map(e=>e.to);
 const C=mk({rate:0});C.run(12);const RC=C.S.unrestReport('valapo').towns.valapo;
 ok('a sinking pool walks the stages in order ('+EVA.join(' > ')+'; the workers\' level '+RA.level.poor.toFixed(0)+') while the content merchants stay calm ('+RA.stage.middle+')',
   EVA.join(',')==='grumble,demand,strike,treason'&&RA.stage.middle==='calm'&&RA.treason.length===1,RC.stage.poor!=='calm');
 const B=mk({short:true});B.run(7);const g3=B.S.unrestArrest('valapo'),g0=C.S.unrestArrest('valapo'),sB=B.S.UNREST.towns.valapo.stage.poor;
 ok('grumbling: the watch\'s arrest odds lower in the town ('+g3+' at '+sB+', against '+g0+' calm)',sB!=='calm'&&g3===0.7&&g0===1,g0!==1);
 const DG=RA.demands.find(D=>D.kind==='goods'),L0=A.S.ledgerSnap?A.S.ledgerSnap():null;
 ok('a demand for the rice it lacked, answered by the faction: Kautoa ships five days of its normal use (30 a day) from its spare ('+(DG&&JSON.stringify(DG.sent))+', '+(DG&&DG.came)+' of '+(DG&&DG.asked)+' asked), booked imported',
   DG&&DG.answer==='granted'&&DG.goods[0]==='rice'&&DG.asked===150&&DG.sent['kautoa>rice']===150&&A.EV.imported.rice===DG.came&&A.S.econ('kautoa').exported.rice===DG.came,!(DG&&DG.came>0));
 const F=mk({short:true,kFaction:'other'});F.run(9);const DF=F.S.unrestReport('valapo').towns.valapo.demands.find(D=>D.kind==='goods');
 ok('a town of another faction sends nothing: refused',DF&&DF.answer==='refused'&&!(F.EV.imported.rice>0),!(DF&&DF.answer==='refused'));
 const N=mk({short:false});N.run(9);const RN=N.S.unrestReport('valapo').towns.valapo,DR=RN.demands.find(D=>D.kind==='ruler');
 ok('short of nothing, the demand is for a new ruler, refused: there is no political system yet ('+(DR&&DR.why)+')',DR&&DR.answer==='refused'&&DR.why==='no political system yet',!DR);
 const SK=RN.strikes[0],held=SK?SK.held:[];
 ok('refused, the workers strike: the workplaces most of them work held, their hours lost ('+held.join(', ')+')',!!SK&&held[0]==='vFarm'&&SK.until-SK.m===1440&&N.S.unrestReport().events.some(e=>e.kind==='strike'),!SK);
 const NR=mk({short:false,unrest:{ruler:()=>true}});NR.run(9);const RR=NR.S.unrestReport('valapo').towns.valapo;
 ok('a faction that grants the ruler: no strike follows ('+RR.demands.map(D=>D.kind+' '+D.answer).join(', ')+')',RR.demands.every(D=>D.answer!=='refused')&&!RR.strikes.length,!!RR.strikes.length);
 const cheer=A.ps.filter(a=>a.cls==='poor').every(a=>(a.hmods||[]).some(h=>h.why==='demand granted'));
 ok('a granted demand cheers the people who made it, not the others',cheer&&A.ps.filter(a=>a.cls==='middle').every(a=>!(a.hmods||[]).some(h=>h.why==='demand granted')),!cheer);
 // easing back: a stage leaves only `hyst` over its line (the pool read as it is: smooth near nothing; no cheers)
 const H=mk({short:false,rate:0,unrest:{smooth:0.01,demand:{granted:{n:0},refused:{n:0}}}}),wk=H.ps.filter(a=>a.cls==='poor'),at=(w)=>{wk.forEach(a=>{H.S.needsOf(a,H.S.minute());a.nd[0]=w;});H.run(1);return H.S.UNREST.towns.valapo.stage.poor;};
 H.run(1);const seq=[65,58,54,47,40].map(at);
 ok('a stage eases back only '+H.S.UNREST.cfg.hyst+' points over its line (the pool 35, 42, 46, 53, 60: '+seq.join(', ')+')',seq.join(',')==='demand,demand,grumble,grumble,calm',seq[1]!=='demand');
}

console.log(bad?bad+' FAILED':'all passed');if(bad&&typeof process!=='undefined')process.exit(1);
