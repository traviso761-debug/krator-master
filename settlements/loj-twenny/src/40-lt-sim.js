// prefix: lts
// ================================================================= LOJ TWENNY: THE HOLD ON THE SIMULATION LAYER (PLAN.md section 4) [G data]
// core/simulation (SIM) is the vocabulary; this is the hold's declaration into it, in SCHEMA.md's order, on the isle demo's
// pattern (settlements/isle-demo/PLAN.md 5 and 7: a polity, its settlements keyed, their economies, a trade route between
// them) and Dhelv's (settlements/dhelv/src/74-dhelv-sim.js: a world of levels, every place's door a nav node). No THREE, no DOM.
//   THE POLITY      the Union (faction `tungang`: kits/tungang/PLAN.md 1.2), its orgs the loj (the hold's households) and the
//                   Fixers; the Fellgangs (faction `fellgang`) and the Travellers (their carriers) trade with it
//   THE SETTLEMENTS loj-twenny (this hold at station 3, presented: its people walk), g2 (the G2 gap station 18 km south down
//                   the Line, where the porters carry across toward Ledge: abstract, its books only) and the Ice-cutters (the
//                   Fellgang village on the fells over the great shaft: abstract)
//   THE CENSUS      the homes' beds (a set 6, a cut 2, a carriage house 8; worn homes half, abandoned none) and the roles,
//                   every worker on one of THE THREE TURNS (PLAN.md 1.2: eight hours asleep, eight at work, eight "on the
//                   Line"), dealt round-robin: turn A works 6-14, B 14-22, C 22-6; the loj's bell rings the turn
//   THE TRADES      the dark beds grow the pale fungus (the mash); the vein working off the work deck cuts copper and
//                   rare-earth ore (PLAN.md 1.2.1: the rift fill at km 187-304); POWER UPKEEP: the lamps burn wax, the
//                   Fixers spend plate keeping the branch and the fans; the cool stores take the Fellgangs' ICE; grain from
//                   Dalab at Ledge. Ore and fungus go south on the segment's train; wax, plate and grain come back. The ice
//                   comes down the great shaft (2.2 km) to the hold's foot on the Travellers' backs (their dark clan, the Kradz:
//                   PLAN.md 1.3), and ore goes up
//   THE EVENTS      the Fixers' patrol (posts, works, the stop), the Travellers' porters from the train to the stores, and
//                   THE BIG MEETING (PLAN.md 1.2: the Tpresden hears the lojes' quarrels; a scheduled event: LTS.MEETING)
//   THE COUNT WALL  LTS.countWall(): the hold's stocks and the hands in the hall, what the page paints on the wall
//   NEEDS AND MOOD  (2026-11-12, the owner: "wire them") core/simulation's opt-in modules, tuned here, no copy of them:
//                   NEEDS (77-sim-6-needs.js): a meter a person for eat, sleep, company, wash and voice (the say a Tungang has
//                   in the loj meeting), rising by the hour and by the turn's labour, filled by meals, sleep, the platform and
//                   the hall, the bath and the meetings; happiness from them (hunger past 60 caps it), its band's efficiency at
//                   the beds and the vein, loyalty drifting after it. MEALS (77-sim-6-items.js, the food alone): every home keeps
//                   a store of mash and grain, bought at the island market from the hold's stores at the diet's shares (the
//                   flat hourly draw is gone), so a short store is a hungry home. THE ECONOMY'S RULES (77-sim-6-govern.js): the
//                   fungus rots in the stores unless the Fellgangs' ice keeps it, and the governor turns the beds down when the
//                   stores are full (the glut of the first run). UNREST (77-sim-6-unrest.js): the hold's happiness pool, all and
//                   by trade (the beds, the vein, the Fixers, the loj), sinks through grumbling, a demand to the Union (a
//                   shipment from the gap station, or a new steward by show of hands: granted, the loj elects one), and a strike
//                   when a demand is refused (the beds or the vein held). THE MEETINGS: the loj meeting every week, the Big
//                   Meeting once a year (PLAN.md 1.2).
// Declared once, after the plan (20-lt-plan.js): LTS.declare(clock, o). LTS.run(clock, minutes) steps it. o.needs false: the
// first run's books (no needs, no meals, no rules, no unrest).
const LTS={inited:false,problems:[],turns:[],meetings:[],stewards:[],hands:0,S:'loj-twenny',J:'g2',I:'icecutters',
 /* the turns: [start hour, name]; the bell rings at each */
 TURNS:[[6,'A'],[14,'B'],[22,'C']],
 /* the meetings: the first on `day` (from the page's day 0) at `hour` for `hours`, again every `every` days; the Big Meeting
    cheers the hold (`cheer` points off unhappiness, fading over `days`: the one festival) */
 MEETINGS:[{id:'big',name:'the Big Meeting',day:1,every:365,hour:18,hours:2,cheer:8,days:6},{id:'loj',name:'the loj meeting',day:4,every:7,hour:18,hours:2}],
 /* a day's use by a person (servings and lots) and by the hold; what the gap station and the Ice-cutters make a day */
 USE:{fungus:2,grain:.6,wax:.06,iceDay:14,iceMelt:4,plateDay:6},
 G2:{wax:70,plate:30,grain:180,eats:120},ICECUT:{ice:40},
 /* the segment's train's timetable in world minutes (42-lt-ride.js: 18 km at 15 m/s eased, 1292 motion seconds a run; dwells
    300 s and 240 s; 3 s a world minute): the trade's passage and its stay. The page checks them against the ride source */
 LINE_RUN:{minutes:431,mins:90},
 /* the walks' time scale for the needs and the errands (the Voth city's TUNE.timeScale) */
 TIMESCALE:6,
 /* NEEDS (77-sim-6-needs.js): the meters' rise an hour, what each activity fills an hour, the labour's toll, the weights;
    vital: hunger past 60 caps happiness */
 NEEDS:{list:['eat','sleep','company','wash','voice'],rate:{eat:3,sleep:4.2,company:2,wash:1.2,voice:.3},
  fill:{SLEEP:{sleep:14,eat:1},REST:{sleep:6,company:2},EAT:{eat:26,company:2},SOCIALIZE:{company:24},PLAY:{company:20},BATHE:{wash:40,company:6,sleep:2},
   MEET:{voice:30,company:10},RULE:{voice:6,company:3},TRADE:{company:6},BUY:{company:4},MOURN:{company:3},FETCH_WATER:{company:2},GUARD:{company:1},PATROL:{company:1}},
  work:{eat:1.5,sleep:.6},weight:{eat:1.5,sleep:1.3,company:1,wash:.7,voice:1},
  traits:{talker:{company:1.33},quiet:{company:.67},hungry:{eat:1.33},lean:{eat:.67},hands:{voice:1.33},meek:{voice:.67}},
  free:['SOCIALIZE','BATHE','REST'],dwell:60,jitter:30,keep:1.25,done:12,
  bands:[{label:'content',min:70,eff:1},{label:'uneasy',min:50,eff:.92},{label:'unhappy',min:30,eff:.8},{label:'restless',min:0,eff:.65}],
  loyalty:{tau:4320,bands:[{label:'loyal',min:60},{label:'wavering',min:40},{label:'disloyal',min:0}]},vital:{eat:60},pain:1.5,
  init:{eat:[10,35],sleep:[0,20],company:[10,40],wash:[10,40],voice:[0,25]}},
 /* a role's toll: its labour (0..1) and its meters' rates against the world's; children have no say yet */
 TOLL:{bedsman:{labour:.7},miner:{labour:1,rate:{eat:1.1}},fixer:{labour:.6},fanman:{labour:.6},watch:{labour:.4},stoord:{labour:.1},trader:{labour:.2},
  keeper:{labour:.3},child:{rate:{voice:0,wash:.7}},elder:{rate:{sleep:.9}}},
 /* the unrest's classes: the trades that can strike together, the rest the loj */
 CLS:{bedsman:'beds',miner:'vein',fixer:'fixers'},
 /* MEALS (77-sim-6-items.js): two meals a day of 1.3 servings, the diet's shares (three of mash to one of grain), a home
    restocks for `days` (1 +- stagger) when under `low` days; it opens with 1 to 3 days. A bowl of mash alone is a Tungang's
    meal (`single` 1.6 of the meal's fill, not core's 1); mash and grain together the better one (`mult`) */
 MEALS:{meals:2,perMeal:1.3,diet:{fungus:.75,grain:.25},low:1.5,days:3,stagger:.5,open:[1,3],free:['BUY','SOCIALIZE'],meal:{mult:2.5,single:1.6}},
 /* THE ECONOMY'S RULES (77-sim-6-govern.js): the mash rots 6% a night in the stores, the ice keeps 60% of what would rot (an
    ice for three servings); the governor's order-up-to on what the hold makes, and at most 1800 servings of mash held */
 RULES:{spoil:{fungus:.06},keep:{by:'ice',goods:['fungus'],share:.6,per:3},govern:{every:60,cover:4,ti:1.5,alpha:.3,min:.3,max:1,smooth:2,window:3},max:{fungus:1800}},
 /* UNREST (77-sim-6-unrest.js): the isle demo's lines (placeholders); the Union's answer to a demand for a new ruler is a new
    steward by show of hands */
 UNREST:{smooth:5,hyst:5,stages:{grumble:50,demand:40,strike:30,treason:20},grumble:{arrest:.7},
  demand:{goods:2,days:5,keep:2,every:5,grant:.4,granted:{n:-10,days:10},refused:{n:5,days:10}},strike:{after:5,share:.5,days:1}}};
