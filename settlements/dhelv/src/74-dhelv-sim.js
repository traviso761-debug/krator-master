// prefix: dhs
// ================================================================= DHELV: THE RAMBLERS' WORLD, AS DATA (kits/zeijani/PLAN.md 8.2; P6). [G data]
// core/simulation (SIM) is the vocabulary; this is Dhelv's declaration into it, in the order its SCHEMA.md gives:
//   1. the host binding: the life layer's clock (DHL.clock, 95-dhelv-life.js) gives SIM its hour, day and motion time
//   2. the NAVIGATION LAYERS on the nav graph (72-dhelv-nav.js): 'pedestrian' (every way but the scouts' secret ones),
//      'outer' (the outer zone only: the foreign traders keep to it), 'scout' (every way). The rolling stone door closes
//      at night (DHS.DOOR_SHUT): its passage then costs Infinity, and the routes cached are dropped (DHS.doors)
//   3. the PLACES, from what was built: each door's site by its key, the activities it offers and their slots; every
//      place's door carries its nav node, so a route starts and ends on the right level (SIM's own lookup is by plan)
//   4. the records a world/*.json would hold (activities, factions, orgs, roles), through SIM.load
//   5. the POPULATION from the roles' counts and home kinds (SIM.populate); then SIM.check and SIM.REF.
// No rule lives in the drawing (95-dhelv-life.js reads SIM and draws). Declared once, after the world (DHS.init).
const DHS={inited:false,DOOR_SHUT:[22,5],doorShut:null,places:0,pop:null,problems:[]};
/* what each kit def offers: [kind, {ACT: slots}, opts]; a home's slots are its people (?pop= scales them) */
DHS.KINDS={
 zj_rowhouse:['home',{SLEEP:10,EAT:10,REST:10}],zj_house_built_mid:['home',{SLEEP:8,EAT:8,REST:8}],zj_house_built_rich:['home_rich',{SLEEP:10,EAT:10,REST:10}],
 zj_estate_a:['home_rich',{SLEEP:30,EAT:30,REST:30}],zj_estate_b:['home_rich',{SLEEP:30,EAT:30,REST:30}],zj_gallery_a:['home',{SLEEP:60,EAT:60,REST:60}],zj_gallery_b:['home',{SLEEP:40,EAT:40,REST:40}],
 zj_hut_a:['home_out',{SLEEP:5,EAT:5,REST:5}],zj_hut_b:['home_out',{SLEEP:5,EAT:5,REST:5}],zj_hut_c:['home_out',{SLEEP:5,EAT:5,REST:5}],zj_house_wood:['home_out',{SLEEP:6,EAT:6,REST:6}],
 zj_farmhouse_wood:['home_out',{SLEEP:6,EAT:6,REST:6,FARM:4}],
 zj_barracks_carved:['barracks',{SLEEP:30,EAT:30,REST:30}],zj_barracks_outpost:['barracks',{SLEEP:20,EAT:20,REST:20}],zj_scout_hq:['scouthq',{SLEEP:12,EAT:12,REST:12,SCOUT:6}],
 zj_guard_hq:['post',{GUARD:6}],zj_muster:['post',{PATROL:20,GUARD:4}],zj_stonedoor:['gatepost',{GUARD:4}],zj_gate:['post_outer',{GUARD:4}],zj_portal:['post_outer',{GUARD:4}],zj_watchtower:['post_outer',{GUARD:2}],
 zj_tavern_built:['tavern',{DRINK:30,EAT:20,SOCIALIZE:20,KEEP_INN:2},{open:[11,24]}],zj_tavern_carved:['tavern',{DRINK:24,EAT:16,SOCIALIZE:16,KEEP_INN:2},{open:[11,24]}],
 zj_inn_carved:['inn',{LODGE:12,EAT:12,DRINK:16,KEEP_INN:2}],zj_brewery:['brewery',{BREW:6,DRINK:10}],zj_lab:['lab',{ALCHEMY:4}],zj_smithy:['smithy',{CRAFT:4}],
 zj_granary:['store',{STORE:4,DELIVER:8}],zj_store_tunnel:['store',{STORE:4,DELIVER:10}],
 zj_farm_yam:['field',{FARM:8,DELIVER:6}],zj_farm_veg:['field',{FARM:8,DELIVER:6}],zj_farm_alecap:['alecap',{FARM:8,DELIVER:6}],
 zj_temple:['temple',{WORSHIP:60,PRIEST:3}],zj_kiva:['kiva',{WORSHIP:20,PRIEST:1}],zj_niche:['shrine',{WORSHIP:6}],zj_shrine:['shrine',{WORSHIP:8}],zj_catacomb:['catacomb',{MOURN:30,KEEP_DEAD:2}],
 zj_council:['council',{RULE:12}],zj_cistern:['cistern',{FETCH_WATER:30}],zj_fountain:['fountain',{FETCH_WATER:6,SOCIALIZE:6},{out:true}],zj_park:['park',{SOCIALIZE:60,PLAY:30},{out:true}],
 zj_market_hall:['market',{KEEP_SHOP:6,BUY:30,TRADE:8,SOCIALIZE:10},{open:[7,20]}],zj_stall_b:['stall',{KEEP_SHOP:1,BUY:4},{open:[7,20],out:true}],zj_stall_a:['stall_outer',{KEEP_SHOP:1,BUY:4,TRADE:4},{open:[7,20],out:true}],
 zj_caravanserai:['caravanserai',{SLEEP:24,EAT:24,REST:24,LODGE:24,TRADE:24,DRINK:24,SOCIALIZE:30}],
 zj_shop_stonecutter_carved:['quarry',{CUT_STONE:6,KEEP_SHOP:1,BUY:4},{open:[7,20]}]};
