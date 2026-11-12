// prefix: lts
// ================================================================= LOJ TWENNY: THE HOLD ON THE SIMULATION LAYER (PLAN.md section 4) [G data]
// core/simulation (SIM) is the vocabulary; this is the hold's declaration into it, in SCHEMA.md's order, on the isle demo's
// pattern (settlements/isle-demo/PLAN.md 5 and 7: a polity, its settlements keyed, their economies, a trade route between
// them) and Dhelv's (settlements/dhelv/src/74-dhelv-sim.js: a world of levels, every place's door a nav node). No THREE, no DOM.
//   THE POLITY      the Union (faction `tungang`: kits/tungang/PLAN.md 1.2), its orgs the loj (the hold's households) and the
//                   Fixers; the Fellgangs (faction `fellgang`) and the Travellers (their carriers) trade with it
//   THE SETTLEMENTS loj-twenny (this hold, presented: its people walk), twenny-junction (station 3 on the Line, 25 km west by
//                   the branch: where the Line's goods come and go; abstract, its books only) and the Ice-cutters (the
//                   Fellgang village on the fells over the great shaft: abstract)
//   THE CENSUS      the homes' beds (a set 6, a cut 2, a carriage house 8; worn homes half, abandoned none) and the roles,
//                   every worker on one of THE THREE TURNS (PLAN.md 1.2: eight hours asleep, eight at work, eight "on the
//                   Line"), dealt round-robin: turn A works 6-14, B 14-22, C 22-6; the loj's bell rings the turn
//   THE TRADES      the dark beds grow the pale fungus (the mash); the vein working off the work deck cuts copper and
//                   rare-earth ore (PLAN.md 1.2.1: the rift fill at km 187-304); POWER UPKEEP: the lamps burn wax, the
//                   Fixers spend plate keeping the branch and the fans; the cool stores take the Fellgangs' ICE; grain from
//                   Dalab at Ledge. Ore and fungus go west on the shuttle; wax, plate, grain and ice come back. The ice comes
//                   down the great shaft to the junction on the Travellers' backs (their dark clan, the Kradz: PLAN.md 1.3)
//   THE EVENTS      the Fixers' patrol (posts, works, the stop), the Travellers' porters from the train to the stores, and
//                   THE BIG MEETING (PLAN.md 1.2: the Tpresden hears the lojes' quarrels; a scheduled event: LTS.MEETING)
//   THE COUNT WALL  LTS.countWall(): the hold's stocks and the hands in the hall, what the page paints on the wall
// Declared once, after the plan (20-lt-plan.js): LTS.declare(clock, o). LTS.run(clock, minutes) steps it.
const LTS={inited:false,problems:[],turns:[],meetings:[],hands:0,S:'loj-twenny',J:'twenny-junction',I:'icecutters',
 /* the turns: [start hour, name]; the bell rings at each */
 TURNS:[[6,'A'],[14,'B'],[22,'C']],
 /* the Big Meeting: on this day (from the page's day 0) at this hour, for so many hours */
 MEETING:{day:1,hour:18,hours:2},
 /* a day's use by a person (servings and lots) and by the hold; what the junction and the Ice-cutters make a day */
 USE:{fungus:2,grain:.6,wax:.06,iceDay:14,plateDay:6},
 JUNCTION:{wax:70,plate:30,grain:160,eats:120},ICECUT:{ice:40}};
/* what each def offers: [kind, {ACT: slots}, opts]. A home's beds by its state (worn half, abandoned none) */
LTS.KINDS={'tg-set':['home',{SLEEP:6,EAT:6,REST:6}],'tg-cut':['home_poor',{SLEEP:2,EAT:2,REST:2}],'tg-carriage-house':['home_rich',{SLEEP:8,EAT:8,REST:8}],
 'tg-loj-hall':['hall',{MEET:240,RULE:4,SOCIALIZE:40}],'tg-signal-box':['office',{RULE:4,WORK:2}],'tg-dark-beds':['beds',{WORK:12}],
 'tg-cistern':['cistern',{FETCH_WATER:12,WORK:2}],'tg-bath':['bath',{BATHE:16}],'tg-fan-house':['fans',{WORK:3}],
 'tg-doors':['post',{GUARD:4}],'tg-night-mouth':['post',{GUARD:2}],'tg-last-stop':['last',{MOURN:20}]};
