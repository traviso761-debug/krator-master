// ================================================================= PINNACLE ROCK — the full sim's table (the region host)
// [G data] The owner, 2026-11-12: "implement full sim to the level of isle demo including needs and happiness". The town's
// people on core/region's host (core/region 40-49, the isle demo's lifted), as the isle demo's towns are declared from
// their plans: this is the table that host reads (its RH.TUNE.sim), the isle's (settlements/isle-demo/src/15-isle-tune.js)
// adapted to the Beast Riders: their buildings (kits/beast-riders and Girder's and Mav's Refuge's ports, as PRT lays the
// town: src/54-pr-town.js), their floor ring's crops (src/55-pr-farms.js), their foods (fonio and millet, rice, pigeon pea,
// gourds, the orchards' stack figs and ember plums, the beetle houses' and pens' protein, the fungus houses), their trades.
// The needs, happiness, loyalty and unrest are the isle's (Voth's) as they are: the people's meters are the same people's.
// The plan is the page's, read from plan/pinnacle.json (tools/export_plan.py); the node run is tests/test-pr-sim.js.
//   PR_SIM.households     households a dwelling key holds (the census: 489 of them, ~2,930 people at six a household)
//   PR_SIM.sim            the host's table (core/region README: towns, kinds, field, jobs, sched, needs, items, economy, unrest)
var PR_SIM=(function(){'use strict';
const T={};
T.households={br_port_girder_dwelling:1,br_port_girder_house:1,br_bldg_terrace_row:4,br_bldg_great_house:2,br_bldg_chief_compound:3};
const FOODS=['grain','rice','pulse','gourd','fruit','meat','bread','fungus'];
const shop=FOODS.slice();
T.sim={
 seed:20261112,
 clock:{secPerMinute:18,stepMax:900,lag:8,reach:6000,start:0},
 track:40,
 culture:{faction:'beast-riders',factionName:'The Beast Riders',tag:'beast-rider',names:'beast-rider'},
 towns:{'Pinnacle Rock':{id:'staiytii0y',name:'Pinnacle Rock',faction:'beast-riders',prefix:'p',carts:30,inputs:{bread:{grain:1}}}},
 activities:['SLEEP','EAT','REST','IDLE','WORK','BUY','SOCIALIZE','WORSHIP','HAUL','STUDY','HOUSEWORK','PATROL'],
 indoor:['SLEEP','REST','IDLE'],
 home:{per:6,acts:['SLEEP','EAT','REST','IDLE','HOUSEWORK']},
 /* the Beast Riders' buildings as places (the isle's kinds by the same rules: slots per 100 m2 of the footprint) */
 kinds:{
  br_port_girder_dwelling:['home',{},{cls:'poor'}],br_bldg_terrace_row:['home',{},{cls:'poor'}],
  br_port_girder_house:['home',{},{cls:'middle'}],br_bldg_great_house:['home',{},{cls:'rich'}],
  br_bldg_chief_compound:['residence',{WORK:1},{cls:'rich'}],
  br_bldg_barracks:['barracks',{WORK:0},{mess:true,posts:'beds'}],br_bldg_watch_tower:['watchtower',{WORK:3}],br_bldg_beacon_tower:['watchtower',{WORK:2}],
  br_bldg_market_hall:['market',{WORK:3,BUY:5,SOCIALIZE:12},{open:[6,21],out:true,wander:4,shop:'market'}],
  br_port_girder_stall:['shop',{WORK:3,BUY:4},{open:[6,21],shop:'staples'}],br_bldg_shophouse:['shop',{WORK:3,BUY:4},{open:[6,21],shop:'staples'}],
  br_bldg_butcher:['butcher',{WORK:2.5,BUY:3},{open:[6,18],shop:'meat'}],br_bldg_bakehouse:['bakehouse',{WORK:2.5,BUY:3},{open:[5,18],shop:'bread'}],
  br_bldg_mead_hall:['tavern',{WORK:2.5,EAT:6,SOCIALIZE:16,BUY:6},{open:[10,24],shop:'meal'}],br_bldg_riders_inn:['inn',{WORK:2.5,EAT:5,SOCIALIZE:8},{open:[6,23],shop:'meal'}],
  br_bldg_weaver:['weaver',{WORK:2.5}],br_bldg_potter:['potter',{WORK:2.5}],br_bldg_smithy:['smithy',{WORK:2.5}],br_bldg_tannery:['tannery',{WORK:2.5}],
  br_bldg_ropewalk:['workshop',{WORK:2.5}],br_bldg_storehouse:['warehouse',{WORK:2.5}],br_bldg_granary:['granary',{WORK:1}],
  br_bldg_mill:['mill',{WORK:2}],br_bldg_fungus_house:['fungus',{WORK:2.5}],br_bldg_beetle_pen:['pens',{WORK:2.5},{out:true,wander:5}],
  br_bldg_quarry:['quarry',{WORK:2.5},{out:true,wander:6}],br_bldg_hauling_yard:['quay',{WORK:1.7},{out:true,wander:6}],br_bldg_beast_stage:['quay',{WORK:1.7},{out:true,wander:6}],
  br_bldg_toll_house:['customs',{WORK:2.5}],br_port_girder_hall:['hall',{WORK:2.5,SOCIALIZE:8},{open:[7,21]}],
  br_bldg_temple:['temple',{WORK:2.5,WORSHIP:8,STUDY:10},{open:[5,21]}],br_port_mavs_shrine:['shrine',{WORK:1,WORSHIP:6,STUDY:10},{open:[5,21]}],
  br_bldg_school:['school',{WORK:2.5,STUDY:60},{open:[6,16]}],br_bldg_healer:['healer',{WORK:2.5}],
  br_bldg_raptor_stable:['stable',{WORK:1.5}],br_bldg_great_byre:['stable',{WORK:1.5},{out:true,wander:8}],br_bldg_rookery_tower:['rookery',{WORK:3}]},
 /* the floor ring's cells (55: crop, paddy, orchard, pen, garden, farmstead) as parcels */
 /* hands a 100 m2: the ring's ~72 ha worked by ~300 (the proposal's crew), not the isle's garden plots' density */
 field:{crop:['field',{WORK:0.045},{out:true,wander:8,open:[5,19]}],paddy:['field',{WORK:0.06},{out:true,wander:8,open:[5,19]}],
  orchard:['orchard',{WORK:0.03},{out:true,wander:8,open:[5,19]}],garden:['orchard',{WORK:0.05},{out:true,wander:6,open:[5,19]}],
  pen:['pens',{WORK:0.05},{out:true,wander:5,open:[5,19]}],farmstead:['field',{WORK:0.04},{out:true,wander:6,open:[5,19]}]},
 jobs:{
  farmhand:{kinds:['field','orchard','pens']},docker:{kinds:['quay','warehouse','granary','customs']},
  trader:{kinds:['market','shop','butcher']},baker:{kinds:['bakehouse','mill']},keeper:{kinds:['tavern','inn']},
  craftsman:{kinds:['weaver','potter','smithy','workshop','tannery']},labourer:{kinds:['quarry','fungus']},
  groom:{kinds:['stable','rookery']},soldier:{kinds:['barracks','watchtower'],homes:['barracks','home'],sched:'watch',
   patrol:{share:1/3,role:'watchman',sched:'patrol',at:['market','green','plaza'],cap:2,every:30}},
  official:{kinds:['hall','school','healer','temple','residence','shrine']}},
 homes:['home','residence','barracks'],
 ages:{children:0.36,elders:0.08,bands:{pupil:[6,12],child:[9,15],adult:[16,59],elder:[60,82]}},
 mix:{cell:150},
 greens:{per:4,cap:60,open:[5,22]},parks:{types:['park','plaza'],per:1,cap:400,open:[5,22]},
 sched:{
  work:[[0,'SLEEP'],[5,'EAT'],[6,'WORK'],[17,'SOCIALIZE'],[19,'EAT'],[20,'REST'],[22,'SLEEP']],
  watch:[[0,'SLEEP'],[6,'EAT'],[7,'WORK'],[18,'EAT'],[19,'SOCIALIZE'],[21,'SLEEP']],
  patrol:[[0,'SLEEP'],[6,'EAT'],[7,'PATROL'],[18,'EAT'],[19,'SOCIALIZE'],[21,'SLEEP']],
  kin:[[0,'SLEEP'],[7,'EAT'],[8,'IDLE'],[10,'SOCIALIZE'],[13,'REST'],[15,'SOCIALIZE'],[18,'EAT'],[19,'REST'],[21,'SLEEP']],
  pupil:[[0,'SLEEP'],[6,'EAT'],[7,'STUDY'],[13,'SOCIALIZE'],[15,'HOUSEWORK'],[17,'SOCIALIZE'],[18,'EAT'],[19,'REST'],[21,'SLEEP']],
  child:[[0,'SLEEP'],[6,'EAT'],[7,'HOUSEWORK'],[11,'SOCIALIZE'],[13,'HOUSEWORK'],[16,'SOCIALIZE'],[18,'EAT'],[19,'REST'],[21,'SLEEP']],
  elder:[[0,'SLEEP'],[6,'EAT'],[7,'HOUSEWORK'],[10,'SOCIALIZE'],[12,'REST'],[15,'HOUSEWORK'],[17,'SOCIALIZE'],[18,'EAT'],[19,'REST'],[21,'SLEEP']],
  free:['SOCIALIZE','IDLE','REST']},
 /* the isle's (Voth's) needs, as they are */
 needs:{list:['eat','drink','socialize','relax','contemplate','sleep','material'],
  rate:{eat:4,drink:3,socialize:2,relax:2,contemplate:0.5,sleep:4.2,material:0.15},
  fill:{SLEEP:{sleep:14,relax:2,eat:2,drink:3},WORK:{drink:6},HAUL:{drink:6},REST:{sleep:6,relax:10,drink:8},
   EAT:{eat:24,drink:12,socialize:1,relax:1},SOCIALIZE:{socialize:24,relax:4,drink:6},IDLE:{relax:7,drink:8},
   WORSHIP:{contemplate:45,socialize:5},STUDY:{contemplate:10,socialize:4,drink:4},HOUSEWORK:{drink:6,socialize:2,relax:2},
   BUY:{socialize:4,relax:2},PATROL:{drink:6,socialize:1}},
  work:{drink:4,eat:1.5,relax:1},
  labour:{farmhand:1,labourer:1,docker:1,craftsman:0.6,groom:0.6,soldier:0.6,watchman:0.7,baker:0.5,keeper:0.4,trader:0.3,official:0.2},
  byTrade:{soldier:{material:0.5},watchman:{material:0.5},official:{contemplate:1.3},child:{material:0},pupil:{material:0}},
  weight:{eat:1.5,drink:1.5,sleep:1.3,socialize:1,relax:1,contemplate:0.8,material:1},
  traits:{chatty:{socialize:1.33},loner:{socialize:0.67},pious:{contemplate:1.33},worldly:{contemplate:0.67},glutton:{eat:1.33},
   ascetic:{eat:0.67,material:0.67},restless:{relax:1.33},steady:{relax:0.67}},
  free:['SOCIALIZE','REST','IDLE','WORSHIP'],dwell:60,jitter:30,keep:1.25,done:12,
  bands:[{label:'content',min:70,eff:1},{label:'uneasy',min:50,eff:0.92},{label:'unhappy',min:30,eff:0.8},{label:'restless',min:0,eff:0.65}],
  loyalty:{tau:4320,bands:[{label:'loyal',min:60},{label:'wavering',min:40},{label:'disloyal',min:0}]},
  vital:{eat:60,drink:60},
  pain:1.5,init:{material:[0,55],eat:[10,40],drink:[10,40],socialize:[10,40],relax:[10,40],contemplate:[0,15],sleep:[0,20]}},
 /* the Beast Riders' things: a tunic, a wrap and boots (hide), a rider's leather jerkin, a riding hat; the mead hall's cup,
    a woven rug, a lamp, a carved charm for treats; the tools as the isle's, in the Riders' iron where there is iron */
 items:{foods:FOODS,shops:{market:shop,staples:shop,meat:shop,bread:shop,meal:['meal']},
  worn:{shirt:{cat:'clothes',slot:'torso',life:90,good:'garments',material:8},wrap:{cat:'clothes',slot:'legs',life:90,good:'garments',material:8},
   sandal:{cat:'clothes',slot:'feet',life:120,good:'boots',material:8},cuirass:{cat:'armour',slot:'torso',layer:'armour',life:180,good:'armour',material:10},
   sarong:{cat:'clothes',slot:'legs',life:90,good:'garments',material:8},'sun hat':{cat:'clothes',slot:'head',life:120,good:'hats',material:6},
   club:{cat:'arms',slot:'rhand',life:720,good:'tools',material:15}},
  setsBy:{poor:2,middle:3,rich:4},sarong:{share:0.5},hat:{share:0.4,jobs:['farmhand','labourer','docker','groom']},
  club:{share:0.25},racks:['docker','soldier','watchman'],hurt:0.006,heal:3,
  medicine:{poultice:{cat:'medicine',good:'poultices'}},lack:4,sets:2,armed:['soldier','watchman'],
  household:{pot:{cat:'household',slot:'lhand',life:60,good:'pots',material:20}},
  tools:{'stone tool':{cat:'tool',workLife:1000,good:'tools',kinds:['orchard','smithy','workshop','tannery'],roles:['labourer'],prefer:['iron tool']},
   'iron tool':{cat:'tool',workLife:3000,good:'irontools',base:'stone tool'},
   'wood tool':{cat:'tool',workLife:1500,good:'tools',kinds:['pens','weaver','potter'],roles:['groom','official']},
   hoe:{cat:'tool',workLife:1500,good:'tools',kinds:['field'],prefer:['iron tool']},
   cookpot:{cat:'tool',workLife:1500,good:'pots',roles:['baker','keeper']}},
  treats:{'mead cup':{cat:'luxury',material:25,good:'mead'},rug:{cat:'household',material:40,good:'rugs'},
   lamp:{cat:'household',material:45,good:'lamps'},charm:{cat:'luxury',material:70,good:'charms'}},
  treat:{at:55,items:[[0,'mead cup'],[0.3,'rug'],[0.5,'lamp'],[0.85,'charm']],mix:true},
  noPot:0.7,wealthSpread:{poor:[0,0.2],middle:[0.35,0.65],rich:[0.8,1]},
  wares:{market:['shirt','wrap','sarong','sun hat','sandal','pot','stone tool','wood tool','hoe','rug','lamp','charm'],
   shop:['shirt','wrap','sarong','sun hat','sandal','pot','stone tool','wood tool','hoe','rug','lamp','charm'],
   weaver:['shirt','wrap','rug','sarong','sun hat'],workshop:['sandal','stone tool','charm','wood tool','hoe','club'],smithy:['cuirass','iron tool'],
   potter:['pot','cookpot','lamp'],tavern:['mead cup'],healer:['poultice']},
  meals:2,perMeal:2,low:1,days:3,stagger:0.5,mins:15,cool:120,storeDays:[1,3.5],eatOut:{base:0.04,wealth:0.08},wealth:{poor:0,middle:0.5,rich:1}},
 economy:{
  goods:FOODS.concat(['hides','leather','cloth','garments','boots','armour','tools','irontools','iron','pots','mead','rugs','lamps','charms','poultices','hats','salt','stone','silk']),
  inputs:{bread:{grain:1},leather:{hides:1},garments:{cloth:2},boots:{leather:1},armour:{leather:3},irontools:{iron:2},mead:{fruit:1},lamps:{gourd:1}},
  every:30,window:1,imports:{days:2,scan:60},cart:{cap:400,load:10,unload:10,minLoad:40,urgent:1},
  minLoad:{armour:5,tools:5,irontools:5,pots:10,mead:10,rugs:10,lamps:10,charms:5,poultices:5,hats:10},
  govern:{every:60,cover:3,ti:1.5,alpha:0.3,min:0.3,max:1.5,smooth:2,window:3,minBy:{rugs:0.02,mead:0.05,pots:0.1,hats:0.02},
   least:{mead:600,rugs:200,lamps:400,hats:200,charms:50,pots:300,garments:300,boots:200,tools:60,irontools:30,poultices:50,stone:300}},
  spoil:{meat:0.04,bread:0.06,fruit:0.04,gourd:0.02,fungus:0.05,pulse:0.003,grain:0.003,rice:0.003},
  /* the floor ring's crops (55) as goods: a serving of grain, rice, pulse, gourd or fruit; the beetle pens and the kitchen
     gardens give meat and fruit */
  crops:{fonio:'grain',millet:'grain',rice:'rice','pigeon pea':'pulse',gourd:'gourd','stack fig':'fruit','ember plum':'fruit','beetle pen':'meat','kitchen garden':'fruit'},
  producers:{
   /* the ring's yield is its land's: ~72 ha at ~1 t a hectare and its orchards, about 1,100 servings a day (a quarter-kilo
      serving), a tenth of the town's; the rest comes from the clearings and the bands (PR_TUNE.valley) */
   field:{rate:0.35,cap:3000},orchard:{rate:0.4,cap:3000},pens:{out:['meat'],rate:0.4,cap:1500},
   bakehouse:{out:['bread'],rate:6,cap:1500},fungus:{out:['fungus'],rate:5,cap:1500},
   weaver:{out:['cloth','garments','rugs','hats'],rate:2,cap:600},potter:{out:['pots','lamps'],rate:0.2,cap:400},tavern:{out:['mead'],rate:1.5,cap:600},
   healer:{out:['poultices'],rate:0.25,cap:200},quarry:{out:['stone'],rate:0.4,cap:400},tannery:{out:['leather'],rate:0.5,cap:400},
   workshop:{out:['boots','tools','charms'],rate:0.6,cap:400},smithy:{out:['armour','irontools'],rate:0.05,cap:100}},
  warehouses:['warehouse','granary'],
  /* the town opens its year (day 0, the dry season's middle) on its granaries: dry staples for the four months until the
     bands come home, not the ring's mix (its fruit and meat rot at 4 % a night): 3,000 people at 4 servings, an eighth of a
     kilo each (PR_TUNE.valley's half-kilo of grain-equivalent a day) */
  startDays:3,startLots:{grain:1100000,rice:150000,pulse:200000,cloth:1000,pots:500,garments:500,boots:200,armour:20,salt:300,stone:40,leather:40,hides:200,tools:60,irontools:20,iron:100,mead:300,rugs:200,lamps:400,charms:50,poultices:50,hats:200},
  salt:{keeps:['meat'],keep:0.75,per:4,season:1.15}},
 unrest:{smooth:5,hyst:5,stages:{grumble:50,demand:40,strike:30,treason:20},grumble:{arrest:0.7},
  demand:{goods:2,days:5,keep:2,every:5,grant:0.4,granted:{n:-10,days:10},refused:{n:5,days:10}},strike:{after:5,share:0.5,days:1}}
};
return T;})();
