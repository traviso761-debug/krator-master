/* ================================================================= THEODIGA TODAY: the census on core/simulation (records; draws nothing)
   [G data] T-sim-1 (the owner, 2026-11-16: "Census on the sim"; BLUEPRINT.md Next "the census as core/simulation roles").
   Theodiga's people as core/simulation records (core/simulation/SCHEMA.md; settlements/longsong/src/40d-ls-sim.js and
   settlements/dhelv/src/74-dhelv-sim.js are the worked examples), at the RECORD level: the records exist, the residents are
   dealt to their homes and posts; nobody walks yet (a walk graph over the town, the ways and the arcology is the next stage).
     the settlement  'theodiga' (the Xanadu Sultanate's), every place and role in it
     the factions    the Xanadu Sultanate; the faith of the Decree (its clergy, its pilgrims); the Order of Historians
     the PLACES      a home a building with people (SLEEP and EAT, the census's people in it), kind 'home:<quarter>'; the
                     town's work places by what they are (the bazaar's arcades, the stores, the serai, the Garrison Gate, the
                     baths, the granaries and farmsteads, the hostels, the shrines and temples); the salvage yards, the silt
                     and upland fields, the bore and its lodge; the kora; the arcology's units by program (its cells and
                     lodgings homes 'arc:<area>', their people the blueprint's by area spread by floor area; its kitchens,
                     studies, works, halls; the Dome's halls and the chapels for prayer)
     the ROLES       one a quarter of the town, its count the census's (TH_TOWN: the hostel keepers and rich households of
                     Gate Square, the bazaar's merchants, the East Gate's caravaners, the salvagers, the farmers and dairymen,
                     the poor tier's labourers, the upland farmers); the arcology's by the blueprint (the Keeper's house and
                     the singers, the scholars, the priests, the monks and novices, the lay servants, the Order's
                     delegation); the Rare Devisers at the bore; the pilgrims in the hostels (visitors: resident false)
   Every place's slots are counted from the workers its roles send there, so the capacity audit reads true.
   TH_SIM.world(o) -> {activities, factions, orgs, roles};  TH_SIM.places(o) -> place records;
   TH_SIM.declare(SIM, o) -> {places, actors, byRole, homeless, problems, audit}
     o.lots    [{id, key, name, x, y, z, quarter, people, civic, work}] every building the town placed (works too), dam frame
     o.fields  [{id, corners}] the upland and the silt fields; o.arc TH_ARC_PROGRAM; o.kora {x0, x1, zc(x), y}; o.gx, o.gz */