LTS.ACTS=['HAUL','SLEEP','EAT','REST','WORK','SOCIALIZE','BUY','TRADE','MEET','RULE','GUARD','PATROL','BATHE','MOURN','FETCH_WATER','PLAY','DELIVER','IDLE'];
/* the three turns of a worker: work at `w`, eat, then "on the Line" (the platform, the bath, the hall), then sleep */
LTS.turnScheds=function(w){const sh=(h0,spans)=>spans.map(([h,a])=>[(h+h0)%24,a]).sort((p,q)=>p[0]-q[0]);
 const base=[[0,w],[8,'EAT'],[9,'SOCIALIZE'],[12,'BATHE'],[13,'BUY'],[15,'EAT'],[16,'SLEEP']];return [sh(6,base),sh(14,base),sh(22,base)];};
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
  {id:'child',org:'loj20',settlement:LTS.S,count:40,homes:['home','home_poor'],speed:1.4,sched:[[0,'SLEEP'],[7,'EAT'],[8,'PLAY'],[12,'EAT'],[13,'PLAY'],[17,'FETCH_WATER'],[18,'EAT'],[19,'SLEEP']],prefers:Object.assign({PLAY:{kinds:['market']}},home)},
  {id:'elder',org:'loj20',settlement:LTS.S,fill:true,homes:['home','home_poor','home_rich'],speed:.9,sched:[[0,'SLEEP'],[7,'EAT'],[8,'SOCIALIZE'],[12,'EAT'],[13,'REST'],[16,'BATHE'],[18,'EAT'],[19,'SOCIALIZE'],[21,'SLEEP']],prefers:home}],
 events:[
  {id:'patrol',name:'The Fixers\' patrol (the posts, the works, the stop)',kind:'patrol',org:'fixers',every:[3,5],window:[0,24],from:['fixers'],size:[1,1],unit:[{role:'fixer',n:3}],
   legs:[{activity:'PATROL',mins:6,kinds:['post']},{activity:'PATROL',mins:6,kinds:['fans']},{activity:'PATROL',mins:6,kinds:['stop']}],layer:'pedestrian',speed:1.2,maxLive:1,spread:0},
  {id:'porters',name:'The Travellers\' porters from the train to the stores',kind:'porters',org:'travellers',every:[2,4],window:[6,22],from:['stop'],size:[1,1],unit:[{role:'porter',n:4}],
   legs:[{activity:'DELIVER',mins:12,kinds:['warehouse']}],layer:'pedestrian',speed:1,maxLive:1,spread:0}]};};