/* what each def offers: [kind, {ACT: slots}, opts]. A home's beds by its state (worn half, abandoned none) */
LTS.KINDS={'tg-set':['home',{SLEEP:6,EAT:6,REST:6}],'tg-cut':['home_poor',{SLEEP:2,EAT:2,REST:2}],'tg-carriage-house':['home_rich',{SLEEP:8,EAT:8,REST:8}],
 'tg-loj-hall':['hall',{MEET:240,RULE:4,SOCIALIZE:40}],'tg-signal-box':['office',{RULE:4,WORK:2}],'tg-dark-beds':['beds',{WORK:12}],
 'tg-cistern':['cistern',{FETCH_WATER:12,WORK:2}],'tg-bath':['bath',{BATHE:24}],'tg-fan-house':['fans',{WORK:3}],
 'tg-doors':['post',{GUARD:4}],'tg-night-mouth':['post',{GUARD:2}],'tg-last-stop':['last',{MOURN:20}]};
LTS.ACTS=['HAUL','SLEEP','EAT','REST','WORK','SOCIALIZE','BUY','TRADE','MEET','RULE','GUARD','PATROL','BATHE','MOURN','FETCH_WATER','PLAY','DELIVER','IDLE'];
/* the three turns of a worker: work at `w`, eat, then "on the Line" (the platform, the bath, the hall), then sleep */
LTS.turnScheds=function(w){const sh=(h0,spans)=>spans.map(([h,a])=>[(h+h0)%24,a]).sort((p,q)=>p[0]-q[0]);
 const base=[[0,w],[8,'EAT'],[9,'SOCIALIZE'],[12,'BATHE'],[13,'BUY'],[15,'EAT'],[16,'SLEEP']];return [sh(6,base),sh(14,base),sh(22,base)];};
