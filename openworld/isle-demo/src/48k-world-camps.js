// ================================================================= ISLE DEMO — the camps: a Raptor band in the east jungle
// [G data] core/camp/PLAN.md section 10, "The first build" (owner, 2026-10-26): a band of the Beast Riders' Raptor tribe
// camped in the mainland hyperjungle east of the north-east isles (the region's "east jungle" area,
// source/added-areas.json). Each spec names its band, its culture and tribe, the town its way in faces and the patch to
// look in; ISLE_CAMPS.make() finds the ground a whole camp fits on (a disc of SITE_R metres of the hamlets' ground rule:
// dry, gentle, no cliff, not a town's), nearest the survey point, and pitches the band's program (the kit's, BR_CAMP:
// passed in, as the dims are) with KCAMP.pitch, and counts its people with KCAMP.census. No three.js, no DOM: every
// number is a function of the world's fields, the specs and the band's seed, so the same camp comes out in Godot.
// 88k-world-camps.js draws it; it decides nothing.
//   ISLE_CAMPS.SPECS                   the bands, in order
//   ISLE_CAMPS.make(dims, programs)    -> {camps: [{spec, camp, census, site, error?}], errors: []}
//                                        dims(key, v) -> {w, d, h}; programs(tribe) -> the band's program
//   ISLE_CAMPS.simDeclare(made)        the camps on core/simulation (below)
//   ISLE_CAMPS.groundOk(x, z)          the hamlets' ground rule, inside the region
var ISLE_CAMPS=(function(){
const SPECS=[
 {id:'camp-raptor-1',name:'Raptor band',culture:'beast-rider',tribe:'raptor',home:'Talon',way:'Kautoa',near:[100000,-72000],look:5000}];
const CELL=250,SITE_R=150,RINGS=[0,45,90,150],SPOKES=12;
const groundOk=(x,z)=>WORLD.inside(x,z)&&ISLE_HAMLETS.groundOk(x,z);
const townAt=n=>{const s=WORLD_DATA.meta.settlements.find(q=>q.name===n);return s?[s.x,s.z]:null;};
/* the camp's ground: the whole disc on good ground (the rings first fail fast: the middle, then outward) */
function discOk(x,z){for(const r of RINGS){const n=r?SPOKES:1;for(let i=0;i<n;i++){const a=i/n*Math.PI*2;if(!groundOk(x+Math.cos(a)*r,z+Math.sin(a)*r))return false;}}return true;}
function siteFor(sp){const n=Math.floor(sp.look/CELL),C=[];
 for(let j=-n;j<=n;j++)for(let i=-n;i<=n;i++){if(i*i+j*j>n*n)continue;C.push([i,j,i*i+j*j]);}
 C.sort((a,b)=>a[2]-b[2]||a[1]-b[1]||a[0]-b[0]);   /* nearest the survey point first, a fixed order for ties */
 for(const c of C){const x=sp.near[0]+c[0]*CELL,z=sp.near[1]+c[1]*CELL;if(discOk(x,z))return{x,z};}
 return null;}
let last=null;
function make(dims,programs,opt){opt=opt||{};const out={camps:[],errors:[]};last=out;
 for(const sp of SPECS){const prog=programs(sp.tribe);if(!prog){out.errors.push(sp.id+': no program for '+sp.tribe);continue;}
  const site=siteFor(sp);if(!site){out.errors.push(sp.id+': no ground for a camp in the patch');continue;}
  const T=townAt(sp.way),way=T?[T[0]-site.x,T[1]-site.z]:[-1,0];
  const world=opt.world==null?4242:opt.world;
  const camp=KCAMP.pitch({id:sp.id,world,culture:sp.culture,program:prog,site,dims,ground:{ok:groundOk},way});
  const census=KCAMP.census({id:sp.id,world,culture:sp.culture,program:prog});
  if(camp.error)out.errors.push(sp.id+': '+camp.error);
  if(camp.short&&camp.short.length)out.errors.push(sp.id+': not pitched: '+camp.short.join(', '));
  out.camps.push({spec:sp,camp,census,site});}
 return out;}
/* THE CAMP ON core/simulation (core/camp/PLAN.md section 7, "the hand-overs": a pitched camp is a settlement): the Beast
   Riders' faction and its relation with the Islanders (cordial, trading), then for each camp a settlement (kind 'camp',
   mobile), the band's org, a walking layer of its own (the hearth, a door before each tent and pen, the gate in the hedge,
   the hunting and gathering grounds out beyond it in the forest), its places (the tents homes for their census's people,
   the hearth the band's eating and meeting ground, the council hall, the shrine, the trades' workshops, the pens, the
   grounds) and one actor for each of the census's people, home and work as the census dealt them. The camp starts
   abstract (its people decide nothing until it is in the window: 88k raises it). Every id is the band's.
   ISLE_CAMPS.simDeclare(made) -> {camps: [{id, layer, places, actors, roles}], problems: []} */
const CAMP_SCHED={work:[[0,'SLEEP'],[5,'EAT'],[6,'WORK'],[17,'SOCIALIZE'],[19,'EAT'],[20,'SOCIALIZE'],[22,'SLEEP']],
 hunt:[[0,'SLEEP'],[4,'EAT'],[5,'WORK'],[16,'SOCIALIZE'],[19,'EAT'],[20,'SOCIALIZE'],[22,'SLEEP']],
 child:[[0,'SLEEP'],[6,'EAT'],[7,'HOUSEWORK'],[11,'SOCIALIZE'],[13,'HOUSEWORK'],[16,'SOCIALIZE'],[18,'EAT'],[19,'SOCIALIZE'],[21,'SLEEP']],
 elder:[[0,'SLEEP'],[6,'EAT'],[7,'HOUSEWORK'],[10,'SOCIALIZE'],[12,'REST'],[15,'HOUSEWORK'],[17,'SOCIALIZE'],[18,'EAT'],[19,'REST'],[21,'SLEEP']]};
const CAMP_KIND={smith:'smithy',tackmaker:'workshop',hidemaker:'tannery',trader:'market',healer:'healer',spinner:'weaver'};
function simDeclare(made){const out={camps:[],problems:[]};
 if(typeof SIM==='undefined'||!SIM.R){out.problems.push('no sim on the page');return out;}
 if(!SIM.R.faction['beast-riders'])SIM.faction({id:'beast-riders',name:'The Beast Riders',sign:'claw'});
 if(SIM.R.faction.islanders){SIM.relation({a:'beast-riders',b:'islanders',stance:'cordial',trade:true});SIM.relation({a:'islanders',b:'beast-riders',stance:'cordial',trade:true});}
 for(const E of made.camps){const c=E.camp,cs=E.census,sp=E.spec,s=sp.id,org=s+'.band',L='camp:'+s;
  if(SIM.R.settlement&&SIM.R.settlement[s])continue;
  SIM.settlement({id:s,faction:'beast-riders',name:sp.name,kind:'camp',mobile:true,tribe:sp.tribe});
  SIM.org({id:org,faction:'beast-riders',name:'The '+sp.name});
  const y=(x,z)=>+WORLD.H(x,z).toFixed(2),nodes=[],edges=[];
  const node=(x,z,tag)=>{const n={id:L+':n'+nodes.length,x:+x.toFixed(2),y:y(x,z),z:+z.toFixed(2),tag};nodes.push(n);return n;};
  const edge=(a,b,kind)=>edges.push({id:L+':e'+edges.length,a:a.id,b:b.id,kind:kind||'path',len:+Math.hypot(a.x-b.x,a.z-b.z).toFixed(2),w:2});
  const H0=node(c.site.x,c.site.z,'hearth'),G0=node(c.gate.x,c.gate.z,'gate');edge(H0,G0,'path');
  /* the grounds out beyond the gate: the hunt farther, the gathering nearer, each to one side of the way */
  const wl=Math.hypot(c.way[0],c.way[1])||1,wx=c.way[0]/wl,wz=c.way[1]/wl,ground=(d,side,tag)=>{const n=node(c.gate.x+wx*d-wz*side,c.gate.z+wz*d+wx*side,tag);edge(G0,n,'track');return n;};
  const HU=ground(700,-160,'hunt'),GA=ground(260,140,'gather');
  const people=cs.people,byTent={},workers={};people.forEach(p=>{(byTent[p.tent]=byTent[p.tent]||[]).push(p);if(p.work)workers[p.work]=(workers[p.work]||0)+1;});
  const placeOf={},places=[];
  const put=(id,name,kind,at,door,acts,indoor,tags)=>{const P=SIM.place({id,name,kind,x:at.x,y:y(at.x,at.z),z:at.z,ry:at.ry||0,door:{x:door.x,y:door.y,z:door.z,node:door.id},
   activities:acts,indoor:indoor?true:{},wander:indoor?0:5,settlement:s,layer:L,tags:Object.assign({camp:s},tags||{})});places.push(P);return P;};
  put(s+':hearth','the hearth','square',{x:c.site.x,z:c.site.z},H0,{SOCIALIZE:60,EAT:60,IDLE:20},false,{role:'hearth'});
  for(const r of c.records){const dn=node(r.x+Math.sin(r.ry)*(r.d/2+1.5),r.z+Math.cos(r.ry)*(r.d/2+1.5),'door');edge(dn,H0,'path');
   const res=(byTent[r.id]||[]).length,acts={},kind=r.kind;let K='home',indoor=true;
   if(kind==='dwelling'||kind==='chief'||kind==='sleep'){if(!res)continue;['SLEEP','EAT','REST','IDLE','HOUSEWORK'].forEach(a=>acts[a]=res);if(kind==='chief')acts.SOCIALIZE=8;}
   else if(kind==='council'){K='hall';acts.SOCIALIZE=24;}
   else if(kind==='shrine'){K='shrine';acts.WORSHIP=10;acts.WORK=Math.max(1,workers[r.id]||0);}
   else if(kind==='trade'){const w=people.find(p=>p.work===r.id);K=CAMP_KIND[w&&w.role]||'workshop';acts.WORK=Math.max(1,workers[r.id]||0);if(K==='market')acts.BUY=4;indoor=false;}
   else if(kind==='pen'){K='pens';acts.WORK=Math.max(1,workers[r.id]||0);indoor=false;}
   placeOf[r.id]=put(s+':'+r.id.slice(s.length+1),r.key,K,r,dn,acts,indoor,{key:r.key,role:kind});}
  const hunters=people.filter(p=>p.role==='hunter').length,gatherers=people.filter(p=>p.role==='gatherer').length;
  const hunt=put(s+':hunt','the hunting grounds','hunt',HU,HU,{WORK:Math.max(1,hunters)},false,{role:'hunt'}),gath=put(s+':gather','the gathering grounds','gather',GA,GA,{WORK:Math.max(1,gatherers)},false,{role:'gather'});
  SIM.nav.layer(L,{nodes,edges});
  /* the roles: one a census role, its day by what it does */
  const roles={};people.forEach(p=>{if(roles[p.role])return;const sch=p.role==='child'?'child':p.role==='elder'?'elder':(p.role==='hunter'||p.role==='gatherer')?'hunt':'work';
   roles[p.role]=SIM.role({id:s+'.'+p.role,org,settlement:s,name:p.role,sched:CAMP_SCHED[sch],layer:L,
    prefers:{SLEEP:{pin:'home'},EAT:{pin:'home'},REST:{pin:'home'},IDLE:{pin:'home'},HOUSEWORK:{pin:'home'},WORK:{pin:'work'}}});});
  let n=0;for(const p of people){const H=placeOf[p.tent],W=p.work?placeOf[p.work]:p.role==='hunter'?hunt:p.role==='gatherer'?gath:null;
   if(!H){out.problems.push(s+': '+p.id+' has no home place');continue;}
   SIM.actor({id:p.id,role:s+'.'+p.role,org,faction:'beast-riders',home:H.id,work:W?W.id:undefined,settlement:s,cls:'camp',job:p.role,age:p.age});n++;}
  if(SIM.level)SIM.level(s,'abstract');
  out.camps.push({id:s,layer:L,places:places.length,actors:n,roles:Object.keys(roles).length,nodes:nodes.length});}
 return out;}
/* the camp in "Go to": its view is read when it is chosen (the camp is made after the menu is) */
if(typeof WORLD_CONFIG!=='undefined')WORLD_CONFIG.goViews.push({label:'Raptor band camp (east jungle)',get view(){
 const C=last&&last.camps[0];const s=C?C.site:{x:SPECS[0].near[0],z:SPECS[0].near[1]};return[s.x-260,s.z+300,140,-.7,-.32];}});
return{SPECS,make,simDeclare,groundOk,discOk,SITE_R};})();