var TH_SIM=(function(){
 /* the schedules, as spans [[hour, ACT], ...] */
 const SCHED={
  work:[[0,'SLEEP'],[6,'EAT'],[7,'WORK'],[12,'EAT'],[13,'WORK'],[18,'EAT'],[19,'SOCIALIZE'],[21,'SLEEP']],
  farm:[[0,'SLEEP'],[5,'EAT'],[6,'WORK'],[11,'EAT'],[12,'WORK'],[17,'EAT'],[18,'PRAY'],[19,'SOCIALIZE'],[21,'SLEEP']],
  shop:[[0,'SLEEP'],[7,'EAT'],[8,'WORK'],[13,'EAT'],[14,'WORK'],[19,'EAT'],[20,'SOCIALIZE'],[22,'SLEEP']],
  /* the salvagers' (T-town-8): the yards are at the foot of the face, about 2.3 world hours' walk below their homes, so
     they go down at five, eat at the yards' cookhouse at dawn and noon (their EAT pinned to work), and come up at
     five in the afternoon, home by about half past seven with free hours to shop. On the town's day they walked home
     to eat at noon and at six, worked a few hours, and their shoppers never reached the bazaar */
  salvage:[[0,'SLEEP'],[5,'EAT'],[6,'WORK'],[12,'EAT'],[13,'WORK'],[17,'SOCIALIZE'],[21,'SLEEP']],
  monk:[[0,'SLEEP'],[4,'PRAY'],[6,'EAT'],[7,'WORK'],[12,'EAT'],[13,'PRAY'],[15,'WORK'],[18,'EAT'],[19,'PRAY'],[21,'SLEEP']],
  priest:[[0,'SLEEP'],[4,'PRAY'],[7,'EAT'],[8,'PRAY'],[12,'EAT'],[13,'WORK'],[17,'PRAY'],[19,'EAT'],[20,'PRAY'],[21,'SLEEP']],
  pilgrim:[[0,'SLEEP'],[5,'KORA'],[8,'EAT'],[9,'TRADE'],[11,'PRAY'],[13,'EAT'],[14,'KORA'],[17,'SOCIALIZE'],[19,'EAT'],[20,'PRAY'],[21,'SLEEP']]};
 /* the town's quarters: their role, its schedule and where it works (TH_TOWN.QUARTERS) */
 const QROLE={square:{id:'hosteller',name:'the hostel keepers and households of Gate Square',sched:'shop',work:['hostel','bath','store']},
  bazaar:{id:'merchant',name:'the bazaar\'s merchants and craftsmen',sched:'shop',work:['bazaar','store']},
  gate:{id:'caravaner',name:'the caravaners and carters of the East Gate',sched:'work',work:['serai','gate','store']},
  salvage:{id:'salvager',name:'the Salvagers\' guild',sched:'salvage',work:['yard'],org:'salvagers',eat:'work'},
  farmers:{id:'farmer',name:'the temple estates\' farmers and dairymen',sched:'farm',work:['field','granary','farmstead']},
  poor:{id:'labourer',name:'the poor tier\'s labourers',sched:'work',work:['yard','field','store']},
  farms:{id:'upland-farmer',name:'the upland farmers',sched:'farm',work:['field','farmstead']}};
 /* the arcology's people by area (BLUEPRINT.md "Who lives where") and their roles */
 const AREA={crest:120,gallery:60,'fin+0':200,'fin+46':165,'fin-46':165,'fin-92':60,'fin+138':110,'fin-138':25};
 const AROLE=[{id:'keeper',name:'the Keeper of the Dome\'s house and the singers',homes:['arc:crest'],sched:'priest',work:['dome','arc-hall']},
  {id:'scholar',name:'the scholars, grammarians and archivists',homes:['arc:gallery','arc:fin-92'],sched:'monk',work:['arc-study']},
  {id:'priest',name:'the priests',homes:['arc:fin+0'],sched:'priest',work:['dome','chapel']},
  {id:'monk',name:'the monks and novices',homes:['arc:fin+46','arc:fin-46'],sched:'monk',work:['arc-works','arc-kitchen','arc-study']},
  {id:'servant',name:'the lay servants and the Dome\'s keepers',homes:['arc:fin+138'],sched:'work',work:['arc-kitchen','arc-works']},
  {id:'historian',name:'the Order\'s delegation (the History Monks)',homes:['arc:fin-138'],sched:'monk',work:['arc-study'],org:'order'}];
 const SLEEPK={cells:1,dormitory:1,lodging:1,chamber:1,guest_bed:1,guard:1,infirmary:1};
 const AWORK={kitchen:'arc-kitchen',bakehouse:'arc-kitchen',larder:'arc-kitchen',store:'arc-works',wardrobe:'arc-works',treasury:'arc-works',workshop:'arc-works',rising_main:'arc-works',
  library:'arc-study',archive:'arc-study',archive_stacks:'arc-study',reading_room:'arc-study',scriptorium:'arc-study',school:'arc-study',lecture:'arc-study',office:'arc-study',
  servants_hall:'arc-hall',assembly:'arc-hall',guest_hall:'arc-hall',gatehouse_deep:'arc-works',entrance:'arc-works'};
 const PRAYK={sanctum:'dome',altar:'dome',ancestors_hall:'dome',lamp_hall:'dome',offering_hall:'dome',music:'dome',wheel_house:'dome',damsel_shrine:'dome',chapel:'chapel'};
 const areaOf=u=>u.area==='fin'?'fin'+u.id.slice('th.arc.fin.'.length).split('.')[0]:u.area;
 const workKind=L=>{const k=L.key,n=L.name||'';
  if(L.work==='salvage')return 'yard';if(L.work==='silt fields')return 'farmstead';if(L.work==='the bore')return 'bore';
  if(/^qb_/.test(k))return /hostel/i.test(n+k)?'hostel':/chorten|temple|shrine|wheel|stupa|gate/i.test(n+k)?'shrine':null;
  return {xa_scrap_bazaar:'bazaar',xa_scrap_store:'store',xa_scrap_serai:'serai',xa_scrap_gate:'gate',xa_scrap_shrine:'shrine',xa_scrap_bath:'bath',
   xa_scrap_granary:'granary',xa_scrap_silos:'granary',xa_scrap_farm:'farmstead',xa_scrap_pavilion:null}[k]||null;};
 function world(o){const census=o.census||{byQuarter:{}},acts=['SLEEP','EAT','WORK','PRAY','KORA','TRADE','SOCIALIZE','REST','IDLE'];
  const roles=[];
  /* every role works its own job (T-town-9: WORK pinned to .work; without it core sends a worker to the nearest place offering
     WORK, and on the page most salvagers worked the town's stores and fields, a few the arcology's studies) */
  /* the town's roles keep two schedules dealt in turn (core's `variants`): the day's, and the same an hour later, so the town
     does not turn from one activity to the next all in one minute (a rush hour's first routes are searched at that minute) */
  const later=S=>{const L=S.map(([h,a])=>[(h+1)%24,a]).sort((p,q)=>p[0]-q[0]);if(L[0][0]!==0)L.unshift([0,L[L.length-1][1]]);return L;};
  for(const q in QROLE){const n=census.byQuarter[q]|0;if(!n)continue;const R=QROLE[q];
   roles.push({id:R.id,org:R.org||'town',name:R.name,sched:SCHED[R.sched],variants:[SCHED[R.sched],later(SCHED[R.sched])],count:n,homes:['home:'+q],work:{kinds:R.work,act:'WORK',near:true},settlement:'theodiga',
    prefers:{SLEEP:{pin:'home'},EAT:{pin:R.eat||'home'},WORK:{pin:'work'}}});}
  for(const R of AROLE)roles.push({id:R.id,org:R.org||'clergy',name:R.name,sched:SCHED[R.sched],count:R.homes.reduce((s,h)=>s+(AREA[h.slice(4)]|0),0),homes:R.homes,
   work:{kinds:R.work,act:'WORK',near:true},settlement:'theodiga',prefers:{SLEEP:{pin:'home'},EAT:{pin:'home'},WORK:{pin:'work'}}});
  roles.push({id:'deviser',org:'devisers',name:'the Rare Devisers and their haulers at the bore',sched:SCHED.work,count:o.devisers==null?12:o.devisers,homes:['home:bore'],
   work:{kinds:['bore'],act:'WORK'},settlement:'theodiga',prefers:{SLEEP:{pin:'home'},EAT:{pin:'home'},WORK:{pin:'work'}}});
  roles.push({id:'pilgrim',org:'pilgrims',name:'pilgrims to the Dome',sched:SCHED.pilgrim,count:o.pilgrims|0,homes:['hostel'],settlement:'theodiga',prefers:{SLEEP:{pin:'home'}}});
  return {activities:acts.map(id=>({id,indoor:/^(SLEEP|EAT|WORK|PRAY)$/.test(id)})),
   factions:[{id:'xanadu',name:'The Xanadu Sultanate'},{id:'decree',name:'The faith of the Decree',parent:'xanadu'},{id:'historians',name:'The Order of Historians'}],
   orgs:[{id:'town',faction:'xanadu',name:'The people of Theodiga'},{id:'salvagers',faction:'xanadu',name:'The Salvagers\' guild'},
    {id:'devisers',faction:'xanadu',name:'The Rare Devisers (the royal licence)'},{id:'clergy',faction:'decree',name:'The clergy of the Dome'},
    {id:'order',faction:'historians',name:'The Order\'s delegation at Theodiga'},{id:'pilgrims',faction:'decree',name:'Pilgrims to the Dome',resident:false}],roles};}
 function places(o,W){const gx=o.gx||0,gz=o.gz||0,out=[],R3=v=>Math.round(v*100)/100;
  const add=(id,kind,x,y,z,acts,ex)=>{out.push(Object.assign({id,kind,x:R3(x+gx),y:R3(y),z:R3(z+gz),door:{x:R3(x+gx),y:R3(y),z:R3(z+gz)},activities:acts,settlement:'theodiga'},ex||{}));};
  /* who works at each kind (to size the posts), the roles' counts spread over the kinds they may work at */
  const want={},kindCount={};
  for(const R of W.roles)if(R.work)for(const k of R.work.kinds)want[k]=(want[k]||0)+R.count/R.work.kinds.length;
  const workLots=o.lots.map(L=>({L,k:workKind(L)})).filter(w=>w.k);
  for(const w of workLots)kindCount[w.k]=(kindCount[w.k]||0)+1;
  const fieldN=(o.fields||[]).length;if(fieldN)kindCount.field=fieldN;
  const posts=k=>Math.max(4,Math.ceil((want[k]||0)/Math.max(1,kindCount[k]||1)*1.15));
  /* homes: every building with people */
  for(const L of o.lots){if(!(L.people>0))continue;const q=L.quarter||'works';
   add('th.home.'+L.id,'home:'+q,L.x,L.y,L.z,{SLEEP:L.people,EAT:L.people},{name:L.name,access:'private',indoor:true});}
  /* the Devisers' lodge sleeps them */
  const lodge=o.lots.find(L=>L.work==='the bore'&&/lodge/i.test(L.name||''));
  if(lodge)add('th.home.bore','home:bore',lodge.x,lodge.y,lodge.z,{SLEEP:o.devisers==null?12:o.devisers,EAT:o.devisers==null?12:o.devisers},{name:'the Rare Devisers\' lodge',access:'org',org:'devisers',indoor:true});
  /* the town's work places */
  for(const {L,k} of workLots){const acts={WORK:posts(k)};
   if(k==='bazaar'||k==='serai')acts.TRADE=40;if(k==='shrine')acts.PRAY=60;if(k==='bath')acts.SOCIALIZE=40;
   /* the yards' cookhouse: the salvagers eat where they work (T-town-8) */
   if(k==='yard')acts.EAT=acts.WORK;
   if(k==='hostel'){acts.SLEEP=o.hostelBeds==null?40:o.hostelBeds;acts.EAT=acts.SLEEP;}
   /* out of doors: the yards, the fields, and the bazaar's arcades (its stalls under the arcade, in sight of the street) */
   add('th.work.'+L.id,k,L.x,L.y,L.z,acts,{name:L.name,indoor:k!=='yard'&&k!=='field'&&k!=='bazaar',wander:k==='bazaar'?3:undefined,r:k==='bazaar'?12:undefined});}
  /* Gate Square: the town's open floor, where the pilgrims gather and trade and the town meets of an evening */
  if(o.square){const Q=o.square,x=(Q.x0+Q.x1)/2,z=(Q.z0+Q.z1)/2;add('th.square','square',x,Q.y==null?440:Q.y,z,{TRADE:600,SOCIALIZE:800},{name:'Gate Square',indoor:false,r:Math.min(Q.x1-Q.x0,Q.z1-Q.z0)/2-3,wander:8});}
  for(const F of o.fields||[]){const c=F.corners,x=(c[0][0]+c[2][0])/2,z=(c[0][1]+c[2][1])/2;add('th.field.'+F.id,'field',x,F.y==null?440:F.y,z,{WORK:posts('field')},{name:'a field',indoor:false,r:10});}
  /* the kora along the crest, and the pilgrims' hostels' share of prayer at the Dome */
  if(o.kora){const K=o.kora,x=(K.x0+K.x1)/2;add('th.kora','kora',x,K.y,K.zc(x)+30,{KORA:4000,SOCIALIZE:400},{name:'the middle kora',indoor:false,r:180,wander:6});}
  /* the arcology: its units by program; its homes' beds the area's people by floor area */
  const units=o.arc||[],areaFloor={};
  const foot=u=>u.shape==='circle'?Math.PI*u.r*u.r:u.shape==='arc'?Math.abs(u.x1-u.x0)*Math.abs(u.zb-u.za):Math.abs(u.x1-u.x0)*Math.abs(u.z1-u.z0);
  const at=u=>u.shape==='circle'?[u.cx,u.cz]:u.shape==='arc'?[(u.x0+u.x1)/2,-140*(1-Math.pow((u.x0+u.x1)/2/320,2))+(u.za+u.zb)/2]:[(u.x0+u.x1)/2,(u.z0+u.z1)/2];
  for(const u of units)if(SLEEPK[u.kind]){const a=areaOf(u);areaFloor[a]=(areaFloor[a]||0)+foot(u)*u.n;}
  const left={};for(const a in AREA)left[a]=AREA[a];
  const sleepers=units.filter(u=>SLEEPK[u.kind]);
  sleepers.forEach((u,i)=>{const a=areaOf(u);if(!(a in AREA)||!areaFloor[a])return;const last=!sleepers.slice(i+1).some(v=>areaOf(v)===a);
   const n=last?left[a]:Math.min(left[a],Math.round(AREA[a]*foot(u)*u.n/areaFloor[a]));left[a]-=n;if(n<=0)return;const p=at(u);
   add('th.home.'+u.id,'arc:'+a,p[0],u.y0,p[1],{SLEEP:n,EAT:n},{name:u.name,access:'org',org:a==='fin-138'?'order':'clergy',indoor:true});});
  for(const u of units){const k=AWORK[u.kind]||PRAYK[u.kind];if(!k)continue;const p=at(u),acts={};
   if(PRAYK[u.kind])acts.PRAY=u.kind==='sanctum'?3000:u.kind==='chapel'?60:400;
   if(AWORK[u.kind]||k==='dome'||k==='chapel')acts.WORK=Math.max(4,Math.ceil((want[k]||0)/Math.max(1,units.filter(v=>(AWORK[v.kind]||PRAYK[v.kind])===k).length)*1.15));
   if(k==='arc-hall')acts.EAT=200;
   add('th.arc.'+u.id,k,p[0],u.y0,p[1],acts,{name:u.name,indoor:true,org:'clergy'});}
  return out;}
 function declare(SIM,o){const t0=Date.now(),problems=[];
  /* the pilgrims: as many as the hostels sleep, unless the caller says */
  if(o.pilgrims==null){const n=o.lots.filter(L=>workKind(L)==='hostel').length;o=Object.assign({},o,{pilgrims:n*(o.hostelBeds==null?40:o.hostelBeds)});}
  SIM.init({seed:o.seed==null?2215:o.seed,hour:o.hour||(()=>13),day:o.day||(()=>0),t:o.t||(()=>0),err:m=>problems.push(m)});
  SIM.settlement({id:'theodiga',faction:'xanadu',name:'Theodiga'});
  /* the walk graph (T-sim-2: src/48-th-walk.js, in the dam frame): the pedestrian layer at the group's offset, every place's door
     a node of it joined to the nearest node it is reached by (the arcology's by its storeys, the Dome's halls by the deck, a
     field by itself, the rest by the streets) */
  const G=o.walk||null,gx=o.gx||0,gz=o.gz||0;
  const W=world(o);
  const P=places(o,W);
  if(G){const TAGS=k=>/^arc:|^arc-|^chapel$/.test(k)?['arc']:k==='dome'?['deck']:k==='kora'?['kora']:k==='field'?['field','upland']:k==='square'?['square']:
     /^(yard|bore|home:bore)$/.test(k)?['works']:null;
   for(const r of P){const x=r.door.x-gx,z=r.door.z-gz,id=G.join(r.id,x,r.door.y,z,TAGS(r.kind)||['street','square','works','way'],TAGS(r.kind)?80:60);const n=G.byId[id];
    r.door={x:n.x+gx,y:n.y,z:n.z+gz,node:id};}
   SIM.nav.layer('pedestrian',{nodes:G.nodes.map(n=>({id:n.id,x:n.x+gx,y:n.y,z:n.z+gz,tag:n.tag})),edges:G.edges,cost:{stair:1.3,landing:1,floor:1,door:1,field:1.1,bridge:1},yWeight:4});
   SIM.REF={layer:'pedestrian',x:(o.ref?o.ref[0]:400)+gx,z:(o.ref?o.ref[1]:0)+gz};}
  SIM.load(W);
  for(const r of P)SIM.place(r);
  const pop=SIM.populate({settlement:'theodiga',prefix:'th'});
  const check=SIM.check();
  let audit=null;try{audit=typeof SIM.audit==='function'?SIM.audit():null;}catch(e){problems.push('audit: '+e.message);}
  return {places:P.length,actors:pop.actors,byRole:pop.byRole,beds:pop.beds,bedsLeft:pop.bedsLeft,homeless:pop.homeless.length,problems:problems.concat(check||[]),
   capacity:audit&&audit.capacity?audit.capacity.length:null,unknownActivities:audit&&audit.unknownActivities?audit.unknownActivities.length:null,ms:Date.now()-t0,
   nodes:G?G.nodes.length:0,edges:G?G.edges.length:0,unroutable:audit&&audit.unroutable?audit.unroutable.length:null,unroutableList:audit&&audit.unroutable?audit.unroutable.slice(0,8):null,
   roles:W.roles.map(R=>({id:R.id,count:R.count}))};}
 return {world,places,declare,QROLE,AREA,AROLE,workKind};
})();