/* the children's and the elders' days, three of each, so the bath (24 places) is not wanted by sixty at one hour */
LTS.KIDS=[[[0,'SLEEP'],[7,'EAT'],[8,'PLAY'],[11,'BATHE'],[12,'EAT'],[13,'PLAY'],[17,'FETCH_WATER'],[18,'EAT'],[19,'SLEEP']],
 [[0,'SLEEP'],[7,'EAT'],[8,'PLAY'],[12,'EAT'],[13,'PLAY'],[15,'BATHE'],[16,'PLAY'],[17,'FETCH_WATER'],[18,'EAT'],[19,'SLEEP']],
 [[0,'SLEEP'],[7,'EAT'],[8,'PLAY'],[12,'EAT'],[13,'PLAY'],[17,'FETCH_WATER'],[18,'BATHE'],[19,'EAT'],[20,'SLEEP']]];
LTS.OLD=[[[0,'SLEEP'],[7,'EAT'],[8,'SOCIALIZE'],[12,'EAT'],[13,'REST'],[16,'BATHE'],[17,'SOCIALIZE'],[18,'EAT'],[19,'SOCIALIZE'],[21,'SLEEP']],
 [[0,'SLEEP'],[7,'EAT'],[8,'BATHE'],[9,'SOCIALIZE'],[12,'EAT'],[13,'REST'],[16,'SOCIALIZE'],[18,'EAT'],[19,'SOCIALIZE'],[21,'SLEEP']],
 [[0,'SLEEP'],[7,'EAT'],[8,'SOCIALIZE'],[12,'EAT'],[13,'REST'],[16,'SOCIALIZE'],[18,'EAT'],[19,'SOCIALIZE'],[20,'BATHE'],[21,'SLEEP']]];
