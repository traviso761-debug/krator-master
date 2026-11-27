// ================================================================= THE LAKE TOWNS — the people's world as data for core/simulation (PLAN.md L5)
// [G data] core/simulation (SIM) is the vocabulary; this is a lake town's declaration into it, in core/simulation/SCHEMA.md's
// order, as Thalaba's (settlements/thalaba/targets/town/89zu-tb-people.js) is:
//   1. the PEOPLE (xlPeople(T).PEOPLE): one record per resident, by household: every house of the plan (89zq XL_TOWN.place,
//      kind 'house') holds XL.HH people (5.5: five or six, the sixth to the houses ranked first by a hash), the governor's house
//      its eight. The roles are the tune's crews (core/region/data/xan-tune.js lakeTown: the crew is 45 % of the people, at
//      most 400; half of it at the dugouts where the town fishes, half at each of its trades, two fifths on the terraces), the
//      market's stall keepers (one a stall), the temple's priests; the rest the households. Each drawn by its rank in a hash of
//      (the town's seed, the household, the person) (core/rand: never by draw order), so a person keeps its job as the town grows
//   2. the ROLES and their SCHEDULES (xlPeople(T).ROLES): a day of hourly activities; the households, the second row's keepers
//      and the fair-goers on a week (89zn XL_DAYS): the town's market day (the round's boat at the quay: the households down to
//      buy, the second row open), the fair's days in the loop towns (a share of the households away on the launch to Phēr)
//   3. the NAVIGATION LAYER 'pedestrian' (graph()): every way of the plan (the shore road, the streets, the stairs up the
//      terraces) resampled every 12 m, crossings stitched (nodes of two ways within 7 m), every place's door and every field
//      joined straight to its nearest way node; lazy (SIM.lazy): a leg is the straight line until it is drawn
//   4. the PLACES (places()): the houses (sleep, eat, rest: indoor), the governor's house, the temple and the shrines, the
//      landing stair (water, washing), the quay (loading), the boat sheds and racks (mending), the works and the shops, the
//      teahouse and the bath, the stalls and the market square, the terraces' fields and the orchards; and two places that are
//      not on the ground: the lake (the dugouts' crews out fishing: hidden at the landing, their boats drawn out on the water by
//      90s) and the fair (the loop's launch to Phēr: hidden at the quay)
// The roles' numbers are the tune's, the schedules PROPOSED (the plan leaves them to this step). No rule lives in the drawing:
// 90t-xl-life.js reads SIM.pose and draws. Declared once (init), on the first frame the host's clock is up.
function xlPeople(T){const O={inited:false,problems:[],CELL:12},key=T.key,S=T.spec,TU=XL.tune(key)||{people:0,make:{}};
 const SEED=KRAND.child(T.seed,'people'),U=(a,b,c)=>KRAND.unit(KRAND.hash(SEED,a,b,c)),D=(v,d)=>v==null?d:v;
 const gY=(x,z)=>xlH(key,x,z),FAIR_TOWN=!!XL_DAYS.LOOP[key];
 // ---------------------------------------------------------------- 1. the people
 const homes=T.place.filter(p=>p.kind==='house'),HH=XL.HH,P=[];
 {const want=Math.round(homes.length*HH),base=Math.floor(HH),extra=want-base*homes.length,rank=homes.map((p,i)=>[U(i,0,9),i]).sort((a,b)=>a[0]-b[0]);
  const n=homes.map(()=>base);for(let k=0;k<extra&&k<rank.length;k++)n[rank[k][1]]++;
  homes.forEach((p,hi)=>{for(let k=0;k<n[hi];k++)P.push({id:'xl.'+hi+'.'+k,home:'H:'+p.id,hh:hi,k,rank:U(hi,k,1)});});
  O.housed=n;}
 /* the crews (the tune's lakeTown, its rules read here: fishing unless the town lives by its landing; a half crew a trade) */
 const people=P.length,crew=Math.min(400,Math.round(people*.45)),fishing=['weaver','pottery','quarry','boatyard'].indexOf(key)<0;
 const goods=Object.keys(TU.make||{}).filter(g=>g!=='brocade'),stalls=T.place.filter(p=>p.kind==='stall');
 /* the works' hands: the tune's crews where it names the town's goods (half the crew a good; Wībhar's looms 300, its own
    works record), and PROPOSED eight a works building the page lays that the tune has no good for (the plans' trades:
    Māuṭh's, Nēṭ's nets and so on), at most three in ten of the town */
 const worksN=T.place.filter(p=>p.kind==='work'&&!/^xa_(boatshed|fish_racks|net_loft|quay|ghat)$/.test(p.key)).length;
 const hands=goods.length*Math.round(crew*.5)+(key==='weaver'?300:0)+(goods.length?0:worksN*8);
 const SHARE=[['fisher',fishing?Math.round(crew*.5):0],['porter',fishing?0:10],['worker',Math.min(Math.round(people*.3),hands)],
  ['farmer',Math.round(crew*.4)],['seller.0',stalls.filter(p=>p.id.indexOf(':stall:0:')>0).length],['seller.1',stalls.filter(p=>p.id.indexOf(':stall:1:')>0).length],
  ['priest',T.place.some(p=>p.key==='xa_temple')?4:0]];
 {const order=P.slice().sort((a,b)=>a.rank-b.rank||(a.id<b.id?-1:1));let i=0;
  for(const [role,m] of SHARE)for(let j=0;j<m&&i<order.length;j++,i++)order[i].role=role;
  for(;i<order.length;i++)order[i].role='household';}
 /* the households in two halves (their mornings and afternoons), and the fair-goers: in a loop town a fifth of them */
 for(const p of P)if(p.role==='household'){p.role+='.'+(U(p.hh,p.k,3)<.5?0:1);if(FAIR_TOWN&&U(p.hh,p.k,4)<.2)p.role='fairgoer.'+p.role.slice(-1);}
 /* the governor's house: the Sultan's man and his household and clerks (the house the plan's civic set lays) */
 const gov=T.place.find(p=>p.key==='xa_governor');if(gov)for(let k=0;k<8;k++)P.push({id:'xl.gov.'+k,role:k<3?'official':'household.'+(k%2),home:'C:governor',hh:-1,k});
 O.PEOPLE=P;O.crew=crew;O.fishing=fishing;O.goods=goods;
 O.byRole=P.reduce((a,p)=>{a[p.role]=D(a[p.role],0)+1;return a;},{});
 // ---------------------------------------------------------------- 2. the roles and their schedules (SIM.sched spans: [hour, ACT])
 const Sd={
  fisher:[[0,'SLEEP'],[4,'EAT'],[5,'FISH'],[12,'EAT'],[13,'MEND'],[17,'SOCIALIZE'],[19,'EAT'],[20,'SLEEP']],   /* out at dawn, back at noon */
  porter:[[0,'SLEEP'],[5,'EAT'],[6,'LOAD'],[12,'EAT'],[13,'LOAD'],[18,'SOCIALIZE'],[20,'EAT'],[21,'SLEEP']],
  worker:[[0,'SLEEP'],[6,'EAT'],[7,'WORK'],[12,'EAT'],[13,'WORK'],[18,'SOCIALIZE'],[20,'EAT'],[21,'SLEEP']],
  farmer:[[0,'SLEEP'],[5,'EAT'],[6,'FARM'],[19,'EAT'],[20,'SOCIALIZE'],[21,'SLEEP']],   /* the midday meal on the bench */
  seller:[[0,'SLEEP'],[5,'EAT'],[6,'SELL'],[13,'EAT'],[14,'SELL'],[18,'SOCIALIZE'],[20,'EAT'],[21,'SLEEP']],
  priest:[[0,'SLEEP'],[5,'PRAY'],[8,'EAT'],[9,'PRAY'],[13,'EAT'],[14,'PRAY'],[20,'EAT'],[21,'SLEEP']],
  official:[[0,'SLEEP'],[6,'EAT'],[7,'COUNT'],[12,'EAT'],[13,'COUNT'],[17,'SOCIALIZE'],[20,'EAT'],[21,'SLEEP']],
  /* an ordinary day: an hour at the market (the first row's keepers, the shops) */
  home0:[[0,'SLEEP'],[6,'EAT'],[7,'WATER'],[8,'REST'],[11,'MARKET'],[12,'EAT'],[14,'REST'],[16,'SOCIALIZE'],[18,'PRAY'],[19,'EAT'],[20,'SLEEP']],
  home1:[[0,'SLEEP'],[7,'EAT'],[8,'REST'],[11,'SOCIALIZE'],[13,'EAT'],[15,'WATER'],[16,'MARKET'],[17,'REST'],[18,'EAT'],[19,'PRAY'],[20,'SLEEP']],
  /* the market day: down to the square for the morning (the boat in) or the afternoon, longer */
  mkt0:[[0,'SLEEP'],[6,'EAT'],[7,'WATER'],[8,'MARKET'],[12,'EAT'],[14,'REST'],[16,'SOCIALIZE'],[18,'PRAY'],[19,'EAT'],[20,'SLEEP']],
  mkt1:[[0,'SLEEP'],[7,'EAT'],[8,'REST'],[11,'SOCIALIZE'],[13,'EAT'],[14,'MARKET'],[18,'EAT'],[19,'PRAY'],[20,'SLEEP']],
  fair:[[0,'SLEEP'],[5,'EAT'],[6,'FAIR'],[19,'EAT'],[20,'SLEEP']]};
 const HOME={SLEEP:{pin:'home'},EAT:{pin:'home'},REST:{pin:'home'}};
 const R=(id,org,sched,prefers,extra)=>Object.assign({id,org,name:id,sched:sched||undefined,prefers:Object.assign({},HOME,prefers||{}),speed:1.1},extra||{});
 const md=XL_DAYS.marketDay(key),week=f=>Array.from({length:XL_DAYS.WEEK},(u,d)=>f(d,d===md,XL_DAYS.FAIR.indexOf(d)>=0));
 const HHP={PRAY:{kinds:['temple']},WATER:{kinds:['water']},MARKET:{kinds:['square']},SOCIALIZE:{kinds:['social','square','water']}};
 O.ROLES=[R('fisher','town',Sd.fisher,{FISH:{ids:['away:lake']},MEND:{kinds:['fishery']},SOCIALIZE:{kinds:['social','water']}}),
  R('porter','town',Sd.porter,{LOAD:{kinds:['quay']},SOCIALIZE:{kinds:['social','water']}}),
  R('worker','town',Sd.worker,{WORK:{kinds:['works','fishery']},SOCIALIZE:{kinds:['social','square']}}),
  R('farmer','town',Sd.farmer,{FARM:{kinds:['field','orchard']},SOCIALIZE:{kinds:['social','water']}}),
  R('seller.0','town',Sd.seller,{SELL:{kinds:['stall']},SOCIALIZE:{kinds:['social','square']}}),
  R('seller.1','town',null,Object.assign({SELL:{kinds:['stall']}},HHP),{scheds:{market:Sd.seller,home:Sd.home0},week:week((d,m)=>m?'market':'home')}),
  R('priest','temple',Sd.priest,{PRAY:{kinds:['temple']}}),
  R('official','sultan',Sd.official,{COUNT:{kinds:['governor']},SOCIALIZE:{kinds:['social','square']}})];
 for(const v of[0,1]){const h=v?Sd.home1:Sd.home0,m=v?Sd.mkt1:Sd.mkt0;
  O.ROLES.push(R('household.'+v,'town',null,HHP,{scheds:{home:h,market:m},week:week((d,mk)=>mk?'market':'home')}));
  O.ROLES.push(R('fairgoer.'+v,'town',null,Object.assign({FAIR:{ids:['away:fair']}},HHP),{scheds:{home:h,market:m,fair:Sd.fair},week:week((d,mk,f)=>f?'fair':mk?'market':'home')}));}
 const ACTS=['SLEEP','EAT','REST','FISH','FAIR','COUNT','FARM','WORK','MEND','LOAD','SELL','MARKET','SOCIALIZE','WATER','PRAY'];
 const INDOOR={SLEEP:1,EAT:1,REST:1,FISH:1,FAIR:1,COUNT:1};
 const NAME=(TU.name||key);
 O.world=()=>({activities:ACTS.map(id=>({id,indoor:!!INDOOR[id]})),
  factions:[{id:'xanadu',name:'The Xanadu Sultanate'}],
  orgs:[{id:'town',faction:'xanadu',name:'The town of '+NAME},{id:'temple',faction:'xanadu',name:'The temple of the Decree at '+NAME},
   {id:'sultan',faction:'xanadu',name:'The Sultan\'s governor at '+NAME}],
  roles:O.ROLES});
 // ---------------------------------------------------------------- 3. the walk graph
 O.graph=function(){if(O._g)return O._g;const nodes=[],edges=[],byId={},C=O.CELL,grid=new Map(),G=40,gk=(i,j)=>i+','+j;
  const node=(id,x,z,tag)=>{const n={id,x,y:gY(x,z),z,tag};nodes.push(n);byId[id]=n;const k=gk(Math.floor(x/G),Math.floor(z/G));(grid.get(k)||grid.set(k,[]).get(k)).push(n);return n;};
  const edge=(a,b,kind)=>{const A=byId[a],B=byId[b];edges.push({id:'e'+edges.length,a,b,kind,len:Math.hypot(A.x-B.x,A.y-B.y,A.z-B.z)});};
  const near=(x,z,r)=>{let bn=null,bd=r;const i0=Math.floor((x-r)/G),i1=Math.floor((x+r)/G),j0=Math.floor((z-r)/G),j1=Math.floor((z+r)/G);
   for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++)for(const q of grid.get(gk(i,j))||[]){if(q.tag!=='way')continue;const d=Math.hypot(q.x-x,q.z-z);if(d<bd){bd=d;bn=q;}}return bn;};
  T.ways.forEach((w,wi)=>{let prev=null,n=0,first=null;const pts=w.closed?w.pts.concat([w.pts[0]]):w.pts;
   for(let i=0;i+1<pts.length;i++){const a=pts[i],b=pts[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),m=Math.max(1,Math.round(L/C));
    for(let s=i?1:0;s<=m;s++){if(w.closed&&i===pts.length-2&&s===m){if(prev&&first)edge(prev,first,'road');break;}
     const u=s/m,id='w'+wi+'_'+(n++),q=node(id,a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,'way');q.way=wi;if(!first)first=id;if(prev)edge(prev,id,'road');prev=id;}}});
  {const seen=new Set();for(const q of nodes.slice()){const i0=Math.floor((q.x-7)/G),i1=Math.floor((q.x+7)/G),j0=Math.floor((q.z-7)/G),j1=Math.floor((q.z+7)/G);
   for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++)for(const o of grid.get(gk(i,j))||[]){if(o.way===q.way||Math.hypot(o.x-q.x,o.z-q.z)>=7)continue;
    const k=q.id<o.id?q.id+'|'+o.id:o.id+'|'+q.id;if(seen.has(k))continue;seen.add(k);edge(q.id,o.id,'road');}}}
  O.near=near;O._g={nodes,edges,byId,near,node,edge};return O._g;};
 /* a door or a field joined straight to its nearest way node (out to 400 m: the benches' fields lie off the stairs) */
 function doorNode(id,x,z){const G=O.graph(),w=G.near(x,z,400);const n=G.node('D:'+id,x,z,'door');if(w)G.edge(n.id,w.id,'path');else O.problems.push('no way near '+id);return n;}
 // ---------------------------------------------------------------- 4. the places
 const front=(p,out)=>{const d=D(p.d,8)/2+D(out,1.5);return[p.x+Math.sin(p.ry||0)*d,p.z+Math.cos(p.ry||0)*d];};
 const spotsAt=(x,z,ry,n,w)=>{const s=[],c=Math.cos(ry),sn=Math.sin(ry);for(let i=0;i<n;i++){const u=((i%4)+.5)/4-.5,v=Math.floor(i/4)*1.6+.8,lx=u*w,lz=v;
   s.push([x+lx*c+lz*sn,z-lx*sn+lz*c,gY(x+lx*c+lz*sn,z-lx*sn+lz*c)]);}return s;};
 /* the civic set and the works by key: what each is for (anything else in the works list is a works) */
 const CIVIC={xa_temple:['temple',{PRAY:60,SOCIALIZE:10}],xa_wayside_shrine:['temple',{PRAY:6}],xa_ghat:['water',{WATER:30,SOCIALIZE:20}],
  xa_quay:['quay',{LOAD:40,SOCIALIZE:8}],xa_boatshed:['fishery',{MEND:16,WORK:4}],xa_fish_racks:['fishery',{MEND:12,WORK:4}],xa_net_loft:['fishery',{MEND:16,WORK:8}],
  xa_teahouse:['social',{SOCIALIZE:30}],xa_bath:['social',{SOCIALIZE:24}],xa_caravanserai:['social',{SOCIALIZE:30,LOAD:10}],xa_rill_garden:['social',{SOCIALIZE:20}]};
 O.places=function(){if(O._places)return O._places;const out=O._places=[];   /* once: its doors join the graph */
  const add=(id,name,kind,x,z,acts,o)=>{const n=doorNode(id,x,z);out.push(Object.assign({id,name,kind,x,z,y:n.y,door:{x,y:n.y,z,node:n.id},activities:acts,tags:{plan:id}},o||{}));};
  const housed={};homes.forEach((p,hi)=>{housed[p.id]=O.housed[hi];});
  for(const p of T.place){if(p.ruin||p.water&&!CIVIC[p.key])continue;const [x,z]=front(p),ry=p.ry||0,nm=p.why||p.key;
   if(p.kind==='house'){const n=housed[p.id]||0;if(!n)continue;const shop=/shop/.test(p.key),acts={SLEEP:n,EAT:n,REST:n};if(shop)Object.assign(acts,{WORK:3});
    add('H:'+p.id,'A house of '+NAME,shop?'works':'house',x,z,acts,{indoor:{SLEEP:true,EAT:true,REST:true},spots:spotsAt(x,z,ry,8,6),wander:1});continue;}
   if(p.key==='xa_governor'){add('C:governor','The governor\'s house','governor',x,z,{SLEEP:8,EAT:8,REST:8,COUNT:12},{indoor:true});continue;}
   if(p.kind==='stall'){add('S:'+p.id,'A stall of the market','stall',x,z,{SELL:2},{spots:spotsAt(x,z,ry,2,3),wander:.6});continue;}
   if(p.kind==='orchard'){add('O:'+p.id,'An orchard','orchard',p.x,p.z,{FARM:10},{spots:spotsAt(p.x,p.z,ry,8,12),wander:4});continue;}
   const C=CIVIC[p.key];if(C){const n=Object.values(C[1]).reduce((a,b)=>a+b,0);
    if(p.key==='xa_ghat'||p.key==='xa_quay'){const qz=p.z+Math.cos(ry)*-2,qx=p.x+Math.sin(ry)*-2;   /* the stair's and the quay's spots on their own deck */
     add('C:'+p.id,p.key==='xa_ghat'?'The landing stair':'The quay',C[0],qx,qz,C[1],{spots:spotsAt(qx,qz,ry,Math.min(24,n),Math.min(16,D(p.w,12)*.6)),wander:1.4});}
    else add('C:'+p.id,nm,C[0],x,z,C[1],{spots:spotsAt(x,z,ry,Math.min(24,n),Math.min(16,D(p.w,12)*.6)),wander:1.4});continue;}
   if(p.kind==='work'||p.kind==='civic'){add('W:'+p.id,nm,'works',x,z,{WORK:40},{spots:spotsAt(x,z,ry,16,Math.min(16,D(p.w,12)*.6)),wander:1.6});}}
  // the market square (the plan's plaza): its crowd's spots inside its polygon
  /* a field holds its share of the terraces' crew (and a fifth over: the orchards take some) */
  const FARMN=Math.max(6,Math.ceil(D(O.byRole.farmer,0)*1.2/Math.max(1,T.fields.length)));
  let square=false;const MKT=Math.max(120,Math.round(people*.25));   /* the market day's crowd: a quarter of the town at once */
  for(const g of T.greens){if(g.kind!=='plaza'||square)continue;let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9;for(const q of g.poly){x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);z0=Math.min(z0,q[1]);z1=Math.max(z1,q[1]);}
   const sp=[];for(let i=0;i<12;i++)for(let j=0;j<8;j++){const sx=x0+(i+.5)*(x1-x0)/12,sz=z0+(j+.5)*(z1-z0)/8;if(xlInPoly([sx,sz],g.poly))sp.push([sx,sz,gY(sx,sz)]);}
   const c=xlPolyC(g.poly);if(sp.length){add('C:square','The market square','square',c[0],c[1],{MARKET:MKT,SOCIALIZE:60},{spots:sp,wander:1.8,r:30});square=true;}}
  /* a town whose plan has no plaza buys at the quay's head */
  {const q=T.place.find(p=>p.key==='xa_quay')||T.place.find(p=>p.key==='xa_ghat');if(!square&&q){const [x,z]=front(q,-D(q.d,8)-6);
   add('C:square','The market at the quay','square',x,z,{MARKET:MKT,SOCIALIZE:60},{spots:spotsAt(x,z,q.ry||0,24,20),wander:1.8,r:24});}}
  // the terraces' fields (each a band of a bench): four spots along its middle
  for(const f of T.fields){const c=xlPolyC(f.poly),sp=[];for(let i=0;i<4;i++){const q=f.poly[Math.floor((i+.5)*f.poly.length/8)]||c,x=(q[0]+c[0])/2,z=(q[1]+c[1])/2;sp.push([x,z,gY(x,z)]);}
   add('F:'+f.id,'A field of the terraces','field',c[0],c[1],{FARM:FARMN},{spots:sp,wander:6});}
  // off the ground: the lake (the dugouts out) at the landing stair; the fair (the loop's launch) at the quay
  const ghat=T.place.find(p=>p.key==='xa_ghat'),quay=T.place.find(p=>p.key==='xa_quay')||ghat;
  if(ghat&&fishing)add('away:lake','Out on the lake (the dugouts)','away',ghat.x,ghat.z,{FISH:500},{indoor:true});
  if(quay&&FAIR_TOWN)add('away:fair','Away at Phēr\'s fair (the launch)','away',quay.x,quay.z,{FAIR:900},{indoor:true});
  return out;};
 // ---------------------------------------------------------------- the declaration (once; the host's clock)
 /* the sim's day is the page's (89zn XL_DAYS.DAY) and the clock's days after it, so SIM.weekday is the town's weekday */
 O.init=function(clock){if(O.inited)return O;O.inited=true;const t0=Date.now();
  SIM.init({seed:SEED,hour:()=>clock.hour,day:()=>XL_DAYS.DAY+(clock.day||0),t:()=>clock.t,err:m=>O.problems.push(m)});
  SIM.lazy={pedestrian:{detour:1.25}};SIM.STEP_MAX=400;
  const places=O.places(),G=O.graph();
  SIM.nav.layer('pedestrian',{nodes:G.nodes,edges:G.edges,cost:{road:1,path:1.1},yWeight:4});
  O.loaded=SIM.load(O.world());
  for(const r of places)SIM.place(r);O.nPlaces=places.length;
  for(const p of O.PEOPLE)SIM.actor({id:p.id,role:p.role,home:p.home});
  SIM.REF={layer:'pedestrian',x:0,z:0};
  O.problems=O.problems.concat(SIM.check());O.ms=Date.now()-t0;O.nodes=G.nodes.length;O.edges=G.edges.length;return O;};
 return O;}
const XLL=XL_TOWN?xlPeople(XL_TOWN):null;
