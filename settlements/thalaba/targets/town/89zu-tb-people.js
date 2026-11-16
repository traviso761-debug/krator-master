// ================================================================= THALABA — the people's world as data for core/simulation (PLAN.md T5)
// [G data] core/simulation (SIM) is the vocabulary; this is Thalaba's declaration into it, in core/simulation/SCHEMA.md's order
// (settlements/longsong/src/40d-ls-sim.js and Voth's citizens are the worked examples):
//   1. the PEOPLE (TBL.PEOPLE): one record per resident, by household: every lot's house and the inns hold TB_PEOPLE[key]
//      (89zt), the Devisers' house its 40, the Two Horns' factor its 20, the Dalab mission its 30, the watch house the warden's
//      six. A town household's people take the plan's shares (section 2: the terrace farmers 720, the sulfur diggers 180, the
//      road 150, the trades 300, the Sultan's clerks, the faith 20; the rest households), each drawn by its rank in a hash of
//      (the town's seed, the household, the person) (core/rand: never by draw order), so a person keeps its job when the town grows
//   2. the ROLES and their SCHEDULES (TBL.ROLES): a day of hourly activities; the diggers and the road's men on a week of their
//      own (out to Salphar's diggings or down the Phēr road, back after), in two halves a few days apart
//   3. the NAVIGATION LAYER 'pedestrian' (TBL.graph): every way of the plan (89zt TB_WAYS: the three roads, the mule path, the
//      streets) resampled every 12 m, crossings stitched (nodes of two ways within 7 m), and every place's door and every field
//      joined straight to its nearest way node; lazy (SIM.lazy): a leg is the straight line until it is drawn
//   4. the PLACES (TBL.places): the houses (sleep, eat, rest: indoor), the civic buildings (the temple, the Devisers' house and
//      its yard, the Two Horns', the granaries, the smithies, the caravan yard and the pens, the inns, the baths), the square,
//      the tank and the springs (water), the gardens and orchards, the fields (the Siṭēps' terraces and the Bēnch's: farming),
//      the Dalab mission, the watch house; and two ways off the page: Salphar's diggings up the expedition road and the road
//      down to Phēr, where the men who walk out are AWAY (indoor: hidden on arrival)
// The expedition season (about 150 away each summer, mustered at Briḍj) is not here yet: KNOWN_ISSUES.md. No rule lives in the
// drawing: 90t-tb-life.js reads SIM.pose and draws. Declared once (TBL.init), on the first frame the host's clock is up.
const TBL=(function(){const O={inited:false,problems:[],CELL:12};
 const SEED=KRAND.child(TB.SEED,'people'),U=(a,b,c)=>KRAND.unit(KRAND.hash(SEED,a,b,c));
 // ---------------------------------------------------------------- 1. the people
 const SHARE=[['farmer',720],['digger',180],['muleteer',150],['artisan',300],['clerk',34],['priest',20]];   /* of 2,400 (PLAN.md section 2) */
 const homes=TB_PLACE.filter(p=>(p.kind==='house'||p.kind==='inn')&&tbD(TB_PEOPLE[p.key],0)>0);
 const P=[];homes.forEach((p,hi)=>{const n=TB_PEOPLE[p.key];for(let k=0;k<n;k++)P.push({id:'tb.'+hi+'.'+k,home:'H:'+p.id,hh:hi,k,rank:U(hi,k,1)});});
 {const T=P.length,order=P.slice().sort((a,b)=>a.rank-b.rank||(a.id<b.id?-1:1));let i=0;
  for(const [role,n] of SHARE){const m=Math.round(n*T/2400);for(let j=0;j<m&&i<T;j++,i++)order[i].role=role;}
  for(;i<T;i++)order[i].role='household';}
 const place=TB_PLACE.reduce((a,p)=>{(a[p.kind]=a[p.kind]||[]).push(p);return a;},{});
 const one=k=>(place[k]||[])[0]||null;
 const house=(kind,role,n,home,vary)=>{for(let k=0;k<n;k++)P.push({id:'tb.'+kind+'.'+k,role:vary?vary(k):role,home,hh:-1,k});};
 if(one('devisers'))house('devisers','deviser',TB_HOUSE.devisers,'C:devisers');
 if(one('horns'))house('horns','factor',TB_HOUSE.horns,'C:horns');
 if(TB_DALAB.length)house('dalab',null,TB_HOUSE.dalab,null,k=>k<12?'genepriest':'servant');
 for(const p of P)if(p.role==='genepriest')p.home='C:dalab_healers';else if(p.role==='servant')p.home='C:dalab_compound';
 if(one('warden'))house('warden',null,6,'C:warden',k=>k<3?'warden.day':'warden.night');
 // the two halves of the diggers and of the road's men: half out while half is home
 for(const p of P)if(p.role==='digger'||p.role==='muleteer')p.role+='.'+(U(p.hh,p.k,2)<.5?0:1);
 for(const p of P)if(p.role==='artisan'||p.role==='household')p.role+='.'+(U(p.hh,p.k,3)<.5?0:1);
 O.PEOPLE=P;
 // ---------------------------------------------------------------- 2. the roles and their schedules (SIM.sched spans: [hour, ACT])
 const S={
  farmer:[[0,'SLEEP'],[5,'EAT'],[6,'FARM'],[19,'EAT'],[20,'SOCIALIZE'],[21,'SLEEP']],   /* the midday meal in the field */
  artisan0:[[0,'SLEEP'],[6,'EAT'],[7,'WORK'],[18,'SOCIALIZE'],[20,'EAT'],[21,'SLEEP']],
  artisan1:[[0,'SLEEP'],[6,'EAT'],[7,'SELL'],[13,'WORK'],[18,'EAT'],[19,'SOCIALIZE'],[21,'SLEEP']],
  household0:[[0,'SLEEP'],[6,'EAT'],[7,'WATER'],[8,'REST'],[10,'MARKET'],[13,'EAT'],[14,'REST'],[16,'SOCIALIZE'],[18,'PRAY'],[19,'EAT'],[20,'SLEEP']],
  household1:[[0,'SLEEP'],[7,'EAT'],[8,'REST'],[11,'SOCIALIZE'],[13,'EAT'],[15,'WATER'],[16,'MARKET'],[18,'EAT'],[19,'PRAY'],[20,'SLEEP']],
  clerk:[[0,'SLEEP'],[6,'EAT'],[7,'COUNT'],[12,'MARKET'],[13,'COUNT'],[18,'SOCIALIZE'],[20,'EAT'],[21,'SLEEP']],
  priest:[[0,'SLEEP'],[5,'PRAY'],[8,'EAT'],[9,'PRAY'],[13,'EAT'],[14,'PRAY'],[20,'EAT'],[21,'SLEEP']],
  deviser:[[0,'SLEEP'],[6,'EAT'],[7,'OUTFIT'],[12,'EAT'],[13,'COUNT'],[18,'SOCIALIZE'],[20,'EAT'],[21,'SLEEP']],
  factor:[[0,'SLEEP'],[6,'EAT'],[7,'WORK'],[10,'SELL'],[14,'WORK'],[18,'SOCIALIZE'],[20,'EAT'],[21,'SLEEP']],
  genepriest:[[0,'SLEEP'],[6,'PRAY'],[7,'EAT'],[8,'HEAL'],[13,'EAT'],[14,'TEND'],[18,'HEAL'],[20,'EAT'],[21,'SLEEP']],
  servant:[[0,'SLEEP'],[5,'EAT'],[6,'WATER'],[7,'TEND'],[12,'EAT'],[13,'WORK'],[19,'EAT'],[20,'SLEEP']],
  wardenDay:[[0,'SLEEP'],[6,'EAT'],[7,'WATCH'],[19,'EAT'],[20,'SLEEP']],
  wardenNight:[[0,'WATCH'],[7,'EAT'],[8,'SLEEP'],[16,'EAT'],[17,'REST'],[19,'WATCH']],
  // the diggers: a day out up the expedition road to Salphar (20 km), three days there, a day back, two at home
  digGo:[[0,'SLEEP'],[4,'EAT'],[5,'AWAY']],dig:[[0,'AWAY']],digBack:[[0,'AWAY'],[13,'REST'],[18,'EAT'],[19,'SOCIALIZE'],[21,'SLEEP']],
  home:[[0,'SLEEP'],[7,'EAT'],[8,'REST'],[10,'MARKET'],[12,'EAT'],[13,'REST'],[17,'SOCIALIZE'],[20,'EAT'],[21,'SLEEP']],
  // the road's men: the caravan yard and the pens on yard days, a day down the Phēr road, a day there, a day back
  yard:[[0,'SLEEP'],[5,'EAT'],[6,'YARD'],[18,'SOCIALIZE'],[20,'EAT'],[21,'SLEEP']],
  roadGo:[[0,'SLEEP'],[4,'EAT'],[5,'AWAY']],road:[[0,'AWAY']],roadBack:[[0,'AWAY'],[15,'YARD'],[19,'EAT'],[20,'SLEEP']]};
 const HOME={SLEEP:{pin:'home'},EAT:{pin:'home'},REST:{pin:'home'}};
 const R=(id,org,sched,prefers,extra)=>Object.assign({id,org,name:id,sched:sched||undefined,prefers:Object.assign({},HOME,prefers||{}),speed:1.15},extra||{});
 const week=(a,off)=>Array.from({length:7},(u,d)=>a[(d+off)%7]);
 O.ROLES=[R('farmer','town',S.farmer,{FARM:{kinds:['field','orchard']}}),
  R('artisan.0','town',S.artisan0,{WORK:{kinds:['trade','shop']}}),R('artisan.1','town',S.artisan1,{SELL:{kinds:['square']},WORK:{kinds:['trade','shop']}}),
  R('household.0','town',S.household0,{PRAY:{kinds:['temple']},WATER:{kinds:['water']}}),R('household.1','town',S.household1,{PRAY:{kinds:['temple']},WATER:{kinds:['water']}}),
  R('clerk','sultan',S.clerk,{COUNT:{kinds:['devisers']}}),R('priest','town',S.priest,{PRAY:{kinds:['temple']}}),
  R('deviser','devisers',S.deviser,{OUTFIT:{kinds:['devisers-yard']},COUNT:{kinds:['devisers']}}),
  R('factor','horns',S.factor,{WORK:{kinds:['horns']},SELL:{kinds:['square']}}),
  R('genepriest','mission',S.genepriest,{HEAL:{kinds:['healers']},TEND:{kinds:['seed-stores']},PRAY:{kinds:['healers']}}),
  R('servant','mission',S.servant,{TEND:{kinds:['seed-stores']},WORK:{kinds:['mission']}}),
  R('warden.day','sultan',S.wardenDay,{WATCH:{kinds:['watch']}}),R('warden.night','sultan',S.wardenNight,{WATCH:{kinds:['watch']}})];
 for(const v of[0,1]){
  O.ROLES.push(R('digger.'+v,'town',null,{AWAY:{ids:['away:salphar']}},{scheds:{go:S.digGo,dig:S.dig,back:S.digBack,home:S.home},week:week(['go','dig','dig','dig','back','home','home'],v?3:0)}));
  O.ROLES.push(R('muleteer.'+v,'town',null,{AWAY:{ids:['away:pher']},YARD:{kinds:['yard']}},{scheds:{yard:S.yard,go:S.roadGo,road:S.road,back:S.roadBack},week:week(['yard','yard','go','road','back','yard','yard'],v?3:0)}));}
 const ACTS=['SLEEP','EAT','REST','AWAY','COUNT','HEAL','FARM','WORK','SELL','MARKET','SOCIALIZE','WATER','PRAY','OUTFIT','TEND','WATCH','YARD'];
 const INDOOR={SLEEP:1,EAT:1,REST:1,AWAY:1,COUNT:1,HEAL:1};
 O.world=()=>({activities:ACTS.map(id=>({id,indoor:!!INDOOR[id]})),
  factions:[{id:'xanadu',name:'The Xanadu Sultanate'},{id:'devisers',name:'The Rare Devisers'},{id:'dalab',name:'The Dalab'}],
  orgs:[{id:'town',faction:'xanadu',name:'The town of Thalaba'},{id:'sultan',faction:'xanadu',name:'The Sultan\'s people at Thalaba'},
   {id:'horns',faction:'xanadu',name:'The Two Horns\' factor'},{id:'devisers',faction:'devisers',name:'The Rare Devisers\' house at Thalaba'},
   {id:'mission',faction:'dalab',name:'The Dalab mission'}],
  roles:O.ROLES});
 // ---------------------------------------------------------------- 3. the walk graph
 const gY=(x,z)=>tbGround(x,z);
 O.graph=function(){if(O._g)return O._g;const nodes=[],edges=[],byId={},C=O.CELL,grid=new Map(),G=40,key=(x,z)=>Math.floor(x/G)+','+Math.floor(z/G);
  const node=(id,x,z,tag)=>{const n={id,x,y:gY(x,z),z,tag};nodes.push(n);byId[id]=n;const k=key(x,z);(grid.get(k)||grid.set(k,[]).get(k)).push(n);return n;};
  const edge=(a,b,kind)=>{const A=byId[a],B=byId[b];edges.push({id:'e'+edges.length,a,b,kind,len:Math.hypot(A.x-B.x,A.y-B.y,A.z-B.z)});};
  const near=(x,z,r,not)=>{let bn=null,bd=r;const i0=Math.floor((x-r)/G),i1=Math.floor((x+r)/G),j0=Math.floor((z-r)/G),j1=Math.floor((z+r)/G);
   for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++)for(const q of grid.get(i+','+j)||[]){if(q.tag!=='way'||(not!=null&&q.way===not))continue;const d=Math.hypot(q.x-x,q.z-z);if(d<bd){bd=d;bn=q;}}return bn;};
  TB_WAYS.forEach((w,wi)=>{let prev=null,n=0;
   for(let i=0;i+1<w.pts.length;i++){const a=w.pts[i],b=w.pts[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),m=Math.max(1,Math.round(L/C));
    for(let s=i?1:0;s<=m;s++){const u=s/m,id='w'+wi+'_'+(n++),q=node(id,a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,'way');q.way=wi;if(prev)edge(prev,id,'road');prev=id;}}});
  // the crossings: every node of one way joined to each node of another way within 7 m (once a pair)
  {const seen=new Set();for(const q of nodes.slice()){const i0=Math.floor((q.x-7)/G),i1=Math.floor((q.x+7)/G),j0=Math.floor((q.z-7)/G),j1=Math.floor((q.z+7)/G);
   for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++)for(const o of grid.get(i+','+j)||[]){if(o.way===q.way||Math.hypot(o.x-q.x,o.z-q.z)>=7)continue;
    const k=q.id<o.id?q.id+'|'+o.id:o.id+'|'+q.id;if(seen.has(k))continue;seen.add(k);edge(q.id,o.id,'road');}}}
  O.near=near;O._g={nodes,edges,byId,near,node,edge};return O._g;};
 // a door or a field joined straight to its nearest way node (out to 600 m: the fields lie at least 80 m off the roads)
 function doorNode(id,x,z){const G=O.graph(),w=G.near(x,z,600);const n=G.node('D:'+id,x,z,'door');if(w)G.edge(n.id,w.id,'path');else O.problems.push('no way near '+id);return n;}
 // ---------------------------------------------------------------- 4. the places
 const front=(p,D,out)=>{const d=(D.fd||D.d)/2+tbD(out,1.5);return[p.x+Math.sin(p.ry||0)*d,p.z+Math.cos(p.ry||0)*d];};
 const spotsAt=(x,z,ry,n,w,dep)=>{const s=[];for(let i=0;i<n;i++){const u=((i%4)+.5)/4-.5,v=Math.floor(i/4)*1.6+.8,c=Math.cos(ry),sn=Math.sin(ry);
   const lx=u*w,lz=v;s.push([x+lx*c+lz*sn,z-lx*sn+lz*c,gY(x+lx*c+lz*sn,z-lx*sn+lz*c)]);}return s;};
 O.places=function(){const out=[];
  const add=(id,name,kind,x,z,acts,o)=>{const n=doorNode(id,x,z);out.push(Object.assign({id,name,kind,x,z,y:n.y,door:{x,y:n.y,z,node:n.id},activities:acts,tags:{plan:id}},o||{}));};
  const KIND={house:'house',inn:'inn',temple:'temple',bath:'bath',devisers:'devisers',horns:'horns',granary:'trade',yard:'yard',stables:'yard',tank:'water',
   garden:'garden',orchard:'orchard',warden:'watch'};
  for(const p of TB_PLACE){const D=VERN.defs[p.key];if(!D)continue;const [x,z]=front(p,D),ry=p.ry||0,nm=p.name||D.name;
   if(p.kind==='house'||p.kind==='inn'){const n=tbD(TB_PEOPLE[p.key],0);if(!n)continue;
    const trade=/shop|workshop|smithy/.test(p.key),acts={SLEEP:n,EAT:n,REST:n};if(trade)Object.assign(acts,{WORK:3,SELL:2});if(p.kind==='inn')Object.assign(acts,{SOCIALIZE:14});
    add('H:'+p.id,nm,trade?'shop':p.kind==='inn'?'inn':'house',x,z,acts,{indoor:{SLEEP:true,EAT:true,REST:true},spots:spotsAt(x,z,ry,8,6),wander:1});continue;}
   const id='C:'+(p.kind==='dalab'?p.key:p.kind==='warden'?'warden':p.kind==='devisers'||p.kind==='horns'?p.kind:p.id);
   if(p.kind==='devisers'){add(id,nm,'devisers',x,z,{SLEEP:TB_HOUSE.devisers,EAT:TB_HOUSE.devisers,REST:TB_HOUSE.devisers,COUNT:40},{indoor:true});
    // the outfitting yard inside its gate: the yard's own spots (the house's frame: the yard is z -4 .. 16 before the hall)
    const ys=[];for(let i=0;i<30;i++){const lx=-14+(i%6)*5.6,lz=-2+Math.floor(i/6)*3.6,c=Math.cos(ry),s=Math.sin(ry);ys.push([p.x+lx*c+lz*s,p.z-lx*s+lz*c,gY(p.x+lx*c+lz*s,p.z-lx*s+lz*c)]);}
    add('C:devisers-yard','The Rare Devisers\' outfitting yard','devisers-yard',x,z,{OUTFIT:30},{spots:ys,wander:1.4});continue;}
   if(p.kind==='horns'){if(p.key==='xa_warehouse')add('C:horns-store','The Two Horns\' warehouse','horns',x,z,{WORK:12},{spots:spotsAt(x,z,ry,12,10),wander:1.2});
    else add(id,nm,'horns',x,z,{SLEEP:TB_HOUSE.horns,EAT:TB_HOUSE.horns,REST:TB_HOUSE.horns,WORK:8},{indoor:{SLEEP:true,EAT:true,REST:true},spots:spotsAt(x,z,ry,8,8)});continue;}
   if(p.kind==='dalab'){if(p.key==='dalab_healers')add(id,nm,'healers',x,z,{SLEEP:12,EAT:12,REST:12,HEAL:20,PRAY:12},{indoor:{SLEEP:true,EAT:true,REST:true,HEAL:true},spots:spotsAt(x,z,ry,12,10)});
    else if(p.key==='dalab_granaries')add(id,nm,'seed-stores',x,z,{TEND:16},{spots:spotsAt(x,z,ry,16,12),wander:1.4});
    else add(id,nm,'mission',x,z,{SLEEP:18,EAT:18,REST:18,WORK:10},{indoor:{SLEEP:true,EAT:true,REST:true},spots:spotsAt(x,z,ry,10,10)});continue;}
   if(p.kind==='warden'){add(id,nm,'watch',x,z,{SLEEP:6,EAT:6,REST:6,WATCH:3},{indoor:{SLEEP:true,EAT:true,REST:true},spots:spotsAt(x,z,ry,3,4),wander:2});continue;}
   const k=KIND[p.kind];if(!k)continue;
   const acts=k==='temple'?{PRAY:80}:k==='bath'?{SOCIALIZE:20}:k==='trade'?{WORK:6}:k==='yard'?{YARD:p.kind==='yard'?60:16}:k==='water'?{WATER:20,SOCIALIZE:16}:
    k==='garden'?{SOCIALIZE:20}:k==='orchard'?{FARM:10,SOCIALIZE:8}:{};
   const n=Object.values(acts).reduce((a,b)=>a+b,0);
   add(id,nm,k,x,z,acts,{spots:spotsAt(x,z,ry,Math.min(24,n),Math.min(16,D.w*.6)),wander:1.4});}
  // the square: the market's stalls and its crowd
  {const Q=TB_SQUARE,sp=[];for(let i=0;i<10;i++)for(let j=0;j<8;j++){const x=Q.x0+8+i*(Q.x1-Q.x0-16)/9,z=Q.z0+6+j*(Q.z1-Q.z0-12)/7;sp.push([x,z,gY(x,z)]);}
   add('C:square','The market square','square',0,0,{MARKET:160,SELL:50,SOCIALIZE:80},{spots:sp,wander:1.8,r:40});}
  // the springs at the riser's foot
  for(const s of TB_SPRINGS)add('C:'+s.id,'The '+s.id,'water',s.x,s.z+6,{WATER:6},{spots:spotsAt(s.x,s.z+6,0,6,5),wander:1});
  // the fields in crop: the Siṭēps' terraces and the Bēnch's tilled and cropped fields (fallow and meadow left out)
  // (a field more than 600 m from every way is left to the farmsteads of the region's ring, not walked to from the town)
  for(const f of TB_FIELDS){if(!/^(terrace|tilled|crop)$/.test(f.kind))continue;const [x0,z0,x1,z1]=f.box,cx=(x0+x1)/2,cz=(z0+z1)/2,sp=[];
   if(!O.graph().near(cx,cz,600))continue;
   for(let i=0;i<4;i++){const x=x0+(x1-x0)*(i+.5)/4;sp.push([x,cz,gY(x,cz)]);}
   add('F:'+f.id,f.kind==='terrace'?'A terrace of the Siṭēps':'A field of the Bēnch','field',cx,cz,{FARM:4},{spots:sp,wander:6});}
  // off the page: Salphar's diggings, up the expedition road past Briḍj; the road down to Phēr
  const ex=TB_EXPED[TB_EXPED.length-1],ph=TB_WAYS.find(w=>w.id==='pher').pts[0];
  add('away:salphar','Salphar\'s diggings (up the gorge)','away',ex[0],ex[1],{AWAY:400},{indoor:true});
  add('away:pher','The road down to Phēr','away',ph[0],ph[1],{AWAY:300},{indoor:true});
  return out;};
 // ---------------------------------------------------------------- the declaration (once; the host's clock)
 O.init=function(clock){if(O.inited)return O;O.inited=true;const t0=Date.now();
  SIM.init({seed:SEED,hour:()=>clock.hour,day:()=>clock.day||0,t:()=>clock.t,err:m=>O.problems.push(m)});
  SIM.lazy={pedestrian:{detour:1.25}};SIM.STEP_MAX=400;
  const places=O.places(),G=O.graph();
  SIM.nav.layer('pedestrian',{nodes:G.nodes,edges:G.edges,cost:{road:1,path:1.1},yWeight:4});
  O.loaded=SIM.load(O.world());
  for(const r of places)SIM.place(r);O.nPlaces=places.length;
  for(const p of O.PEOPLE)SIM.actor({id:p.id,role:p.role,home:p.home});
  SIM.REF={layer:'pedestrian',x:0,z:0};
  O.problems=O.problems.concat(SIM.check());O.ms=Date.now()-t0;O.nodes=G.nodes.length;O.edges=G.edges.length;return O;};
 return O;})();