LTS.WORLD=function(){const T=LTS.turnScheds,home={SLEEP:{pin:'home'},EAT:{pin:'home'},REST:{pin:'home'}};
 return {activities:LTS.ACTS.map(id=>/^(SLEEP|REST|RULE|EAT|MEET)$/.test(id)?{id,indoor:true}:{id}),
 factions:[{id:'tungang',name:'The Union (the Tungangs)',culture:'tungang'},{id:'fellgang',name:'The Fellgangs',culture:'fellgang'}],
 orgs:[{id:'loj20',faction:'tungang',name:'Loj Twenny (the households)'},{id:'fixers',faction:'tungang',name:'The Fixers'},
  {id:'travellers',faction:'fellgang',name:'The Travellers (the Kradz, the dark clan)',resident:false}],
 relations:[{a:'tungang',b:'fellgang',stance:'cordial',trade:true},{a:'fellgang',b:'tungang',stance:'cordial',trade:true}],
 roles:[
  {id:'bedsman',org:'loj20',settlement:LTS.S,count:36,homes:['home','home_poor'],work:{kinds:['beds'],act:'WORK',near:true},sched:T('WORK')[0],variants:T('WORK'),prefers:Object.assign({WORK:{pin:'work'}},home)},
  {id:'miner',org:'loj20',settlement:LTS.S,count:24,homes:['home','home_poor'],work:{kinds:['vein'],act:'WORK'},sched:T('WORK')[0],variants:T('WORK'),prefers:Object.assign({WORK:{pin:'work'}},home)},
  {id:'fixer',org:'fixers',settlement:LTS.S,count:12,homes:['home_rich','home'],work:{kinds:['shop'],act:'WORK'},sched:T('WORK')[0],variants:T('WORK'),prefers:Object.assign({WORK:{pin:'work'}},home)},
  {id:'fanman',org:'loj20',settlement:LTS.S,count:6,homes:['home','home_poor'],work:{kinds:['fans','cistern'],act:'WORK'},sched:T('WORK')[0],variants:T('WORK'),prefers:Object.assign({WORK:{pin:'work'}},home)},
  {id:'watch',org:'loj20',settlement:LTS.S,count:12,homes:['home','home_poor'],sched:T('GUARD')[0],variants:T('GUARD'),prefers:Object.assign({GUARD:{kinds:['post']}},home)},
  {id:'stoord',org:'loj20',settlement:LTS.S,count:3,homes:['home_rich','home'],work:{kinds:['office'],act:'RULE'},sched:T('RULE')[0],variants:T('RULE'),prefers:Object.assign({RULE:{pin:'work'}},home)},
  {id:'trader',org:'loj20',settlement:LTS.S,count:8,homes:['home','home_poor'],work:{kinds:['market'],act:'TRADE'},sched:T('TRADE')[0],variants:T('TRADE'),prefers:Object.assign({TRADE:{pin:'work'}},home)},
  {id:'keeper',org:'loj20',settlement:LTS.S,count:2,homes:['home','home_poor'],work:{kinds:['last'],act:'MOURN'},sched:[[0,'SLEEP'],[7,'MOURN'],[13,'EAT'],[14,'MOURN'],[20,'EAT'],[21,'SLEEP']],prefers:Object.assign({MOURN:{pin:'work'}},home)},
  {id:'child',org:'loj20',settlement:LTS.S,count:40,homes:['home','home_poor'],speed:1.4,sched:LTS.KIDS[0],variants:LTS.KIDS,prefers:Object.assign({PLAY:{kinds:['market']}},home)},
  {id:'elder',org:'loj20',settlement:LTS.S,fill:true,homes:['home','home_poor','home_rich'],speed:.9,sched:LTS.OLD[0],variants:LTS.OLD,prefers:home}],
 events:[
  {id:'patrol',name:'The Fixers\' patrol (the posts, the works, the stop)',kind:'patrol',org:'fixers',every:[3,5],window:[0,24],from:['fixers'],size:[1,1],unit:[{role:'fixer',n:3}],
   legs:[{activity:'PATROL',mins:6,kinds:['post']},{activity:'PATROL',mins:6,kinds:['fans']},{activity:'PATROL',mins:6,kinds:['stop']}],layer:'pedestrian',speed:1.2,maxLive:1,spread:0},
  {id:'porters',name:'The Travellers\' porters from the train to the stores',kind:'porters',org:'travellers',every:[2,4],window:[6,22],from:['stop'],size:[1,1],unit:[{role:'porter',n:4}],
   legs:[{activity:'DELIVER',mins:12,kinds:['warehouse']}],layer:'pedestrian',speed:1,maxLive:1,spread:0}]};};