/* every other shop: a counter and its customers */
DHS.kindOf=function(key){if(DHS.KINDS[key])return DHS.KINDS[key];if(/^zj_shop_/.test(key))return ['shop',{KEEP_SHOP:2,BUY:8},{open:[7,20]}];return null;};
/* the roles (PLAN.md 8.2's proposal): an hourly schedule as spans, how many, where they live and work */
DHS.WORLD={
 activities:['ALCHEMY','BREW','BUY','CRAFT','CUT_STONE','DELIVER','DRINK','EAT','FARM','FETCH_WATER','FORAGE','GUARD','HERD','IDLE','KEEP_DEAD','KEEP_INN','KEEP_SHOP','LODGE','MOURN','PATROL','PLAY','PRIEST','REST','RULE','SCOUT','SLEEP','SOCIALIZE','STORE','TRADE','WORSHIP']
  .map(id=>/^(SLEEP|REST|LODGE|ALCHEMY|BREW|CRAFT|KEEP_INN|STORE|RULE|EAT|KEEP_DEAD|PRIEST)$/.test(id)?{id,indoor:true}:{id}),
 factions:[{id:'zeijani',name:'The Zeijani'},{id:'ashnomads',name:'The ash nomads'}],
 orgs:[{id:'households',faction:'zeijani',name:'The households of Dhelv'},{id:'guard',faction:'zeijani',name:'The city guard'},{id:'scouts',faction:'zeijani',name:'The Scouts'},
  {id:'brewers',faction:'zeijani',name:'The Brewers'},{id:'alchemists',faction:'zeijani',name:'The Alchemists'},{id:'stonecutters',faction:'zeijani',name:'The Stonecutters'},
  {id:'keepers',faction:'zeijani',name:'The Keepers of the Dead'},{id:'outpost',faction:'zeijani',name:'The outpost\'s foragers and herders'},
  {id:'caravans',faction:'ashnomads',name:'An ash-nomad caravan',resident:false}],
 relations:[{a:'zeijani',b:'ashnomads',stance:'cordial',trade:true}],
 /* the groups that try the hard routes (PLAN.md 8.2): each fires from an entry, walks its stops together and goes back */
 events:[
  {id:'patrol',name:'A scout patrol to a secret exit',kind:'patrol',org:'scouts',every:[3,5],window:[6,21],from:['scouthq'],size:[1,1],unit:[{role:'scout',n:4}],legs:[{activity:'SCOUT',mins:15,kinds:['secret_exit']}],layer:'scout',speed:1.35,maxLive:1,spread:0},
  {id:'funeral_s1',name:'A funeral from the west well',kind:'funeral',org:'keepers',every:[10,20],window:[9,15],from:['kiva_s1'],size:[1,1],unit:[{role:'mourner',n:8},{role:'keeper',n:1}],legs:[{activity:'MOURN',mins:30,kinds:['catacomb']}],layer:'pedestrian',speed:.9,maxLive:1,spread:0},
  {id:'funeral_s2',name:'A funeral from the south well',kind:'funeral',org:'keepers',every:[10,20],window:[9,15],from:['kiva_s2'],size:[1,1],unit:[{role:'mourner',n:8},{role:'keeper',n:1}],legs:[{activity:'MOURN',mins:30,kinds:['catacomb']}],layer:'pedestrian',speed:.9,maxLive:1,spread:0},
  {id:'funeral_s3',name:'A funeral from the east well',kind:'funeral',org:'keepers',every:[10,20],window:[9,15],from:['kiva_s3'],size:[1,1],unit:[{role:'mourner',n:8},{role:'keeper',n:1}],legs:[{activity:'MOURN',mins:30,kinds:['catacomb']}],layer:'pedestrian',speed:.9,maxLive:1,spread:0},
  {id:'porters_s1',name:'Porters from the stores of the west well',kind:'porters',org:'households',every:[2,4],window:[7,18],from:['stores_s1'],size:[1,1],unit:[{role:'labourer',n:3}],legs:[{activity:'DELIVER',mins:10,kinds:['field','alecap']}],layer:'pedestrian',speed:1.1,maxLive:1,spread:0},
  {id:'porters_s2',name:'Porters from the stores of the south well',kind:'porters',org:'households',every:[2,4],window:[7,18],from:['stores_s2'],size:[1,1],unit:[{role:'labourer',n:3}],legs:[{activity:'DELIVER',mins:10,kinds:['field','alecap']}],layer:'pedestrian',speed:1.1,maxLive:1,spread:0},
  {id:'porters_s3',name:'Porters from the stores of the east well',kind:'porters',org:'households',every:[2,4],window:[7,18],from:['stores_s3'],size:[1,1],unit:[{role:'labourer',n:3}],legs:[{activity:'DELIVER',mins:10,kinds:['field','alecap']}],layer:'pedestrian',speed:1.1,maxLive:1,spread:0},
  {id:'guardchange',name:'The guard changing at the stone door',kind:'guardchange',org:'guard',every:[4,4],window:[5,22],from:['barracks'],size:[1,1],unit:[{role:'guard',n:4}],legs:[{activity:'GUARD',mins:10,kinds:['gatepost']}],layer:'guard',speed:1.3,maxLive:1,spread:0},
  {id:'children',name:'Children wandering the square',kind:'children',org:'households',every:[2,3],window:[9,17],from:['park'],size:[1,1],unit:[{role:'child',n:5}],legs:[{activity:'FETCH_WATER',mins:10,kinds:['fountain']},{activity:'WORSHIP',mins:5,kinds:['shrine']},{activity:'BUY',mins:15,kinds:['market','stall']}],layer:'pedestrian',speed:1.4,maxLive:2,spread:0}],
 roles:[
  {id:'brewer',org:'brewers',count:20,homes:['home'],work:{kinds:['brewery'],act:'BREW'},sched:[[0,'SLEEP'],[6,'EAT'],[7,'BREW'],[12,'EAT'],[13,'BREW'],[18,'DRINK'],[22,'SLEEP']],prefers:{SLEEP:{pin:'home'},EAT:{pin:'home'},BREW:{pin:'work'}}},
  {id:'alecap_farmer',org:'households',count:50,homes:['home'],sched:[[0,'SLEEP'],[5,'EAT'],[6,'FARM'],[12,'EAT'],[13,'FARM'],[18,'SOCIALIZE'],[21,'SLEEP']],prefers:{SLEEP:{pin:'home'},EAT:{pin:'home'},FARM:{kinds:['alecap']}}},
  {id:'yam_farmer',org:'households',count:50,homes:['home'],sched:[[0,'SLEEP'],[5,'EAT'],[6,'FARM'],[12,'EAT'],[13,'FARM'],[18,'SOCIALIZE'],[21,'SLEEP']],prefers:{SLEEP:{pin:'home'},EAT:{pin:'home'},FARM:{kinds:['field']}}},
  {id:'forager',org:'outpost',count:10,homes:['home_out'],work:{kinds:['forest'],act:'FORAGE'},sched:[[0,'SLEEP'],[5,'EAT'],[6,'FORAGE'],[12,'EAT'],[13,'FORAGE'],[18,'SOCIALIZE'],[21,'SLEEP']],prefers:{SLEEP:{pin:'home'},EAT:{pin:'home'},FORAGE:{pin:'work'}}},
  {id:'herder',org:'outpost',count:8,homes:['home_out'],work:{kinds:['pasture'],act:'HERD'},sched:[[0,'SLEEP'],[5,'HERD'],[12,'EAT'],[13,'HERD'],[19,'EAT'],[21,'SLEEP']],prefers:{SLEEP:{pin:'home'},EAT:{pin:'home'},HERD:{pin:'work'}}},
  {id:'stonecutter',org:'stonecutters',count:20,homes:['home'],work:{kinds:['quarry'],act:'CUT_STONE'},sched:[[0,'SLEEP'],[6,'EAT'],[7,'CUT_STONE'],[12,'EAT'],[13,'CUT_STONE'],[18,'DRINK'],[22,'SLEEP']],prefers:{SLEEP:{pin:'home'},CUT_STONE:{pin:'work'}}},
  {id:'smith',org:'households',count:12,homes:['home'],work:{kinds:['smithy'],act:'CRAFT'},sched:[[0,'SLEEP'],[6,'EAT'],[7,'CRAFT'],[12,'EAT'],[13,'CRAFT'],[18,'DRINK'],[22,'SLEEP']],prefers:{SLEEP:{pin:'home'},EAT:{pin:'home'},CRAFT:{pin:'work'}}},
  {id:'alchemist',org:'alchemists',count:4,homes:['home_rich','home'],work:{kinds:['lab'],act:'ALCHEMY'},sched:[[0,'SLEEP'],[7,'EAT'],[8,'ALCHEMY'],[13,'EAT'],[14,'ALCHEMY'],[20,'SOCIALIZE'],[23,'SLEEP']],prefers:{SLEEP:{pin:'home'},EAT:{pin:'home'},ALCHEMY:{pin:'work'}}},
  {id:'shopkeeper',org:'households',count:30,homes:['home'],work:{kinds:['shop','stall','market'],act:'KEEP_SHOP'},sched:[[0,'SLEEP'],[6,'EAT'],[7,'KEEP_SHOP'],[13,'EAT'],[14,'KEEP_SHOP'],[20,'SOCIALIZE'],[22,'SLEEP']],prefers:{SLEEP:{pin:'home'},EAT:{pin:'home'},KEEP_SHOP:{pin:'work'}}},
  {id:'innkeeper',org:'households',count:8,homes:['home'],work:{kinds:['tavern','inn'],act:'KEEP_INN'},sched:[[0,'SLEEP'],[9,'EAT'],[10,'KEEP_INN'],[23,'SLEEP']],prefers:{SLEEP:{pin:'home'},EAT:{pin:'home'},KEEP_INN:{pin:'work'}}},
  {id:'guard',org:'guard',count:44,homes:['barracks'],layer:'guard',sched:[[0,'SLEEP'],[6,'EAT'],[7,'GUARD'],[12,'EAT'],[13,'PATROL'],[17,'GUARD'],[21,'EAT'],[22,'SLEEP']],prefers:{SLEEP:{pin:'home'},EAT:{pin:'home'},GUARD:{kinds:['post','post_outer','gatepost']},PATROL:{kinds:['post']}},
   variants:[[[0,'GUARD'],[6,'SLEEP'],[14,'EAT'],[15,'PATROL'],[19,'SOCIALIZE'],[21,'GUARD']]]},
  {id:'scout',org:'scouts',count:12,homes:['scouthq'],sched:[[0,'SLEEP'],[6,'EAT'],[7,'SCOUT'],[12,'EAT'],[13,'SCOUT'],[19,'DRINK'],[22,'SLEEP']],prefers:{SLEEP:{pin:'home'},EAT:{pin:'home'},SCOUT:{pin:'home'}},layer:'scout'},
  {id:'keeper',org:'keepers',count:2,homes:['home'],work:{kinds:['catacomb'],act:'KEEP_DEAD'},sched:[[0,'SLEEP'],[6,'KEEP_DEAD'],[12,'EAT'],[13,'KEEP_DEAD'],[20,'REST'],[22,'SLEEP']],prefers:{SLEEP:{pin:'home'},KEEP_DEAD:{pin:'work'}}},
  {id:'priest',org:'households',count:6,homes:['home_rich','home'],work:{kinds:['temple','kiva'],act:'PRIEST'},sched:[[0,'SLEEP'],[5,'PRIEST'],[11,'EAT'],[12,'PRIEST'],[19,'EAT'],[20,'PRIEST'],[22,'SLEEP']],prefers:{SLEEP:{pin:'home'},EAT:{pin:'home'},PRIEST:{pin:'work'}}},
  {id:'child',org:'households',count:110,homes:['home','home_rich','home_out'],speed:1.5,sched:[[0,'SLEEP'],[7,'EAT'],[8,'PLAY'],[12,'EAT'],[13,'PLAY'],[17,'FETCH_WATER'],[18,'EAT'],[19,'SLEEP']],prefers:{SLEEP:{pin:'home'},EAT:{pin:'home'},PLAY:{kinds:['park']}}},
  {id:'elder',org:'households',count:50,homes:['home','home_rich'],speed:.95,sched:[[0,'SLEEP'],[7,'EAT'],[8,'WORSHIP'],[10,'SOCIALIZE'],[12,'EAT'],[13,'REST'],[15,'SOCIALIZE'],[18,'EAT'],[20,'SLEEP']],prefers:{SLEEP:{pin:'home'},EAT:{pin:'home'},REST:{pin:'home'}}},
  {id:'mourner',org:'households',count:8,homes:['home'],sched:[[0,'SLEEP'],[7,'EAT'],[9,'MOURN'],[12,'EAT'],[13,'WORSHIP'],[17,'SOCIALIZE'],[21,'SLEEP']],prefers:{SLEEP:{pin:'home'},EAT:{pin:'home'}}},
  {id:'labourer',org:'households',fill:true,homes:['home','home_out'],sched:[[0,'SLEEP'],[6,'EAT'],[7,'DELIVER'],[12,'EAT'],[13,'DELIVER'],[17,'FETCH_WATER'],[18,'DRINK'],[21,'SLEEP']],prefers:{SLEEP:{pin:'home'},EAT:{pin:'home'},DRINK:{kinds:['tavern']}}},
  {id:'trader',org:'caravans',count:20,homes:['caravanserai'],layer:'outer',sched:[[0,'SLEEP'],[7,'EAT'],[8,'TRADE'],[12,'EAT'],[13,'TRADE'],[19,'DRINK'],[22,'SLEEP']],
   prefers:{SLEEP:{pin:'home'},EAT:{pin:'home'},DRINK:{pin:'home'},TRADE:{kinds:['caravanserai','stall_outer']}},fallback:{BUY:'TRADE',SOCIALIZE:'TRADE'}}]};
