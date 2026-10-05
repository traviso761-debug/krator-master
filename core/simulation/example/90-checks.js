// ================================================================= EXAMPLE — the checks (window._example), each with a negative
// check.py loads the sheet held (?hold) and reads these. A check is fed a broken input in negatives() and must fail
// there, or it cannot fail at all. The negatives run last and put back what they broke.
//   _example.run(minutes)   step SIM a world minute at a time (the clock set mid-minute, motion 1/1440 of a day each)
//   _example.checks()       [{name, ok, detail}]          _example.negatives()  [{name, failed, detail}]
//   _example.hash()         the decision log as one number: two loads with one seed must agree, two seeds must not
function run(minutes){let M=SIM.minute();for(let m=0;m<minutes;m++){M++;CLOCK.day=Math.floor(M/1440);CLOCK.hour=(M%1440+.5)/60;CLOCK.t+=CLOCK.dayLength/1440;SIM.step();}LAST=SIM.minute();}
const residents=()=>SIM.all('actor').filter(a=>a.present&&!a.transient);
const CHK={
 // every reference resolves (SIM.check)
 resolves(){const p=SIM.check();return{ok:!p.length,detail:p.length?p.slice(0,3).join('; '):SIM.all('activity').length+' activities, '+SIM.all('role').length+' roles, '+SIM.all('place').length+' places: every reference resolves'};},
 // the audit: everyone housed, every place and port reachable from the market, no unknown activity, no hour short
 audit(){const A=SIM.audit(),bad=[];if(A.people!==20)bad.push(A.people+' people');if(POP.homeless.length)bad.push('homeless: '+POP.homeless.join(','));
  if(A.unroutable.length)bad.push('unreachable: '+A.unroutable.join(','));if(A.unknownActivities.length)bad.push('unknown: '+A.unknownActivities.join(','));
  if(A.capacity.length)bad.push('short: '+A.capacity.map(c=>c.hour+'h '+c.activity+' '+c.short).join(','));
  return{ok:!bad.length,detail:bad.join('; ')||A.people+' people in '+POP.beds+' beds, '+A.places+' places and '+SIM.all('port').length+' ports reachable, 24 hours without a shortfall'};},
 // a day stepped minute by minute: no one stuck, no route failed, and at every half hour each resident is doing what its
 // schedule says or a fallback, at a place that offers it
 day(minutes){const n0=SIM.LOG.length,f0=SIM.routeFail.length;let wrong=0,fell=0,dec=0;const first=[];
  for(let m=0;m<minutes;m++){run(1);if(SIM.minute()%60!==30)continue;
   for(const a of residents()){const want=SIM.desire(a);if(a.activity!==want)fell++;const P=SIM.get('place',a.place);
    if(!a.task||!P||!SIM.offers(P,a.activity)&&!(a.activity==='IDLE'&&a.place===a.home)){wrong++;if(first.length<2)first.push(a.id+' '+a.activity+' at '+a.place);}}}
  const L=SIM.LOG.slice(n0),stuck=L.filter(e=>e.kind==='stuck').length,nop=L.filter(e=>e.kind==='nopath').length,rf=SIM.routeFail.length-f0;dec=L.filter(e=>e.kind==='decide').length;
  const fired=L.filter(e=>e.kind==='event').length;
  return{ok:!stuck&&!nop&&!rf&&!wrong,detail:dec+' decisions, '+fired+' caravans; at the half hours '+fell+' fallbacks'+(stuck?', '+stuck+' STUCK':'')+(nop||rf?', '+(nop+rf)+' NO PATH':'')+(wrong?', '+wrong+' NOWHERE (first '+first.join(', ')+')':'')};},
 // an event with legs, fired now and stepped: its stops in order (want), then out by its port
 caravan(E,want){const f0=SIM.routeFail.length,G=SIM.fire(E,SIM.minute(),SIM.time());if(!G)return{ok:false,detail:E.id+' did not fire'};
  const stops=[];let ph=G.phase,m=0;for(;m<1440&&SIM.get('group',G.id);m++){run(1);if(G.phase!==ph){ph=G.phase;if(ph==='dwell'){const A=SIM.get('actor',G.leader),L=A.plan[A.planI];stops.push(L.activity+' at '+L.place);}}}
  const left=!SIM.get('group',G.id),rf=SIM.routeFail.length-f0,same=stops.join()===want.join();
  return{ok:left&&same&&!rf,detail:G.members.length+' riders: '+(stops.join(' -> ')||'no stops')+(left?', out by '+G.to+' after '+m+' min':', STILL IN')+(rf?', '+rf+' NO PATH':'')+(same?'':'; WANTED '+want.join(' -> '))};},
};
const WANT=['WATER_BEASTS at well','TRADE at market'];
function checks(){return[
 Object.assign({name:'the world resolves'},CHK.resolves()),
 Object.assign({name:'the audit: housed, reachable, enough room every hour'},CHK.audit()),
 Object.assign({name:'two days stepped minute by minute'},CHK.day(2880)),
 Object.assign({name:'the caravan: well, then market, then out west'},CHK.caravan(SIM.get('event','caravan'),WANT))];}
function negatives(){QUIET=true;const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),p0=SIM.problems.length,L0=SIM.nav.layers.pedestrian;
 SIM.role({id:'ghost',org:'nobody',sched:[[0,'FLY']]});add('a role in an unknown org asking for FLY',CHK.resolves());SIM.remove('role','ghost');
 SIM.nav.layer('pedestrian',{nodes:NODES,edges:EDGES.filter(e=>e.b!=='east')});add('the east road cut',CHK.audit());SIM.nav.layers.pedestrian=L0;
 SIM.nav.layer('pedestrian',{nodes:NODES,edges:[]});add('a town with no streets (a whole day)',CHK.day(1440));SIM.nav.layers.pedestrian=L0;
 SIM.all('actor').forEach(a=>{a.bad={};a.mem={};});
 const X=SIM.event(Object.assign({},SIM.get('event','caravan'),{id:'lost_caravan',legs:[{activity:'SING',mins:10}]}));
 add('a caravan whose stop nothing offers',CHK.caravan(X,WANT));SIM.remove('event',X.id);
 SIM.problems.length=p0;SIM.routeFail.length=0;QUIET=false;return R;}
function hash(){let h=2166136261;const s=JSON.stringify(SIM.LOG.map(e=>[e.m,e.kind,e.actor,e.place,e.group]));for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
window._example={run,checks,negatives,hash,problems:()=>SIM.problems.slice(),census:()=>SIM.census(),audit:()=>SIM.audit(),export:o=>SIM.export(o)};
window._ready=true;