LTS.kindOf=key=>LTS.KINDS[key]||null;
/* THE DECLARATION */
LTS.declare=function(clock,o){if(LTS.inited)return LTS;LTS.inited=true;o=o||{};const t0=Date.now(),H=LT.plan(),N=KCITY.cavern.nav(H),byId={};N.nodes.forEach(n=>byId[n.id]=n);
 SIM.init({seed:o.seed==null?20261120:o.seed,hour:()=>clock.hour,day:()=>clock.day,t:()=>clock.t,err:m=>LTS.problems.push(m)});
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
    the market in the platform's bays, the stores (the hold's warehouse), the train's stop, the Fixers' shop, the vein working */
 const extra=[['lt.market','market','lt.n2:on',{BUY:40,TRADE:8,SOCIALIZE:40,PLAY:20},'The platform\'s bays: the market'],
  ['lt.stores','warehouse','lt.s2:on',{DELIVER:10},'The hold\'s stores'],['lt.stop','stop','lt.ps:a',{DELIVER:6,PATROL:4},'The shuttle\'s stop'],
  ['lt.shop','shop','lt.n2:end',{WORK:6},'The Fixers\' shop'],['lt.vein','vein','lt.s1:end',{WORK:10},'The vein working (copper and rare earths)']];
 for(const [id,kind,node,acts,name] of extra){const n=byId[node];if(!n){LTS.problems.push('no node '+node+' for '+id);continue;}
  SIM.place({id,name,kind,x:n.x,y:n.y,z:n.z,door:at(n),activities:acts,indoor:kind!=='market',settlement:LTS.S,wander:kind==='market'?4:0,tags:{district:'line'}});places++;}
 /* the junction's and the Ice-cutters' stores: off the page (abstract), their books only */
 SIM.place({id:'jn.stores',name:'The Twenny junction\'s stores (station 3)',kind:'warehouse',x:-25000,y:1.8,z:0,activities:{DELIVER:4},settlement:LTS.J,tags:{district:'junction'}});
 SIM.place({id:'ic.stores',name:'The Ice-cutters\' ice houses (over the great shaft)',kind:'warehouse',x:-25000,y:3400,z:-200,activities:{DELIVER:4},settlement:LTS.I,tags:{district:'fells'}});
 LTS.places=places;
 /* the ports the groups start from (their nav nodes) */
 SIM.port({id:'fixers',x:byId['lt.n2:end'].x,y:byId['lt.n2:end'].y,z:byId['lt.n2:end'].z,node:'lt.n2:end',kind:'entry',layer:'pedestrian'});
 SIM.port({id:'stop',x:byId['lt.ps:a'].x,y:byId['lt.ps:a'].y,z:byId['lt.ps:a'].z,node:'lt.ps:a',kind:'entry',layer:'pedestrian'});
 /* the records, the porters' role (visitors), the people */
 const W=LTS.WORLD();W.roles.push({id:'porter',org:'travellers',sched:[[0,'DELIVER']]});LTS.loaded=SIM.load(W);
 LTS.pop=SIM.populate({settlement:LTS.S,prefix:'t'});
 /* THE ECONOMIES (keyed by settlement): servings of food, lots of the rest */
 const goods={fungus:{unit:'serving'},grain:{unit:'serving'},wax:{unit:'lot'},ore:{unit:'lot'},plate:{unit:'lot'},ice:{unit:'lot'}};
 const E=SIM.economy({goods,every:15,window:1,useShort:true,cart:{cap:120,load:6,unload:6,minLoad:10}},{settlement:LTS.S});
 SIM.store('lt.stores',{kind:'warehouse'});SIM.store('lt.stop',{kind:'site'});
 for(const s of H.sites)if(s.key==='tg-dark-beds'&&SIM.R.place[s.id])SIM.recipe(s.id,{out:['fungus'],rate:2.2,cap:400});
 SIM.recipe('lt.vein',{out:['ore'],rate:.35,cap:200});
 /* the hauliers: driven carts (hand trolleys on the platforms and the ramps) between the makers, the stop and the stores */
 if(!SIM.R.role.cart)SIM.role({id:'cart',org:'loj20',name:'haulier',sched:[[0,'HAUL']],speed:SIM.SPEED&&SIM.SPEED.cart?SIM.SPEED.cart:1});
 const Wh=SIM.R.place['lt.stores'];LTS.carts=[];
 for(let c=0;c<4;c++){const a=SIM.actor({id:'lt.cart'+c,role:'cart',org:'loj20',home:'lt.stores',cls:'cart',job:'hauliers'});a.pos={x:Wh.door.x,y:Wh.door.y,z:Wh.door.z};SIM.cart(a);LTS.carts.push(a.id);}
 SIM.economy({goods,every:60,window:1,useShort:true},{settlement:LTS.J});SIM.store('jn.stores',{kind:'warehouse'});
 SIM.economy({goods,every:60,window:1,useShort:true},{settlement:LTS.I});SIM.store('ic.stores',{kind:'warehouse'});
 /* the opening stock: three days of the hold's use; the junction a week of what it sends */
 const pop=LTS.people(),P=SIM.R.place;Object.assign(P['lt.stores'].stock,{fungus:Math.round(pop*LTS.USE.fungus*3),grain:Math.round(pop*LTS.USE.grain*3),wax:Math.round(pop*LTS.USE.wax*3)+20,
  ore:0,plate:LTS.USE.plateDay*3,ice:LTS.USE.iceDay*3});
 Object.assign(P['jn.stores'].stock,{wax:400,plate:200,grain:900,ice:40,ore:0,fungus:0});Object.assign(P['ic.stores'].stock,{ice:200});
 /* THE CARRIERS: the branch shuttle (the train: 25 km at 15 m/s, its dwells), the Travellers down the great shaft */
 SIM.trade({id:'lt.branch',stops:[{settlement:LTS.S,place:'lt.stop'},{settlement:LTS.J,place:'jn.stores'}],cap:600,carriers:1,minutes:45,mins:30,
  goods:{[LTS.S]:['ore','fungus'],[LTS.J]:['wax','plate','grain','ice']},expect:{[LTS.J]:{fungus:LTS.JUNCTION.eats,ore:48},[LTS.S]:{wax:pop*LTS.USE.wax,grain:pop*LTS.USE.grain,ice:LTS.USE.iceDay,plate:LTS.USE.plateDay}}});
 SIM.trade({id:'lt.shaft',stops:[{settlement:LTS.I,place:'ic.stores'},{settlement:LTS.J,place:'jn.stores'}],cap:60,carriers:2,minutes:300,mins:60,
  goods:{[LTS.I]:['ice'],[LTS.J]:['ore']},expect:{[LTS.J]:{ice:LTS.USE.iceDay*1.2}}});
 /* the hourly book-keeping of what no actor draws: the hold's meals, its lamps' wax, its upkeep; the junction's and the
    Ice-cutters' own making (abstract); the bell at each turn; the Big Meeting */
 SIM.stepHooks.push(LTS.hook);
 LTS.problems=LTS.problems.concat(SIM.check());LTS.ms=Date.now()-t0;return LTS;};