/* the declaration (once, after the world and its nav graph) */
DHS.init=function(clock,o){if(DHS.inited)return DHS;DHS.inited=true;o=o||{};const t0=Date.now(),B=DHN.get(),k=o.pop?Math.max(.1,o.pop):1;   /* o.pop scales the homes' people (95: ?pop=) */
 SIM.init({seed:20261007,hour:()=>clock.hour,day:()=>clock.day,t:()=>clock.t,err:m=>DHS.problems.push(m)});
 /* 2. the layers */
 SIM.nav.layer('pedestrian',{nodes:B.nodes,edges:B.edges.filter(e=>e.zone!=='secret'),cost:{stair:1.4,ramp:1.15,landing:1,floor:1}});
 SIM.nav.layer('outer',{nodes:B.nodes,edges:B.edges.filter(e=>e.zone==='outer'),cost:{stair:1.4}});
 /* the guard and the scouts pass the stone door when it is shut (it is theirs): their layers walk copies of the edges */
 SIM.nav.layer('guard',{nodes:B.nodes,edges:B.edges.filter(e=>e.zone!=='secret').map(e=>Object.assign({},e)),cost:{stair:1.4,ramp:1.15}});
 SIM.nav.layer('scout',{nodes:B.nodes,edges:B.edges.map(e=>Object.assign({},e)),cost:{stair:1.4,secret:.8}});
 DHS.doorEdges=B.edges.filter(e=>e.kind==='door'&&e.layout);   /* the stone door's passage */
 /* 3. the places */
 const at=n=>({x:n.x,y:n.y,z:n.z,node:n.id});let i=0;
 for(const d of B.doors){if(!d.node)continue;const K=DHS.kindOf(d.key);if(!K)continue;const n=B.byId[d.node],o=K[2]||{},acts={};
  for(const a in K[1])acts[a]=/^(SLEEP|EAT|REST)$/.test(a)&&/^home/.test(K[0])?Math.max(1,Math.round(K[1][a]*k)):K[1][a];
  const S=DH.SITES.find(s=>Math.abs(s.x-d.rec.x)<.01&&Math.abs(s.z-d.rec.z)<.01),kind=K[0]==='home'&&S&&S.district==='outpost'?'home_out':K[0];   /* the outpost's own homes: its folk live there */
  SIM.place({id:kind+'_'+(i++),name:d.rec.name||d.key,kind,x:n.x,y:n.y,z:n.z,ry:d.rec.ry,door:at(n),activities:acts,open:o.open,indoor:o.out?{}:true,
   wander:o.out?1.2:0,tags:{key:d.key,tid:d.tid,district:S?S.district:null}});DHS.places++;}
 /* the open grounds no building stands on: the pasture and the forest's edge (their door the kipuka grid's nearest node) */
 const Q2=DH.PASTURE,pc=[Q2.reduce((a,p)=>a+p[0],0)/Q2.length,Q2.reduce((a,p)=>a+p[1],0)/Q2.length],K0=DH.KIPUKA;
 for(const [id,kind,p,acts] of [['pasture','pasture',pc,{HERD:10}],['forest','forest',[K0.c[0]-K0.r*.6,K0.c[1]+K0.r*.35],{FORAGE:16}]]){const n=DHN.nearest(p[0],K0.floor,p[1]);if(!n)continue;
  SIM.place({id,name:id==='pasture'?'The pasture':'The forest\'s edge',kind,x:n.x,y:n.y,z:n.z,door:at(n),activities:acts,wander:2.5,tags:{district:'outpost'}});DHS.places++;}
 /* the scouts' secret exits (the layout's x.lava, x.forest): where their patrol goes */
 for(const id of ['x.lava','x.forest']){const n=B.byId[id];if(n){SIM.place({id:'exit_'+id.slice(2),name:'A scout exit ('+id.slice(2)+')',kind:'secret_exit',x:n.x,y:n.y,z:n.z,door:at(n),activities:{SCOUT:6},tags:{district:null}});DHS.places++;}}
 /* the entries the groups start from and go back to (ports inside the world: each with its height and nav node) */
 const doorOf=(key,dist)=>B.doors.find(d=>d.node&&d.key===key&&(!dist||DH.SITES.some(s=>s.district===dist&&Math.abs(s.x-d.rec.x)<.01&&Math.abs(s.z-d.rec.z)<.01)));
 const port=(id,d)=>{if(!d)return false;const n=B.byId[d.node];SIM.port({id,x:n.x,y:n.y,z:n.z,node:n.id,kind:'entry',layer:'pedestrian'});return true;};
 port('scouthq',doorOf('zj_scout_hq'));port('barracks',doorOf('zj_barracks_carved'));port('park',doorOf('zj_park'));
 for(const w of ['s1','s2','s3']){port('kiva_'+w,doorOf('zj_kiva',w));port('stores_'+w,doorOf('zj_store_tunnel',w));}
 /* 4. the records, 5. the people */
 DHS.loaded=SIM.load(DHS.WORLD);
 DHS.pop=SIM.populate({prefix:'z'});
 const sq=DH.byId['h.sq'];SIM.REF={layer:'pedestrian',x:sq.x,z:sq.z};
 DHS.problems=DHS.problems.concat(SIM.check());DHS.ms=Math.round(Date.now()-t0);return DHS;};