LTS.kindOf=key=>LTS.KINDS[key]||null;
/* THE DECLARATION */
LTS.declare=function(clock,o){if(LTS.inited)return LTS;LTS.inited=true;o=o||{};const t0=Date.now(),H=LT.plan(),N=KCITY.cavern.nav(H),byId={};N.nodes.forEach(n=>byId[n.id]=n);
 SIM.init({seed:o.seed==null?20261120:o.seed,hour:()=>clock.hour,day:()=>clock.day,t:()=>clock.t,err:m=>LTS.problems.push(m)});
 LTS.seed=o.seed==null?20261120:o.seed;LTS.mood=o.needs!==false&&!!SIM.needs&&!!SIM.items;
 /* the needs' and the errands' motion seconds a world minute: the day's (3) times the walks' time scale, as the Voth city
    and the isle demo count them (TUNE.timeScale 6): a walk of 300 m across the station is 14 world minutes to the meters,
    not 83, or every hour-long meal would be spent on the way */
 const spm=(clock.dayLength==null?4320:clock.dayLength)/1440*LTS.TIMESCALE,NE=LTS.NEEDS;
 if(LTS.mood){SIM.needs({list:NE.list,rate:NE.rate,fill:NE.fill,work:NE.work,weight:NE.weight,traits:NE.traits,free:NE.free,dwell:NE.dwell,jitter:NE.jitter,keep:NE.keep,done:NE.done,
   bands:NE.bands,loyalty:NE.loyalty,vital:NE.vital,pain:NE.pain,secPerMinute:spm});
  SIM.items({kinds:{fungus:{cat:'food',food:true},grain:{cat:'food',food:true}},free:LTS.MEALS.free,secPerMinute:spm,low:LTS.MEALS.low,days:LTS.MEALS.days,
   meals:LTS.MEALS.meals,perMeal:LTS.MEALS.perMeal,stagger:LTS.MEALS.stagger,meal:LTS.MEALS.meal});}
 SIM.nav.layer('pedestrian',{nodes:N.nodes,edges:N.edges,cost:{stair:1.4,ramp:1.15,door:1},yWeight:3});
 LTS.nav=N;
 /* the settlements and their places */
 for(const s of [LTS.S,LTS.J,LTS.I])SIM.settlement({id:s,faction:s===LTS.I?'fellgang':'tungang',name:s});
 const at=n=>({x:n.x,y:n.y,z:n.z,node:n.id});let places=0;
 for(const s of H.sites){const K=LTS.kindOf(s.key),n=byId[s.id];if(!K||!n||s.state==='removed')continue;const acts={};
  for(const a in K[1]){let v=K[1][a];if(/^home/.test(K[0])&&/^(SLEEP|EAT|REST)$/.test(a))v=s.state==='abandoned'?0:s.state==='worn'?Math.ceil(v/2):v;if(v>0)acts[a]=v;}
  if(!Object.keys(acts).length)continue;
  SIM.place({id:s.id,name:s.key,kind:K[0],x:s.x,y:s.y,z:s.z,ry:s.ry,door:at(n),activities:acts,indoor:true,settlement:LTS.S,access:/^home/.test(K[0])?'private':'public',
   tags:{key:s.key,state:s.state,district:s.district||null,deck:s.deck}});places++;}
 /* the places no def stands at (stand-ins at the plan's nodes: kits/tungang has no tg_vein_working, tg_fixers_shop, tg_platform yet):
    the market on the island platform, the stores and the Fixers' shop in the station's own rooms behind the east platform's
    doors, the train's stop, the vein working at the work deck's end, the great shaft's foot (the hoist) */
 const extra=[['lt.market','market','lt.pi@350',{BUY:40,TRADE:8,SOCIALIZE:40,PLAY:20},'The island platform: the market'],
  ['lt.stores','warehouse','lt.pe@520',{DELIVER:10},'The hold\'s stores (the station\'s stores room)'],['lt.stop','stop','lt.pe@500',{DELIVER:6,PATROL:4},'The train\'s stop (the east platform)'],
  ['lt.shop','shop','lt.pe@330',{WORK:6},'The Fixers\' shop (the station\'s workshop)'],['lt.vein','vein','lt.s1:end',{WORK:10},'The vein working (copper and rare earths)'],
  ['lt.shaftfoot','shaft','lt.pw@540',{DELIVER:6},'The great shaft\'s foot (the hoist: the ice comes down it)']];
 for(const [id,kind,node,acts,name] of extra){const n=byId[node];if(!n){LTS.problems.push('no node '+node+' for '+id);continue;}
  SIM.place({id,name,kind,x:n.x,y:n.y,z:n.z,door:at(n),activities:acts,indoor:kind!=='market',settlement:LTS.S,wander:kind==='market'?4:0,tags:{district:'line'}});places++;}
 /* the gap station's and the Ice-cutters' stores: off the page (abstract), their books only */
 SIM.place({id:'g2.stores',name:'The G2 gap station\'s stores (18 km south: the porters\' hold toward Ledge)',kind:'warehouse',x:10.5,y:1.8,z:18470,activities:{DELIVER:4},settlement:LTS.J,tags:{district:'g2'}});
 SIM.place({id:'ic.stores',name:'The Ice-cutters\' ice houses (over the great shaft)',kind:'warehouse',x:-25000,y:3400,z:-200,activities:{DELIVER:4},settlement:LTS.I,tags:{district:'fells'}});
 LTS.places=places;
 /* the ports the groups start from (their nav nodes) */
 for(const [id,node] of [['fixers','lt.pe@330'],['stop','lt.pe@500']])SIM.port({id,x:byId[node].x,y:byId[node].y,z:byId[node].z,node,kind:'entry',layer:'pedestrian'});
 /* the records, the porters' role (visitors), the people */
 const W=LTS.WORLD();W.roles.push({id:'porter',org:'travellers',sched:[[0,'DELIVER']]});LTS.loaded=SIM.load(W);
 for(const id in LTS.TOLL)if(SIM.R.role[id])SIM.R.role[id].needs=LTS.TOLL[id];
 LTS.pop=SIM.populate({settlement:LTS.S,prefix:'t'});
 /* no home of children alone (the census deals beds by role, so a set can fill with six children, and nobody in it shops or
    cooks): a child there trades beds with an elder of a home that has two grown-ups or more, the homes in id order */
 {const live=SIM.all('actor').filter(a=>!a.driven&&SIM.settlementOf(a)===LTS.S&&a.home),by={};for(const a of live)(by[a.home]||(by[a.home]=[])).push(a);
  const grown=h=>by[h].filter(a=>a.role!=='child').length;LTS.rehoused=0;
  for(const h of Object.keys(by).sort()){if(grown(h))continue;const g=Object.keys(by).sort().find(o=>grown(o)>=2&&by[o].some(a=>a.role==='elder'));if(!g)continue;
   const e=by[g].find(a=>a.role==='elder'),c=by[h][0];e.home=h;c.home=g;by[h][0]=e;by[g][by[g].indexOf(e)]=c;LTS.rehoused++;}}
 /* each person's class (the trades that strike together), trait and opening meters, by a hash of the person (core/rand) */
 const mine=SIM.all('actor').filter(a=>!a.driven&&SIM.settlementOf(a)===LTS.S),u=(a,b,c)=>KRAND.unit(KRAND.hash(LTS.seed,71,a,b,c==null?0:c));
 for(const a of mine){a.cls=LTS.CLS[a.role]||'loj';if(!LTS.mood)continue;const TR=Object.keys(NE.traits);a.trait=TR[Math.floor(u(a.k,1)*TR.length)%TR.length];
  a.nd=NE.list.map((n,i)=>{const r=NE.init[n];return r[0]+(r[1]-r[0])*u(a.k,2,i);});}
 /* THE ECONOMIES (keyed by settlement): servings of food, lots of the rest */
 const goods={fungus:{unit:'serving'},grain:{unit:'serving'},wax:{unit:'lot'},ore:{unit:'lot'},plate:{unit:'lot'},ice:{unit:'lot'}},RU=LTS.RULES;
 const E=SIM.economy(Object.assign({goods,every:15,window:1,useShort:true,cart:{cap:120,load:6,unload:6,minLoad:10}},LTS.mood?{spoil:RU.spoil,keep:RU.keep,govern:RU.govern}:{}),{settlement:LTS.S});
 if(LTS.mood){const pol={};for(const g in RU.max)pol[g]={max:RU.max[g]};SIM.stockpile(LTS.S,pol);}
 SIM.store('lt.stores',{kind:'warehouse'});SIM.store('lt.stop',{kind:'site'});SIM.store('lt.shaftfoot',{kind:'site'});
 for(const s of H.sites)if(s.key==='tg-dark-beds'&&SIM.R.place[s.id])SIM.recipe(s.id,{out:['fungus'],rate:2.2,cap:400});
 SIM.recipe('lt.vein',{out:['ore'],rate:.35,cap:200});
 /* the hauliers: driven carts (hand trolleys on the platforms and the ramps) between the makers, the stop and the stores */
 if(!SIM.R.role.cart)SIM.role({id:'cart',org:'loj20',name:'haulier',sched:[[0,'HAUL']],speed:SIM.SPEED&&SIM.SPEED.cart?SIM.SPEED.cart:1});
 const Wh=SIM.R.place['lt.stores'];LTS.carts=[];
 for(let c=0;c<4;c++){const a=SIM.actor({id:'lt.cart'+c,role:'cart',org:'loj20',home:'lt.stores',cls:'cart',job:'hauliers'});a.pos={x:Wh.door.x,y:Wh.door.y,z:Wh.door.z};SIM.cart(a);LTS.carts.push(a.id);}
 SIM.economy({goods,every:60,window:1,useShort:true},{settlement:LTS.J});SIM.store('g2.stores',{kind:'warehouse'});
 SIM.economy({goods,every:60,window:1,useShort:true},{settlement:LTS.I});SIM.store('ic.stores',{kind:'warehouse'});
 /* the opening stock: three days of the hold's use; the gap station a week of what it sends */
 const pop=LTS.people(),P=SIM.R.place;Object.assign(P['lt.stores'].stock,{fungus:Math.round(pop*LTS.USE.fungus*3),grain:Math.round(pop*LTS.USE.grain*3),wax:Math.round(pop*LTS.USE.wax*3)+20,
  ore:0,plate:LTS.USE.plateDay*3,ice:LTS.USE.iceDay*3});
 Object.assign(P['g2.stores'].stock,{wax:400,plate:200,grain:900,ice:0,ore:0,fungus:0});Object.assign(P['ic.stores'].stock,{ice:200});
 /* THE HOUSEHOLDS (meals): the island market sells the mash and the grain from the hold's stores; every lived-in home knows
    its people and opens with a store of 1 to 3 days at the diet's shares (outside the stores' books, as the stores' own
    opening stock is) */
 if(LTS.mood){const M=LTS.MEALS;SIM.shop('lt.market',['fungus','grain']);SIM.itemsDiet(LTS.S,M.diet);const ppl={};let homes=0,serv=0;
  for(const a of mine)if(a.home)ppl[a.home]=(ppl[a.home]||0)+1;
  for(const id of Object.keys(ppl).sort()){const H=P[id];if(!H)continue;H.people=ppl[id];const d=M.open[0]+(M.open[1]-M.open[0])*u(id.length,3,homes),n=H.people*M.meals*M.perMeal*d;
   H.store={fungus:Math.round(n*M.diet.fungus),grain:Math.round(n*M.diet.grain)};serv+=H.store.fungus+H.store.grain;homes++;}
  LTS.households={homes,servings:serv};
  if(SIM.placesChanged)SIM.placesChanged();}
 /* THE CARRIERS: the segment's train south to the G2 gap station (18 km at 15 m/s, its dwells: LTS.LINE_RUN, the drawn train's
    own timetable), the Travellers up and down the great shaft (the hoist: 2.2 km) */
 SIM.trade({id:'lt.line',stops:[{settlement:LTS.S,place:'lt.stop'},{settlement:LTS.J,place:'g2.stores'}],cap:600,carriers:1,minutes:LTS.LINE_RUN.minutes,mins:LTS.LINE_RUN.mins,
  keep:1.5,goods:{[LTS.S]:['ore','fungus'],[LTS.J]:['wax','plate','grain']},expect:{[LTS.J]:{fungus:LTS.G2.eats,ore:48},[LTS.S]:{wax:pop*LTS.USE.wax,grain:pop*LTS.USE.grain,plate:LTS.USE.plateDay}}});
 SIM.trade({id:'lt.shaft',stops:[{settlement:LTS.I,place:'ic.stores'},{settlement:LTS.S,place:'lt.shaftfoot'}],cap:60,carriers:2,minutes:300,mins:60,
  goods:{[LTS.I]:['ice'],[LTS.S]:['ore']},expect:{[LTS.S]:{ice:LTS.USE.iceDay*1.2},[LTS.I]:{ore:4}}});
 /* the hourly book-keeping of what no actor draws: the hold's meals, its lamps' wax, its upkeep; the gap station's and the
    Ice-cutters' own making (abstract); the bell at each turn; the Big Meeting */
 SIM.stepHooks.push(LTS.hook);
 /* UNREST: the hold's pool by trade; a demand for a new ruler is the loj's own to grant: a new steward by show of hands */
 if(LTS.mood&&SIM.unrest){const K=LTS.UNREST;SIM.unrest({classOf:a=>a.cls,smooth:K.smooth,hyst:K.hyst,stages:K.stages,grumble:K.grumble,demand:K.demand,strike:K.strike,
  ruler:(s,D)=>{if(s!==LTS.S)return false;LTS.stewards.push({minute:SIM.minute(),day:Math.floor(SIM.minute()/1440),demand:D.id,key:D.key});return true;}});}
 LTS.problems=LTS.problems.concat(SIM.check());LTS.ms=Date.now()-t0;return LTS;};