LTS.people=()=>SIM.all('actor').filter(a=>!a.driven&&SIM.settlementOf(a)===LTS.S).length;
LTS.hook=function(minute){const h=Math.floor((minute%1440)/60),m=minute%60,day=Math.floor(minute/1440);
 if(m===0){const pop=LTS.people(),U=LTS.USE;
  SIM.supply('fungus',pop*U.fungus/24,false,LTS.S);SIM.supply('grain',pop*U.grain/24,false,LTS.S);SIM.supply('wax',pop*U.wax/24,false,LTS.S);
  SIM.supply('ice',U.iceDay/24,false,LTS.S);SIM.supply('plate',U.plateDay/24,false,LTS.S);
  for(const g in LTS.JUNCTION)if(g!=='eats')SIM.produce('jn.stores',g,LTS.JUNCTION[g]/24);SIM.supply('ore',2,false,LTS.J);SIM.supply('fungus',LTS.JUNCTION.eats/24,false,LTS.J);
  for(const g in LTS.ICECUT)SIM.produce('ic.stores',g,LTS.ICECUT[g]/24);
  const T=LTS.TURNS.find(t=>t[0]===h);if(T)LTS.turns.push({minute,day,hour:h,turn:T[1],atWork:LTS.atWork()});}
 const M=LTS.MEETING,mm=(M.day*24+M.hour)*60;
 if(minute===mm){let n=0;for(const a of SIM.all('actor')){if(a.driven||SIM.settlementOf(a)!==LTS.S||a.role==='child')continue;SIM.command(a,{act:'MEET',place:'lt.loj-hall',mins:M.hours*60,by:'the Big Meeting'});n++;}
  LTS.meetings.push({minute,day,hour:h,called:n});}
 if(minute>mm&&minute<mm+M.hours*60&&minute%10===0)LTS.hands=Math.max(LTS.hands,LTS.countWall().hands);};
/* who is at work now, by turn: the roles on the turns, counted by their schedule's turn (their variant) */
LTS.atWork=function(){const out={};for(const a of SIM.all('actor')){if(a.driven||!a.present)continue;if(a.activity==='WORK'||a.activity==='GUARD'||a.activity==='RULE'||a.activity==='TRADE'){out[a.activity]=(out[a.activity]||0)+1;}}return out;};
/* the count wall: the hold's stocks and the hands in the hall (the shadows the sekketri counts) */
LTS.countWall=function(){const o={};for(const g of ['fungus','grain','wax','ore','plate','ice'])o[g]=Math.round(SIM.stockOf(g,LTS.S));
 o.hands=SIM.all('actor').filter(a=>a.present&&a.place==='lt.loj-hall'&&a.activity==='MEET').length;o.people=LTS.people();return o;};
/* the world run a minute at a time (the clock's day, hour and motion time) */
LTS.run=function(clock,minutes,each){let M=SIM.minute();for(let m=0;m<minutes;m++){M++;clock.day=Math.floor(M/1440);clock.hour=(M%1440+.5)/60;clock.t+=(clock.dayLength||4320)/1440;SIM.step();if(each)each(M);}};
