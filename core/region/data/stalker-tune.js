// ================================================================= CORE/REGION DATA — the Stalker Range's tune (S3)
// openworld/catch-bowl/PLAN-SIM.md section 4 (the owner's answers of 2026-11-24). The province east of the Catch: one
// settlement that matters, a waystation network, and a ruined arcology with no economy at all.
//
// [G data] — plain records and pure functions. No three.js, no DOM.
//
// WHAT THE OWNER RULED (2026-11-24):
//   "Agree keep both" — Ranger HQ stays. It was Gemini's pin and had never been put to them.
//   500 people, and "they get paid a salary and also a small cut of an expeditions profits".
//   "There is no trail towards hub 01. People who go that way tend not to come back."
//   Hub 01 is hidden, attrition-proof, but not immortal: an Heir or a Yusar could change it at risk to themselves, and a
//   powerful PC with many relics, a large army and explosives could bring it down.
//
// THE NETWORK IS MEASURED, NOT DRAWN (2026-11-25, openworld/catch-bowl/tools/gate_route.py). A least-cost search over
// the model's own ground found that the straight lines are unusable -- straight west from Ranger HQ crosses 4,416 and
// 4,507 m -- and that the province is TWO TRUNKS rather than four branches:
//   - the WEST trunk, 538 km and 22.4 days to the Yuni valley, median 2,341 m: the supply line, and the only branch that
//     leaves the region's cut inside it;
//   - the EAST trunk, 148 km from Ranger HQ to a fork at px 1493,1225, where the north-east branch leaves and the
//     south-east carries on;
//   - and NO SOUTH BRANCH: its route runs 761 km for 319 straight and tops out at 11,025 m, which is the search giving
//     up and climbing a wall. Withdrawn. Its premise was that Lake Vapora lay south, and it does not --
//   - LAKE VAPORA IS RANGER HQ'S OWN LAKE. There are two water bodies in 129,000 km2: 352 km2 centred px 1423,1235 at
//     1,904 m, whose shore is 2 km from the fort, and 112 km2 at px 1443,1146 at 2,457 m. "Ranger HQ stands on a lake
//     shore" and "Lake Vapora is the hub" are one statement.
//
// TWO THINGS ARE DELIBERATELY NOT HERE, and PLAN-SIM.md 4e says so: the BOUNTY on Stalkers (SIM.bounty, approved in
// core/region/BANDITS-PIRATES-BOUNTIES-SCOPE.md and not built) and the RANGERS' CUT OF EXPEDITIONS, which needs an
// expedition to take a cut of. Both are S3's second half and wait on that code. What is here is the province's census,
// its network, its salary and Hub 01's record.
var STALKER_TUNE=(function(){'use strict';
const T={},D=1/365;
T.px=(px,py)=>({x:(px-1191)*2000,z:(py-1569)*2000});   /* Xanadu's frame, as CATCH_TUNE's and BOWL_TUNE's */
T.speed=24;      /* a laden pack day on a graben trail: under the Catch's 30 on open floor */
T.winding=1.0;   /* the routes are already measured on the ground, so their km are road km */

/* the goods: the ones the other two tunes declare, restated so this tune stands alone in node (the join merges the
   tables with Object.assign, where a duplicate costs nothing), plus what a garrison in a 0 mm province needs, and the two
   Stalker weapons Ranger HQ buys at a high exchange price (owner, 2026-11-25): pneumatic harpoon guns (`stalker_guns`,
   mounted as gate guns across the Yuni lands) and Ancient-alloy blades (`stalker_blades`, used by an elite Ranger unit) */
T.goods={grain:{unit:'kg'},salt:{unit:'kg'},tea:{unit:'kg'},tools:{unit:'kg'},water:{unit:'l'},fodder:{unit:'kg'},
 cloth:{unit:'kg'},alloy:{unit:'kg'},cells:{unit:'ea'},stalker_guns:{unit:'ea'},stalker_blades:{unit:'ea'},
 arms:{unit:'ea'},explosives:{unit:'kg'},charcoal:{unit:'kg'},medicine:{unit:'kg'},timber:{unit:'kg'}};

/* FORT and POST. A fort eats like a town and burns charcoal and medicine a town does not; a post is eight keepers in a
   bothy. Neither grows anything: PLAN-SIM.md 4a, "it farms nothing at 1,982 m in a 0 mm province", and that is the fact
   that sets the whole province's shape. */
T.diet={fort:{grain:210*D,salt:9*D,tea:3*D,tools:2*D,cloth:.5*D,charcoal:40*D,medicine:.3*D,water:20},
 post:{grain:200*D,salt:8*D,tea:2*D,tools:1*D,charcoal:30*D,water:16}};

T.calendar={windows:{gatewinter:[320,110],foehn:[60,40]}};   /* the pass shuts; the eastern descents warm */
T.yearDay0=259;

/* THE PLACES. Ranger HQ and the ten kept posts, every px measured by gate_route.py off the model's ground, with its
   elevation and its distance to water as the tool read them.
   EVERY ONE CARRIES A WATER NUMBER AND A FODDER NUMBER, and most of them have no water within 40 km: those are the
   network's TANKS AND BINS, filled by the patrol, not springs. That is the same abstraction as Bab al-Hawa's barns, and
   it is here for the same reason -- SIM.trade draws the beasts' water and fodder at EVERY stop, so a stop without both
   is a sink that can never be filled (core/simulation/SCHEMA.md, and PLAN-SIM.md 2x for what it cost to learn). The
   difference from a well is in the record's name and in `tank:true`, not in the arithmetic. */
T.places=[
 {id:'sz85a8i5js',name:'Ranger HQ, the Yuni Emirate\'s Stalker-watch on Lake Vapora',faction:'yunicrown',
  px:1420,py:1242,m:1982,people:500,kind:'fort',well:[60000,20],fodder:900,repairs:true,
  make:{alloy:5000,cells:200},   /* Stalker salvage: the one place a hull or a power cell comes to market with a provenance */
  water_km:2},
 /* the WEST trunk: the supply line, 538 km and 22.4 days to the Yuni valley, 5 kept posts and 17 bothies between them */
 {id:'gate.w1',name:'Wayhouse 1, the west trunk (90 km out)',faction:'yunicrown',px:1402,py:1200,m:1903,people:8,kind:'post',well:[4000,30],fodder:140,tank:true},
 {id:'gate.w2',name:'Wayhouse 2, the west trunk (179 km out)',faction:'yunicrown',px:1389,py:1167,m:1903,people:8,kind:'post',well:[4000,30],fodder:140,tank:true},
 {id:'gate.w3',name:'Wayhouse 3, the west trunk (269 km out)',faction:'yunicrown',px:1372,py:1129,m:1829,people:8,kind:'post',well:[4000,30],fodder:140,tank:true},
 {id:'gate.w4',name:'Wayhouse 4, the west trunk (358 km out)',faction:'yunicrown',px:1344,py:1099,m:1831,people:8,kind:'post',well:[4000,30],fodder:140,tank:true},
 {id:'gate.w5',name:'Wayhouse 5, the west trunk (448 km out)',faction:'yunicrown',px:1303,py:1090,m:1790,people:8,kind:'post',well:[4000,30],fodder:140,tank:true},
 /* the EAST trunk, shared for 148 km by both eastern branches, then the fork at px 1493,1225 */
 {id:'gate.e1',name:'The High Wayhouse, the east trunk (89 km out, the trunk\'s summit)',faction:'yunicrown',px:1462,py:1231,m:2824,people:10,kind:'post',well:[5000,30],fodder:180,tank:true},
 {id:'gate.ne1',name:'Wayhouse, the north-east branch beyond the fork',faction:'yunicrown',px:1504,py:1225,m:2376,people:8,kind:'post',well:[4000,30],fodder:140,tank:true},
 {id:'gate.ne2',name:'The Loom Wayhouse, the north-east branch\'s last (272 km out)',faction:'yunicrown',px:1509,py:1185,m:2297,people:8,kind:'post',well:[4000,30],fodder:140,tank:true},
 {id:'gate.se1',name:'Wayhouse, the south-east branch beyond the fork',faction:'yunicrown',px:1505,py:1270,m:2162,people:8,kind:'post',well:[4000,30],fodder:140,tank:true},
 {id:'gate.se2',name:'The Slabfield Wayhouse, the south-east branch\'s last (357 km out)',faction:'yunicrown',px:1509,py:1313,m:2140,people:8,kind:'post',well:[4000,30],fodder:140,tank:true}];

/* THE NETWORK, as the routes the tool found. `kept` is the posts in order out from the fort; `bothies` is how many
   unmanned day-marches lie between them, which is what the salary keeps and what a check can count. */
T.network={hub:'sz85a8i5js',
 trunks:[{id:'west',to:[1263,1089],km:538,days:22.4,median_m:2341,max_m:3939,kept:['gate.w1','gate.w2','gate.w3','gate.w4','gate.w5'],bothies:17,
   note:'the supply line: everything Ranger HQ eats comes up it, and the one branch that leaves the region\'s cut inside it'},
  {id:'east',to:[1493,1225],km:148,days:6.2,median_m:2420,max_m:2882,kept:['gate.e1'],bothies:5,
   note:'shared by both eastern branches; the fork is at px 1493,1225'}],
 branches:[{id:'northeast',of:'east',to:[1520,1140],km:363,days:15.1,kept:['gate.ne1','gate.ne2'],bothies:7,note:'to the Loom Chasms\' edge'},
  {id:'southeast',of:'east',to:[1530,1350],km:446,days:18.6,kept:['gate.se1','gate.se2'],bothies:10,note:'to the Slabfields\' edge'}],
 withdrawn:[{id:'south',why:'761 km of road for 319 straight (winding 2.39) topping out at 11,025 m: there is no southern graben exit, and its premise that Lake Vapora lay south is wrong -- the lake is Ranger HQ\'s own'}]};

/* HUB 01 is NOT a settlement and must never become one. No polity, no people, no economy, no works, no stop, no road to
   it (the owner: "There is no trail towards hub 01"). It is a record so that a later session has somewhere to hang the
   Stalkers' source, and `pressure` is its one number -- HIDDEN, and PLAN-SIM.md 4b requires it to appear in no
   player-readable report. `endable` records the owner's ruling: attrition will not touch it; a real expedition might. */
T.hub={id:'sodpa02bfv',name:'Hub 01',px:1344,py:1409,m:4351,people:0,faction:null,economy:false,
 pressure:1.0,hidden:true,
 endable:{byAttrition:false,byExpedition:true,
  how:'an Heir or a Yusar could change it at risk to themselves; a powerful PC with many relics, a large army and explosives could bring it down, and the logistics of reaching it are part of the lock (the owner, 2026-11-24)'},
 known:{rangers:'an ancient facility is there; that it is the Stalkers\' source is SURMISED, not confirmed',
  anyone_else:'nothing: people who go that way tend not to come back'}};

T.factions=[{id:'yunicrown',name:'The Yuni Emirate (the crown, not the Merchants\' Guild and not the Geomancers)'}];
T.rivals=[];

/* THE SALARY, and why it is a transfer and not a trade. The owner: the Rangers "get paid a salary". In a goods economy
   a salary for a garrison 538 km up a pass IS its provisioning, so this is the Emirate's standing bill of supplies on
   SIM.transfer -- a fixed bill on a fixed day, "never priced and never answering scarcity"
   (core/simulation/77-sim-6-transfer.js), which is exactly a salary's character and exactly the lever the Emirate can
   cut. It is NOT modelled twice: the convoy that carries it up the west trunk is this same bill seen as carriage, so
   there is no second road feeding the fort, or the garrison would eat two dinners.
   The bill is sized off the fort's own diet: 500 people at T.diet.fort for 30 days, with the arms, explosives and
   timber a Stalker-watch spends, and the posts' share on top. */
T.salary={id:'salary.rangers',from:'crown.yuni',to:'sz85a8i5js',every:30,hour:7,
 goods:{grain:9500,salt:400,tea:130,tools:90,cloth:22,charcoal:1800,medicine:14,arms:40,explosives:300,timber:2500}};
T.pool={id:'crown.yuni',name:'The Yuni valley (the Emirate\'s own country, off this map)',px:1263,py:1089,faction:'yunicrown'};

/* THE PATROLS, one per branch rather than one round over all ten posts, because the posts lie on different trunks and a
   single round would have the same beasts walk the west trunk and the east. Each carries the posts' water, fodder,
   grain, charcoal and tools out and brings the salvage in. THIS IS THE UPKEEP the plan calls "a cost on their books, and
   the reason the salary has to cover more than wages" -- and these are the only roads in the province, since the Stalker
   Gate's own trails belong to a later region. The posts short of the end are selling halts; the last post is the trade
   stop, so the books' legs run fort to far end. */
T.patrols=[
 {id:'caravan.rangers.west',stops:['gate.w1','gate.w2','gate.w3','gate.w4','gate.w5'],cap:60000,carriers:3},
 {id:'caravan.rangers.ne',stops:['gate.e1','gate.ne1','gate.ne2'],cap:40000,carriers:2},
 {id:'caravan.rangers.se',stops:['gate.e1','gate.se1','gate.se2'],cap:40000,carriers:2}];
T.patrolGoods={out:['water','fodder','grain','charcoal','tools','salt','tea'],back:['alloy','cells']};
T.caravan={beasts:40,eat:{water:30,fodder:6},loss:.5,maxDays:6};
T.kgPerBeast=200;

/* S3 PART 2 (2026-11-25, PLAN-SIM.md section 4b-4e & owner ruling 2026-11-25):
   1. Standing Stalker bounty implemented as a HIGH EXCHANGE PRICE at Ranger HQ (`sz85a8i5js`, `yunicrown`) for salvaged
      Stalker pneumatic harpoon guns (`stalker_guns`, from `st_harpooner`) and Ancient-alloy hooked blades (`stalker_blades`,
      from `st_blade`), paid `1.0x` (`targetKind: 'stalker'`) in coin and high-value garrison stores (`grain`, `tea`, `salt`,
      `arms`, `medicine`, `tools`).
   2. Downstream weapon allocation (`T.stalkerWeapons`):
      - `stalker_blades` are issued at Ranger HQ (`sz85a8i5js`) to equip an elite Ranger unit (`rangers.blade_watch`, the
        White-Blade Watch), raising Ranger warrant-posse strength as troopers are armed;
      - `stalker_guns` are mounted on Ranger HQ's own Lake Vapora gate and dispatched down the West Trunk to `crown.yuni`
        to be mounted as gate guns at important places throughout the Yuni lands (Yuni's Caravan, North, Shepherds', River
        and Potters' Gates, the Grand Vault citadel gate, Locus's causeway gate, and Verge's lower city gate; LORE.md 6.11).
   3. Range salvage expeditions staged out of Ranger HQ into the Stalker Range (completely independent of passing road
      traffic!): Ranger HQ takes its `cut` (`15%`, owner ruling 2026-11-24) of expedition bulk salvage while the party turns
      in salvaged Stalker pneumatic guns and Ancient-alloy blades at Ranger HQ's standing exchange board.
   4. Hidden source config (`stalkerSource`): drives `54-region-outlaws.js`'s private WeakMap loop (`active | mastered |
      dead`) without ever exposing `"pressure"` or `sodpa02bfv` in any player-readable report.
   5. `BF-06` Glass-Eaters (`Naphtha-Breathers`) operating on the western Yuni <-> Stalker Gate approach (`orderliness: 0.36`). */
T.bounties={
 seed:20261125,
 warrants:[
  {id:'bounty.rangers.stalker.gun',target:'st_harpooner',targetKind:'stalker',trophyGood:'stalker_guns',polity:'yunicrown',
   issuerSettlement:'sz85a8i5js',tier:2,amount:420,standing:true,
   goodsReward:{grain:55,tea:2,salt:4,medicine:1,tools:1},
   reason:'standing Ranger high exchange price for a salvaged Stalker pneumatic gun (mounted as gate guns across the Yuni lands)'},
  {id:'bounty.rangers.stalker.blade',target:'st_blade',targetKind:'stalker',trophyGood:'stalker_blades',polity:'yunicrown',
   issuerSettlement:'sz85a8i5js',tier:2,amount:280,standing:true,
   goodsReward:{grain:35,tea:1,salt:2,arms:1},
   reason:'standing Ranger high exchange price for a salvaged Stalker Ancient-alloy blade (used by the elite Ranger unit)'},
  {id:'bounty.rangers.bf06.boss',target:'BF-06.boss.0',targetKind:'outlaw',outlawFaction:'BF-06',polity:'yunicrown',
   issuerSettlement:'sz85a8i5js',tier:3,amount:900,standing:false,
   goodsReward:{grain:120,arms:4},
   reason:'warrant on The Cracked Retort (Glass-Eaters HQ in Loom Chasms)'}],
 manhunters:[{id:'mh.vapora.watch',name:'Lake Vapora Warrant-Rangers',zone:'mid-basin-gate',polity:'yunicrown',strength:10}]};

T.stalkerWeapons={
 eliteUnit:{
  id:'rangers.blade_watch',
  name:'The White-Blade Watch (Elite Ranger Unit)',
  settlement:'sz85a8i5js',
  good:'stalker_blades',
  bladesPerTrooper:2,
  maxTroopers:60,
  manhunterId:'mh.vapora.watch'
 },
 gateGuns:{
  hub:'sz85a8i5js',
  yuniPool:'crown.yuni',
  good:'stalker_guns',
  dispatchEveryDays:30,
  sites:[
   {id:'sz85a8i5js.lake_gate',name:'Lake Vapora West Gate, Ranger HQ',settlement:'sz85a8i5js',quota:2},
   {id:'yuni.caravan_gate',name:'Caravan Gate, Yuni',settlement:'crown.yuni',quota:4},
   {id:'yuni.north_gate',name:'North Gate, Yuni',settlement:'crown.yuni',quota:4},
   {id:'yuni.grand_vault',name:'Grand Vault & Emir\'s Citadel Gate, Yuni',settlement:'crown.yuni',quota:4},
   {id:'yuni.shepherds_gate',name:'Shepherds\' Gate, Yuni',settlement:'crown.yuni',quota:2},
   {id:'yuni.river_gate',name:'River Gate, Yuni',settlement:'crown.yuni',quota:2},
   {id:'yuni.potters_gate',name:'Potters\' Gate, Yuni',settlement:'crown.yuni',quota:2},
   {id:'locus.causeway_gate',name:'Refinery Causeway Gate, Locus',settlement:'crown.yuni',quota:2},
   {id:'verge.lower_gate',name:'Lower City Gate, Verge',settlement:'crown.yuni',quota:2}
  ]
 }
};

T.expeditions=[
 {id:'exp.rangers.salvage.north',base:'sz85a8i5js',partyPool:'crown.yuni',everyDays:45,firstDay:22,cut:0.15,
  supplies:{grain:160,water:360,explosives:16,tools:4},yield:{alloy:340,cells:16},
  trophyWarrants:{stalker_guns:'bounty.rangers.stalker.gun',stalker_blades:'bounty.rangers.stalker.blade'}},
 {id:'exp.rangers.salvage.east',base:'sz85a8i5js',partyPool:'crown.yuni',everyDays:60,firstDay:38,cut:0.15,
  supplies:{grain:200,water:440,explosives:22,tools:5},yield:{alloy:420,cells:20},
  trophyWarrants:{stalker_guns:'bounty.rangers.stalker.gun',stalker_blades:'bounty.rangers.stalker.blade'}}];

T.outlaws={
 seed:20261125,
 zones:[{id:'mid-basin-gate',name:'Mid Basin & West Stalker Gate',polity:'yunicrown',orderliness:0.36,targetOrder:0.36,
  legs:['caravan.rangers.west']}],
 factions:[{id:'BF-06',template:'BF-06',zone:'mid-basin-gate',initialSubs:2,legs:['caravan.rangers.west']}]};

T.stalkerSource={initial:1.0,attritionFloor:0.25,regenPerWeek:0.06,dropPerKill:0.08,status:'active'};

/* ---- the province on its own, for the standalone test: the fort, the posts, the patrols, and the salary from an
   off-map pool standing for the Emirate's own country (the Yuni valley, px 1263,1089). */
T.valley=function(o){o=o||{};const K=o.scale==null?25:o.scale,yr=365,days=o.days==null?400:o.days;
 const rate=(perYr,crew)=>perYr/(Math.max(1,Math.round(crew/K))*K*yr*12);
 const mk=P=>{const p=T.px(P.px,P.py),diet=T.diet[P.kind],n=P.people,works=[];
  works.push({id:P.id+'.market',kind:'market',name:P.kind==='fort'?'the quartermaster\'s yard':'the wayhouse yard',
   crew:Math.max(1,Math.min(60,Math.round(n*.1))),out:[],rate:0});
  if(P.well){const[lDay,store]=P.well,crew=Math.max(1,Math.round(n*.04));
   works.push({id:P.id+'.well',kind:'well',name:P.tank?'the water tank, filled by the patrol':'the lake intake and the cisterns',
    crew,out:['water'],rate:rate(lDay*yr,crew),cap:lDay*store,site:{kind:'aquifer',amount:lDay*store,regen:lDay}});}
  if(P.fodder){const crew=Math.max(1,Math.round(n*.08));
   works.push({id:P.id+'.fodder',kind:'fodder-yard',name:P.tank?'the fodder bin, filled by the patrol':'the hay barns, carried up the pass',
    crew,out:['fodder'],rate:rate(P.fodder*yr,crew),cap:P.fodder*60});}
  Object.keys(P.make||{}).forEach(g=>{const crew=Math.max(2,Math.round(n*.08));
   works.push({id:P.id+'.'+g,kind:'salvage',name:'the salvage yard\'s '+g,crew,out:[g],rate:rate(P.make[g],crew)});});
  if(P.repairs)works.push({id:P.id+'.repairs',kind:'repairs',name:'the smith, the surgeon and the saddlers',crew:Math.max(4,Math.round(n*.03)),out:[],rate:0});
  const start={};Object.keys(diet).forEach(g=>{start[g]=Math.ceil(n*diet[g]*days);});
  if(P.well)start.water=P.well[0]*3;
  if(P.fodder)start.fodder=P.fodder*10;
  if(P.kind==='fort'){start.explosives=(start.explosives||0)+600;start.arms=(start.arms||0)+120;start.medicine=(start.medicine||0)+90;start.tools=(start.tools||0)+90;}
  return{id:P.id,name:P.name,faction:P.faction,people:n,x:p.x,z:p.z,scale:K,eats:Object.assign({},diet),keepDays:20,start,works};};
 const S=T.places.map(mk);
 /* the off-map pool the salary comes out of: it holds the bill many times over, as Xanadu's gateways do */
 const pp=T.px(T.pool.px,T.pool.py),pstart={};
 Object.keys(T.salary.goods).forEach(g=>{pstart[g]=T.salary.goods[g]*40;});
 S.push({id:T.pool.id,name:T.pool.name,faction:T.pool.faction,people:0,x:pp.x,z:pp.z,scale:K,
  eats:{},keepDays:0,start:pstart,works:[{id:T.pool.id+'.market',kind:'market',name:'the Emirate\'s stores',crew:1,out:[],rate:0}]});
 const by={};S.forEach(s=>{by[s.id]=s;});
 const F=T.factions.map(f=>f.id);
 return{seed:20261125,scale:K,start:0,calendar:T.calendar,goods:T.goods,factions:T.factions,
  relations:[].concat(...F.map(a=>F.filter(b=>b!==a).map(b=>({a,b,stance:'friendly'})))),
  settlements:S,roads:T.roads(by),transfers:[T.salary],
  bounties:JSON.parse(JSON.stringify(T.bounties)),
  stalkerWeapons:JSON.parse(JSON.stringify(T.stalkerWeapons)),
  expeditions:JSON.parse(JSON.stringify(T.expeditions)),
  outlaws:JSON.parse(JSON.stringify(T.outlaws)),
  stalkerSource:Object.assign({},T.stalkerSource)};};

/* the patrol rounds, built off whatever settlement table they are given, so the valley and the join share one builder */
T.roads=function(by){const HQ=T.network.hub;
 const mins=km=>Math.max(240,Math.round(km/T.speed*1440));
 const legKm=(a,b)=>{const A=by[a],B=by[b];return A&&B?Math.hypot(A.x-B.x,A.z-B.z)/1000*T.winding:0;};
 return T.patrols.filter(R=>R.stops.every(s=>by[s])&&by[HQ]).map(R=>{
  const out=[HQ].concat(R.stops),back=out.slice(1,-1).reverse(),stops=out.concat(back),n=stops.length;
  const legs=stops.map((s,i)=>mins(legKm(s,stops[(i+1)%n])));
  const endIdx=out.length-1,halts=[],sells=[];
  stops.forEach((s,i)=>{if(i===0||i===endIdx)return;halts.push(i);sells.push(i);});
  return{id:R.id,stops,legs,mins:T.patrol_mins==null?600:T.patrol_mins,cap:R.cap,carriers:R.carriers,
   stagger:Math.round(legs.reduce((a,b)=>a+b,0)/R.carriers),keep:10,want:40,
   goods:{[HQ]:T.patrolGoods.out.filter(g=>T.goods[g]),[R.stops[R.stops.length-1]]:T.patrolGoods.back.filter(g=>T.goods[g])},
   halts,sells,forHalts:['water','fodder','grain','charcoal'],
   provision:{beasts:Math.round(R.cap/T.kgPerBeast),eat:T.caravan.eat,loss:T.caravan.loss,maxDays:T.caravan.maxDays,home:0}};});};

/* ================================================================= THE JOIN (S3 into S2's valley)
   `BV` is the Bowl-joined valley -- BOWL_TUNE.join(CATCH_TUNE.join(XAN_TUNE.valley())) -- so this is the fourth plan
   into the frame. The Emirate's pool stays an off-map pool: the Yuni valley is not in this region's cut (PLAN.md 2a,
   "the one branch that leaves the region's cut inside it"), so unlike Jabal it has no settlement to come home to. */
T.join=function(BV,o){o=o||{};
 const B=T.valley({scale:BV.scale==null?25:Math.min(25,BV.scale),days:o.days});
 const V=Object.assign({},BV);
 V.goods=Object.assign({},BV.goods,T.goods);
 V.factions=BV.factions.concat(T.factions.filter(f=>!BV.factions.some(g=>g.id===f.id)));
 const rel=BV.relations.slice(),has=(a,b)=>rel.some(r=>r.a===a&&r.b===b);
 V.factions.forEach(f=>V.factions.forEach(g=>{if(f.id!==g.id&&!has(f.id,g.id))rel.push({a:f.id,b:g.id,stance:'friendly'});}));
 V.relations=rel;
 V.calendar=Object.assign({},BV.calendar,{windows:Object.assign({},BV.calendar.windows,T.calendar.windows)});
 V.settlements=BV.settlements.concat(B.settlements.filter(s=>!BV.settlements.some(q=>q.id===s.id)));
 const by={};V.settlements.forEach(s=>{by[s.id]=s;});
 V.roads=BV.roads.concat(T.roads(by));
 V.transfers=(BV.transfers||[]).concat([T.salary]);
 V.bounties={seed:T.bounties.seed,warrants:((BV.bounties&&BV.bounties.warrants)||[]).concat(JSON.parse(JSON.stringify(T.bounties.warrants))),
  manhunters:((BV.bounties&&BV.bounties.manhunters)||[]).concat(JSON.parse(JSON.stringify(T.bounties.manhunters)))};
 V.stalkerWeapons=JSON.parse(JSON.stringify(T.stalkerWeapons));
 V.expeditions=(BV.expeditions||[]).concat(JSON.parse(JSON.stringify(T.expeditions)));
 V.outlaws={seed:T.outlaws.seed,zones:((BV.outlaws&&BV.outlaws.zones)||[]).concat(JSON.parse(JSON.stringify(T.outlaws.zones))),
  factions:((BV.outlaws&&BV.outlaws.factions)||[]).concat(JSON.parse(JSON.stringify(T.outlaws.factions)))};
 V.stalkerSource=Object.assign({},T.stalkerSource);
 V._stalker={places:T.places.length,posts:T.places.filter(P=>P.kind==='post').length,people:T.places.reduce((n,P)=>n+P.people,0),
  patrols:T.patrols.map(R=>R.id),salary:T.salary.id,pool:T.pool.id,hub:T.hub.id,hubIsASettlement:false,
  bountyWarrants:['bounty.rangers.stalker.gun','bounty.rangers.stalker.blade'],
  eliteUnit:T.stalkerWeapons.eliteUnit.id,gateGunSites:T.stalkerWeapons.gateGuns.sites.length,expeditionCut:0.15,
  bothies:T.network.trunks.concat(T.network.branches).reduce((n,x)=>n+x.bothies,0)};
 return V;};
return T;})();
if(typeof module!=='undefined')module.exports=STALKER_TUNE;