LTS.people=()=>SIM.all('actor').filter(a=>!a.driven&&SIM.settlementOf(a)===LTS.S).length;
LTS.hook=function(minute){const h=Math.floor((minute%1440)/60),m=minute%60,day=Math.floor(minute/1440);
 if(m===0){const pop=LTS.people(),U=LTS.USE;
  /* the meals: a flat draw on the first run's books; with meals on, the homes buy their food at the market and eat it */
  if(!LTS.mood){SIM.supply('fungus',pop*U.fungus/24,false,LTS.S);SIM.supply('grain',pop*U.grain/24,false,LTS.S);}
  SIM.supply('wax',pop*U.wax/24,false,LTS.S);
  SIM.supply('ice',(LTS.mood?U.iceMelt:U.iceDay)/24,false,LTS.S);SIM.supply('plate',U.plateDay/24,false,LTS.S);
  for(const g in LTS.G2)if(g!=='eats')SIM.produce('g2.stores',g,LTS.G2[g]/24);SIM.supply('ore',2,false,LTS.J);SIM.supply('fungus',LTS.G2.eats/24,false,LTS.J);
  SIM.supply('ore',.15,false,LTS.I);
  for(const g in LTS.ICECUT)SIM.produce('ic.stores',g,LTS.ICECUT[g]/24);
  const T=LTS.TURNS.find(t=>t[0]===h);if(T)LTS.turns.push({minute,day,hour:h,turn:T[1],atWork:LTS.atWork()});}
 /* the meetings: on their day and every `every` days after, everyone but the children called to the hall (the Big Meeting
    first when both fall due); the hands counted every ten minutes while one sits */
 if(m===0)for(const M of LTS.MEETINGS){if(h!==M.hour||day<M.day||(day-M.day)%M.every)continue;if(LTS.meetings.some(q=>q.minute===minute))continue;let n=0;
  for(const a of SIM.all('actor')){if(a.driven||SIM.settlementOf(a)!==LTS.S||a.role==='child')continue;SIM.command(a,{act:'MEET',place:'lt.loj-hall',mins:M.hours*60,by:M.name});
   if(M.cheer&&SIM.NEED&&SIM.happinessAdd)SIM.happinessAdd(a,-M.cheer,M.days,M.name);n++;}
  LTS.meetings.push({id:M.id,name:M.name,minute,day,hour:h,called:n,hands:0,until:minute+M.hours*60});}
 const sit=LTS.meetings.length?LTS.meetings[LTS.meetings.length-1]:null;
 if(sit&&minute>sit.minute&&minute<sit.until&&minute%10===0){const k=LTS.countWall().hands;sit.hands=Math.max(sit.hands,k);LTS.hands=Math.max(LTS.hands,k);}};