/* the stone door: shut through the night hours, its passage then out of every route; returns whether it changed */
DHS.doors=function(hour){const S=DHS.DOOR_SHUT,shut=S[0]>S[1]?(hour>=S[0]||hour<S[1]):(hour>=S[0]&&hour<S[1]);if(shut===DHS.doorShut)return false;DHS.doorShut=shut;
 for(const e of DHS.doorEdges)e.cost=shut?Infinity:1;for(const n in SIM.nav.layers){const L=SIM.nav.layers[n];if(L.cache)L.cache={};}return true;};
/* ---------------------------------------------------------------- the checks (PLAN.md 8.3, 5 and 6), data only: the probe runs them */
/* a pose a walker may stand in: a walk floor within 0.6 m under its feet, no block in its 0.25 m, out of the rock by as much */
DHS.poseOk=function(s){const f=KWALK.floorBelow(s.x,s.z,s.y+.3,.6);if(!f||Math.abs(f[0]-s.y)>.6)return 'off the floor';if(KWALK.blocked(s.x,f[0],s.z,.25,1.6))return 'in a block';
 if(typeof CVC!=='undefined'&&CVC&&s.y<terrainH(s.x,s.z)-.5&&CVC.sdf(s.x,s.y+.9,s.z)<.25)return 'in the rock';return null;};
