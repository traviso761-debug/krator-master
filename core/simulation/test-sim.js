// node core/simulation/test-sim.js — the simulation core's contract on a toy world, each check with a negative.
// (This machine has no node: python <scratch>/jsrun.py core/sched/20-core-sched.js core/simulation/77-sim-*.js core/simulation/test-sim.js)
const fs=require('fs'),path=require('path');
global.window=global;
['77-sim-0-core.js','77-sim-1-world.js','77-sim-2-places.js','77-sim-3-actors.js','77-sim-4-nav.js','77-sim-5-motion.js','77-sim-5r-routes.js','77-sim-6-economy.js','77-sim-6-items.js','77-sim-6-needs.js','77-sim-6-population.js','77-sim-8-export.js','77-sim-9-debug.js']
  .forEach(f=>(0,eval)(fs.readFileSync(path.join(__dirname,f),'utf8')));
let bad=0;const ok=(name,pass,neg)=>{const r=pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const near=(a,b,e)=>Math.abs(a-b)<(e||1e-6);

function world(seed){
  // a fresh SIM each time: re-evaluate the module
  ['77-sim-0-core.js','77-sim-1-world.js','77-sim-2-places.js','77-sim-3-actors.js','77-sim-4-nav.js','77-sim-5-motion.js','77-sim-5r-routes.js','77-sim-6-economy.js','77-sim-6-items.js','77-sim-6-needs.js','77-sim-6-population.js','77-sim-8-export.js','77-sim-9-debug.js']
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
  ok('home: on foot to the landing, then by kayak to the hut',T2.legs.length>=1&&T2.legs[T2.legs.length-1].layer==='kayak'&&g.inVehicle==='boat',T2.legs[T2.legs.length-1].layer!=='kayak');}
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

console.log(bad?bad+' FAILED':'all passed');if(bad&&typeof process!=='undefined')process.exit(1);