/* who is at work now, by turn: the roles on the turns, counted by their schedule's turn (their variant) */
LTS.atWork=function(){const out={};for(const a of SIM.all('actor')){if(a.driven||!a.present)continue;if(a.activity==='WORK'||a.activity==='GUARD'||a.activity==='RULE'||a.activity==='TRADE'){out[a.activity]=(out[a.activity]||0)+1;}}return out;};
/* the count wall: the hold's stocks and the hands in the hall (the shadows the sekketri counts) */
LTS.countWall=function(){const o={};for(const g of ['fungus','grain','wax','ore','plate','ice'])o[g]=Math.round(SIM.stockOf(g,LTS.S));
 o.hands=SIM.all('actor').filter(a=>a.present&&a.place==='lt.loj-hall'&&a.activity==='MEET').length;o.people=LTS.people();
 if(LTS.mood){const P=SIM.happinessPool(LTS.S);o.happy=P.all.mean==null?null:Math.round(P.all.mean);const U=SIM.unrestReport?SIM.unrestReport(LTS.S):null,T=U&&U.towns[LTS.S];o.stage=T&&T.stage.all?T.stage.all:'calm';}
 return o;};
/* THE COUNT WALL'S WORDS, as the sekketri chalks them: Tungang spelt in the Book's letters (lore/tongues-of-krator.html,
   "From English": the t' fused on, the h gone, long i to ah, long o to ua, a final t a catch). The mash, the grain, the
   wax, the ore, the plate, the ice; the hands (anz) raised, the loj's people (Tloj), its heart (art) and how it stands: all
   right (awreet), grumbling, asking, out on strike (strak), scab (skab: the treason stage, the worst word there is) */