/* the world run a minute at a time (as the clock would: its day, hour and motion time), the stone door kept to its hours */
DHS.run=function(clock,minutes,each){let M=SIM.minute();for(let m=0;m<minutes;m++){M++;clock.day=Math.floor(M/1440);clock.hour=(M%1440+.5)/60;clock.t+=clock.dayLength/1440;DHS.doors(clock.hour);SIM.step();if(each)each(M);}};
/* a foreigner's way keeps to the outer zone: each leg on the 'outer' layer, every point a node of an outer way (or its ends) */
DHS.outerPts=function(){if(DHS._op)return DHS._op;const B=DHN.get(),S=new Set();for(const e of B.edges)if(e.zone==='outer')for(const id of [e.a,e.b]){const n=B.byId[id];S.add(n.x.toFixed(2)+','+n.z.toFixed(2));}return DHS._op=S;};
DHS.foreignOk=function(task){const S=DHS.outerPts();for(const L of task.legs||[]){if(L.layer!=='outer')return 'a leg on '+L.layer;const P=L.route.pts;for(let i=1;i<P.length-1;i++)if(!S.has(P[i][0].toFixed(2)+','+P[i][2].toFixed(2)))return 'through '+P[i].map(v=>v.toFixed(0)).join(' ');}return null;};
/* a way decided while the stone door is shut does not pass through it (the guard's and the scouts' ways may: it is theirs) */
DHS.crossesDoor=function(task){const B=DHN.get(),K=n=>n.x.toFixed(2)+','+n.z.toFixed(2);for(const e of DHS.doorEdges){const a=K(B.byId[e.a]),b=K(B.byId[e.b]);
  for(const L of task.legs||[]){if(L.layer==='guard'||L.layer==='scout')continue;const P=L.route.pts.map(p=>p[0].toFixed(2)+','+p[2].toFixed(2));for(let i=1;i<P.length;i++)if((P[i-1]===a&&P[i]===b)||(P[i-1]===b&&P[i]===a))return true;}}return false;};