LTS.WALL={fungus:'MASH',grain:'GREYN',wax:'WAKS',ore:'UAR',plate:'PLAY\'',ice:'AHS',hands:'ANZ',people:'TLOJ',heart:'ART',
 stage:{calm:'AWREET',grumble:'GRUMMLIN',demand:'ASKIN',strike:'STRAK',treason:'SKAB'}};
/* the mood of the hold: its needs by class (the meters' means, how many at 70 or more, the bands), the happiness pool and the
   unrest's levels and stages, what rotted and what the ice kept, the meals eaten and missed */
LTS.moodReport=function(){if(!LTS.mood)return null;const E=SIM.econ(LTS.S),U=SIM.unrestReport(LTS.S)||{towns:{},events:[]},T=U.towns[LTS.S]||{level:{},stage:{},demands:[],strikes:[]};
 const I=SIM.ITEMS,MB=(I.statsBy&&I.statsBy[LTS.S]&&I.statsBy[LTS.S].meals)||I.stats.meals;
 return {needs:SIM.needsCensus(a=>SIM.settlementOf(a)===LTS.S&&!a.driven?a.cls:null),pool:SIM.happinessPool(LTS.S),level:T.level,stage:T.stage,
  demands:T.demands.map(D=>({id:D.id,day:Math.floor(D.m/1440),key:D.key,kind:D.kind,goods:D.goods,answer:D.answer})),strikes:T.strikes.map(s=>({day:Math.floor(s.m/1440),key:s.key,held:s.held})),
  stewards:LTS.stewards.slice(),spoiled:Object.assign({},E.spoiled||{}),kept:Object.assign({},E.kept||{}),meals:Object.assign({},MB),governed:SIM.economyGoverned?SIM.economyGoverned(LTS.S):null};};
/* the world run a minute at a time (the clock's day, hour and motion time) */
LTS.run=function(clock,minutes,each){let M=SIM.minute();for(let m=0;m<minutes;m++){M++;clock.day=Math.floor(M/1440);clock.hour=(M%1440+.5)/60;clock.t+=(clock.dayLength==null?4320:clock.dayLength)/1440;SIM.step();if(each)each(M);}};