/* 5 and 6: a day stepped minute by minute, sampled every half hour: every pose out in the world stands where a walker can;
   no route failed, no one stuck; stairs climbed; every district visited; no foreigner off the outer ways; no way decided
   while the door is shut goes through it */
DHS.day=function(clock,minutes){const f0=SIM.routeFail.length,l0=SIM.LOG.length,bad=[],dist=new Set(),seen=new Set();let poses=0,stairs=0,foreign=0,shutTasks=0,crossed=[],fbad=[];
 const look=a=>{const T=a.task;if(!T||seen.has(T))return;seen.add(T);
  for(const L of T.legs||[]){const P=L.route.pts;for(let i=1;i<P.length;i++)if(Math.abs(P[i][1]-P[i-1][1])>1.5){stairs++;break;}}
  if(a.role==='trader'){foreign++;const w=DHS.foreignOk(T);if(w&&fbad.length<3)fbad.push(a.id+' '+w);}
  if(DHS.doorShut&&T.legs&&T.legs.length){shutTasks++;if(DHS.crossesDoor(T)&&crossed.length<3)crossed.push(a.id);}};
 DHS.run(clock,minutes,M=>{for(const a of SIM.all('actor'))if(a.present&&a.task)look(a);
  if(M%30)return;const t=SIM.time();for(const a of SIM.all('actor')){if(!a.present)continue;const P=a.place&&SIM.get('place',a.place);if(P&&P.tags&&P.tags.district)dist.add(P.tags.district);
   const s=SIM.pose(a,t);if(s.hidden)continue;poses++;const w=DHS.poseOk(s);if(w&&bad.length<4)bad.push(a.id+' '+w+' @'+[s.x,s.y,s.z].map(v=>v.toFixed(1)).join(' '));}});
 const L=SIM.LOG.slice(l0);return {poses,bad,routeFail:SIM.routeFail.length-f0,rf:SIM.routeFail.slice(f0,f0+2),stuck:L.filter(e=>e.kind==='stuck').length,nopath:L.filter(e=>e.kind==='nopath').length,
  decisions:L.filter(e=>e.kind==='decide').length,stairs,districts:[...dist].sort(),foreign,fbad,shutTasks,crossed,groups:DHS.groupsIn(L)};};
/* the groups in a day's log: per kind of group, how many set out and how many came back to their entry */
DHS.groupsIn=function(L){const out={},kind={};for(const E of DHS.WORLD.events){kind[E.id]=E.kind;out[E.kind]=out[E.kind]||{fired:0,left:0,arrived:0};}
 const gk={};for(const e of L){if(e.kind==='event'&&e.group&&kind[e.event]){gk[e.group]=kind[e.event];out[kind[e.event]].fired++;}
  else if(e.kind==='arrived'&&gk[e.group])out[gk[e.group]].arrived++;else if(e.kind==='left'&&gk[e.group])out[gk[e.group]].left++;}return out;};
/* one group fired now and stepped until it is gone: the stops it made, in order, and whether it came back */
DHS.groupRun=function(clock,E){const f0=SIM.routeFail.length,G=SIM.fire(E,SIM.minute(),SIM.time());if(!G)return {ok:false,stops:[],detail:E.id+' did not fire'};
 const stops=[];let ph=G.phase,m=0;for(;m<1440&&SIM.get('group',G.id);m++){DHS.run(clock,1);if(G.phase!==ph){ph=G.phase;if(ph==='dwell'){const A=SIM.get('actor',G.leader),L=A&&A.plan[A.planI];if(L)stops.push(L.activity);}}}
 const left=!SIM.get('group',G.id),rf=SIM.routeFail.length-f0,want=E.legs.map(l=>l.activity);
 return {ok:left&&!rf&&stops.join()===want.join(),stops,detail:G.members.length+' in it: '+(stops.join(' -> ')||'no stops')+(left?', back after '+m+' min':', STILL OUT')+(rf?', '+rf+' NO PATH':'')+(stops.join()===want.join()?'':'; WANTED '+want.join(' -> '))};};
