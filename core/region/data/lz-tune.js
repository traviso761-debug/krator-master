// ================================================================= CORE/REGION DATA — the Lizardmen's tune (Z0-Z2)
// [G data] core/simulation/PROPOSAL-LIZARDMEN.md (the owner, 2026-11-16: "the lizardmen will be autarkic but trade among their
// own villages ... exchange goods through customs that make sense only to them ... a command economy directly moving goods
// and agents with little concern for 'profit'"; 2026-11-17: "implement the lizardmen settlements and tune"). The Lizardmen's
// country as data for core/region's valley host (core/region/50-region-valley.js, H.simValley), in Xanadu's frame
// (XAN_TUNE.px: metres from px 1191,1569, 2 km a pixel), so it can join the East Rift at Z5. Read in place by the tests
// (core/region/tests/test-lizardmen.js) and by the settlement pages (settlements/gila and the towns after it).
//   LZ_TUNE.px(px, py)     metres in Xanadu's frame
//   LZ_TUNE.goods          every good and its unit (kg)
//   LZ_TUNE.diet           a person's year by the kind of place (town, cavern, warren), kg
//   LZ_TUNE.places         the towns, the countrysides (the warrens, in bulk) and the two reliquaries, with the owner's people
//                          (section 6 of the proposal: Basilisk ~15,000; Tuatara, Komodo, Gila, Iguana ~3,000; the Tubes
//                          ~1,000; the warrens 20,000-40,000: 30,000 here, 18,000 east and 12,000 west) and what each makes
//                          a year. GILA IS GL_REC (settlements/gila/src/88-gl-records.js): its people, works and needs are
//                          read from the village's own records when they are loaded, so the two cannot drift (the test holds them)
//   LZ_TUNE.coil           the Coil (section 3): two loops that meet at the capital, the west (Iguana, Gila, the west
//                          reliquary, the Tubes, the western warrens) and the east (the east reliquary, Tuatara, Komodo, the
//                          eastern warrens). Outward is forward round a loop, away from the capital; inward is back
//   LZ_TUNE.allot          the Allotment (core/region/51-region-allot.js): the Interpreters plan at each quarter-day
//   LZ_TUNE.valley(o)      the valley spec; o {allot (true: the Allotment on), scale, bulk, days (the stocked start)}
// Everything here is proposed unless the comment quotes the owner. No money: nothing is priced, nothing bought or sold.
var LZ_TUNE=(function(){'use strict';
const T={},D=1/365,yr=365;
T.px=(px,py)=>({x:(px-1191)*2000,z:(py-1569)*2000});
T.faction={id:'lizardmen',name:'The Lizardmen of the Rift floor'};
T.goods={grain:{unit:'kg'},produce:{unit:'kg'},fish:{unit:'kg'},lakecake:{unit:'kg'},meat_hide:{unit:'kg'},salt:{unit:'kg'},
 evaporites:{unit:'kg'},copper:{unit:'kg'},tin:{unit:'kg'},bronze:{unit:'kg'},bronze_ware:{unit:'kg'},bone:{unit:'kg'},
 reed_lacquer:{unit:'kg'},relics:{unit:'kg'},
 /* Z4: what the raids carry home, in Xanadu's units (the joint run merges the two lists): the Vale's tools and arms (steel, kept
    in the plunder warehouse and never used: DESIGN.md), its goldwork and the Golden Tears' ore (valuables) */
 tools:{unit:'kg'},arms:{unit:'piece'},goldwork:{unit:'piece'},goldore:{unit:'kg'}};
/* a person's year (kg). The town's is Gila's (GL_REC's needs over its 3,000: grain 700 t, produce 250, lakecake or fish 120,
   meat and hide 90, salt 25, bronze ware 6, bone 12, reed and lacquer 36); the warrens' a countryside's (less salt and
   bronze, more meat); the Tubes' a cavern's (its fungus beds count as produce: kits/crops pale-fungi, grown in the dark) */
T.diet={town:{grain:233.33,produce:83.33,fish:40,meat_hide:30,salt:8.333,bronze_ware:2},
 cavern:{grain:150,produce:120,fish:40,meat_hide:20,salt:8.333,bronze_ware:2},
 warren:{grain:220,produce:80,meat_hide:40,salt:6,bronze_ware:.5}};
/* the bronze hall's batch (Basilisk: Tuatara's copper and Komodo's tin, nine to one); every town's smiths rework the
   allotted bronze into tools, lamellae and clapperless bells, a kilo for a kilo */
T.chain={cast:{in:{copper:9,tin:1},out:{bronze:10},hours:30},rework:{in:{bronze:1},out:{bronze_ware:1},hours:10}};
/* THE PLACES. id (the map's pin where it has one), name, px, py, people, diet (a kind, or its own), make: {good: kg a year
   from the place's own works}, smiths (true: a rework batch for its bronze ware), cast (the bronze hall), sink (the
   reliquary its relics go to), loop (its Coil loop). make is what the place's ground and works give (PROPOSAL-LIZARDMEN
   section 2; LIZARDMEN-SURVEY section 4): */
T.places=[
 {id:'slrodrkrls',key:'basilisk',name:'Basilisk, the stone capital at the eastern sea',px:765,py:1596,people:15000,diet:'town',
  make:{grain:1500000,produce:1300000,fish:600000,meat_hide:450000,salt:115000,bone:48000},extra:{evaporites:12000/15000,bone:60000/15000},
  smiths:true,cast:true,why:'the jungle shore grows grain poorly; the sea\'s pans give the east\'s salt; the bronze hall casts what Tuatara and Komodo dig'},
 {id:'szv27b2reu',key:'tuatara',name:'Tuatara, on the volcanic savanna above the eastern sea',px:818,py:1554,people:3000,diet:{grain:233.33,produce:83.33,meat_hide:70,salt:8.333,bronze_ware:2},
  make:{grain:1000000,produce:250000,meat_hide:210000,copper:70000},smiths:true,raider:true,why:'the richest ground: copper 102 nodes, the savanna\'s grain; no perennial water, so no fish'},
 {id:'spnqhezhiw',key:'komodo',name:'Komodo, at the eastern sea\'s far end',px:865,py:1617,people:3000,diet:'town',
  make:{grain:600000,produce:250000,fish:240000,meat_hide:90000,tin:8000},smiths:true,raider:true,why:'tin from the placers on its rivers; bamboo rice; little farmland'},
 {id:'sze26pgivd',key:'gila',name:'Gila, the salt village on its lake',px:653,py:1485,people:3000,gila:true,smiths:true,
  why:'GL_REC (settlements/gila/src/88-gl-records.js): the evaporites, the crest\'s fields, the lake\'s alga'},
 {id:'iguana',key:'iguana',name:'Iguana, the granary town on the Pile\'s plateau',px:713,py:1569,people:3000,diet:{grain:233.33,produce:83.33,meat_hide:70,salt:8.333,bronze_ware:2},
  make:{grain:2600000,produce:250000,meat_hide:210000,relics:1500},smiths:true,sink:'reliquary-east',
  why:'the owner, 2026-11-16: "on some prime farmland nearby" the Pile (proposed px 713,1569, -373 m, 0.6 % slope); the capital\'s granary; it keeps the watch on Loj Nahn and gleans the Pile\'s lower levels'},
 {id:'sa8xk6pimb',key:'tubes',name:'The Tubes, the Rift line\'s ruined cavern',px:608,py:1547,people:1000,diet:'cavern',
  make:{produce:120000,fish:40000,meat_hide:20000,relics:3000},smiths:true,sink:'reliquary-west',
  why:'the owner, 2026-11-16: "both a ruin and a lizardman town of about 1000": fungus beds in the dark, the western sea\'s fish, relics from the ruined station'},
 {id:'warrens-east',key:'warrens-east',name:'The eastern warrens (the countryside round the eastern sea)',px:805,py:1570,people:18000,diet:'warren',bulk:true,
  make:{grain:4060000,produce:1440000,meat_hide:720000},smiths:true,why:'the owner: the warrens 20,000-40,000, "as bulk countrysides (as Xanadu\'s provinces are)"'},
 {id:'warrens-west',key:'warrens-west',name:'The western warrens (the countryside round the western sea and Gila\'s lake)',px:630,py:1515,people:12000,diet:'warren',bulk:true,
  make:{grain:2840000,produce:960000,meat_hide:480000},smiths:true},
 {id:'reliquary-west',key:'reliquary-west',name:'The west reliquary, on the south shore of Gila\'s spit',px:651.9,py:1486.7,people:0,store:true,
  why:'the owner, 2026-11-16: "one reliquary per cluster for now"; GL_REC.site.reliquary (2,160 m west and 3,380 m south of Gila\'s pin)'},
 {id:'reliquary-east',key:'reliquary-east',name:'The east reliquary, on the eastern sea\'s strand',px:790,py:1578,people:0,store:true,
  why:'"on the sea\'s strand between Basilisk and Tuatara" (PROPOSAL-LIZARDMEN section 1)'}];
T.byKey=k=>T.places.find(p=>p.key===k);
/* THE COIL (section 3, endorsed by the owner): two loops meeting at the capital. Every load rides its season's way round
   (outward in wet1 and dry1, inward in wet2 and dry2: GL_REC's seasons) and never goes straight; a load for the other loop
   rides in to the capital first, then out round the other loop */
T.coil={hub:'basilisk',loops:{west:['basilisk','iguana','gila','reliquary-west','tubes','warrens-west'],
 east:['basilisk','reliquary-east','tuatara','komodo','warrens-east']},seasons:['wet1','wet2','dry1','dry2'],
 dir:{wet1:'outward',wet2:'inward',dry1:'outward',dry2:'inward'}};
/* THE ALLOTMENT (core/region/51-region-allot.js): the Interpreters, "one mind remembering what all the others will do", plan
   at each quarter-day. A place keeps `reserve` days of what it uses; what it holds over that and its season's need is the
   plan's to move; a place under it is sent to, the heaviest need first. A place whose need weighs less is told to send
   from below its reserve (down to `deep` of its stock) when a heavier one would still go short: no profit, no keep */
T.allot={every:91.25,reserve:60,horizon:91.25,deep:.5,kmDay:20,hold:1,
 weight:{basilisk:3,iguana:2,gila:2,tuatara:2,komodo:2,tubes:2,'warrens-east':1,'warrens-west':1},
 goods:['grain','produce','fish','meat_hide','salt','evaporites','copper','tin','bronze','bone'],
 sinks:{relics:true},
 /* Z2: the gifts that go round the Coil, bronze outward and bone inward, each held a while at every stop (the Kula ring as a
    model); a place that holds bronze owes bone the next coil (the memory debt, kept across lives) */
 gifts:[{id:'gift.bell.1',kind:'bronze',holder:'basilisk',dir:'outward'},{id:'gift.bell.2',kind:'bronze',holder:'gila',dir:'outward'},
  {id:'gift.crest.1',kind:'bone',holder:'tubes',dir:'inward'},{id:'gift.crest.2',kind:'bone',holder:'komodo',dir:'inward'}]};
/* GILA FROM ITS RECORDS: the village's GL_REC (people by caste; each work's good and year; each good's year of need), as a
   place. Works that make the same good add up; bronze is what the smiths rework, so it is not eaten */
T.fromGila=function(R){if(!R)return null;const people=R.castes.reduce((n,c)=>n+c.people,0),make={},eat={};
 R.works.forEach(w=>{if(w.good==='bronze_ware')return;make[w.good]=(make[w.good]||0)+w.yearT*1000;});
 Object.keys(R.goods).forEach(g=>{if(g==='bronze')return;const need=R.seasons.reduce((n,s)=>n+(R.goods[g].need[s]||0),0)*1000;if(need)eat[g]=need/people;});
 return{people,make,eat};};
const gilaRec=()=>typeof GL_REC!=='undefined'?GL_REC:(typeof require==='function'?(()=>{try{return require('../../../settlements/gila/src/88-gl-records.js');}catch(e){return null;}})():null);
T.valley=function(o){o=o||{};const K=o.scale==null?10:o.scale,KB=o.bulk==null?200:o.bulk,days=o.days==null?120:o.days;
 const rate=(perYr,crew,k)=>perYr/(Math.max(1,Math.round(crew/k))*k*yr*12);
 const G=T.fromGila(gilaRec());
 const S=T.places.map(P=>{const k=P.bulk?KB:K,p=T.px(P.px,P.py),works=[];let n=P.people,diet,make;
  if(P.gila){if(!G)throw new Error('LZ_TUNE: Gila\'s records (settlements/gila/src/88-gl-records.js) are not loaded');n=G.people;make=G.make;diet=Object.assign({},G.eat);}
  else{make=P.make||{};diet=Object.assign({},typeof P.diet==='string'?T.diet[P.diet]:(P.diet||{}));
   Object.keys(P.extra||{}).forEach(g=>{diet[g]=(diet[g]||0)+P.extra[g];});}
  const eats={};Object.keys(diet).forEach(g=>{eats[g]=diet[g]*D;});
  /* the store (a load lands in a settlement's first work), then a work for each good it makes, then the smiths and the hall */
  works.push({id:P.key+'.store',kind:P.store?'reliquary':'stores',name:P.store?'the antechamber':'the halls\' stores',crew:P.store?0:Math.min(40,Math.round(n*.01)),out:[],rate:0});
  Object.keys(make).sort().forEach(g=>{const crew=Math.max(k,Math.round(n*(P.bulk?.04:.06)));
   works.push({id:P.key+'.'+g,kind:g,name:P.key+'\'s '+g,crew,out:[g],rate:rate(make[g],crew,k)});});
  if(P.smiths){const need=(diet.bronze_ware||0)*n,crew=Math.max(k,Math.round(need/1000*6));   /* a smith reworks about 170 kg a year */
   works.push({id:P.key+'.smiths',kind:'smithy',name:'the smiths',crew,batch:T.chain.rework,cap:Math.ceil(need*60/yr)});}   /* they rework to sixty days of ware ahead, no more: the rest of the bronze is the plan's */
  if(P.cast)works.push({id:P.key+'.hall',kind:'bronze-hall',name:'the bronze and stone hall',crew:60,batch:T.chain.cast});
  if(P.raider)works.push({id:P.key+'.plunder',kind:'warehouse',name:'the plunder warehouse (the steel of the Vale, kept and never used) and the yard of the bone hall',crew:10,out:[],rate:0});
  const start={};Object.keys(diet).forEach(g=>{start[g]=Math.ceil(n*diet[g]*D*days);});
  if(P.smiths)start.bronze=Math.ceil((diet.bronze_ware||0)*n*D*days);
  if(P.cast){start.copper=9*1000*days/30;start.tin=1000*days/30;}
  /* what the planners know it makes and uses in a year (the Allotment's plan): its works' make, its people's diet, its smiths'
     bronze; the hall's casting is set below from everyone's bronze */
  const plan={make:Object.assign({},make),use:{}};Object.keys(diet).forEach(g=>{plan.use[g]=diet[g]*n;});
  if(P.smiths)plan.use.bronze=(diet.bronze_ware||0)*n;
  return{id:P.key,name:P.name,pin:P.id,faction:T.faction.id,people:n,x:p.x,z:p.z,scale:k,eats,keepDays:30,start,works,plan,sink:P.sink,cast:!!P.cast};});
  const bronze=S.reduce((m,s)=>m+(s.plan.use.bronze||0),0);
  S.filter(s=>s.cast).forEach(s=>{s.plan.make.bronze=bronze;s.plan.use.copper=bronze*.9;s.plan.use.tin=bronze*.1;delete s.cast;});
 const V={seed:20261117,scale:K,start:0,goods:T.goods,factions:[T.faction],relations:[],settlements:S,roads:[],transfers:[]};
 if(o.allot!==false&&o.allot!=null)V.allot=Object.assign({coil:T.coil},T.allot,o.allot===true?{}:o.allot);
 if(o.raids)V.raids=T.raidSpec(o.raids===true?{}:o.raids);
 return V;};
/* Z4, THE RAIDS (core/camp/PLAN.md section 6.1; core/region/52-region-raid.js). The lore: "raids reach as far as the Vale, for
   livestock, tools and valuables" (LORE 6.20); Tuatara and Komodo are the raiding towns (PROPOSAL-LIZARDMEN section 1). A war
   band of the Line warriors and the Bulwarks (castes 4 and 6, 2.4 and 3.8 m tall: `arms` 3, each the match of three men), on
   foot. The targets and their numbers are XAN_TUNE's (core/region/data/xan-tune.js): the Marches' three watch forts (150 each,
   their stores; walls 2.5), the Marches' countryside (prov.p8: the Vale's southern villages, their harvest), the Golden Tears'
   armed camp on the Rift floor (exp.rift-gold: 120, a palisade). In the Lizardmen's run alone they are off-map records with
   those stocks; in the joint run (core/region/data/lz-join.js, Z5) they are the Sultanate's own settlements, raided in their
   own books. Each raid's take is capped (15 % of the movable stock, never the staples below fourteen days) and its dead (2 %
   of the people); the dead of both sides go home to the bone hall (bone and hide: LORE 6.20, "butchered like animals") */
T.raids={faction:'lizardmen',season:91.25,budget:2,kmDay:25,supplyDays:20,cooldown:120,fatigue:45,floorDays:14,
 want:['tools','arms','goldwork','goldore','grain'],dead:{bone:20,meat_hide:35},
 aid:{after:2,garrison:30,days:180},punitive:{after:4,window:365},
 parties:[{id:'tuatara.warband',from:'tuatara',warriors:150,arms:3,mounts:1,morale:1.1,store:'tuatara.plunder'},
  {id:'komodo.warband',from:'komodo',warriors:120,arms:3,mounts:1,morale:1.1,store:'komodo.plunder'}],
 targets:[
  {id:'march.w',name:'The west watch fort',faction:'xanadu',px:818,py:1531,people:150,garrison:120,militia:.2,walls:2.5,state:'kept',stock:{grain:10800,tools:40,arms:20}},
  {id:'march.s',name:'The south watch fort',faction:'xanadu',px:843,py:1546,people:150,garrison:120,militia:.2,walls:2.5,state:'kept',stock:{grain:10800,tools:40,arms:20}},
  {id:'march.e',name:'The beacon fort over the Rift',faction:'xanadu',px:853,py:1540,people:150,garrison:120,militia:.2,walls:2.5,state:'kept',stock:{grain:10800,tools:40,arms:20}},
  {id:'prov.p8',name:'The Marches\' villages (the Vale\'s southern countryside)',faction:'xanadu',px:825,py:1541,people:3600,garrison:0,militia:.06,walls:1,stock:{grain:420000,tools:540}},
  {id:'exp.rift-gold',name:'The Golden Tears\' armed prospecting camp',faction:'tears',px:850,py:1628,people:120,garrison:30,militia:.3,walls:1.6,stock:{grain:12000,tools:60,arms:40,goldore:900}}]};
/* the spec the valley host takes: o.offMap (true unless the targets are settlements of the same valley), o.caps (false: the
   negative), any field of T.raids to override */
T.raidSpec=function(o){o=o||{};const R=JSON.parse(JSON.stringify(T.raids));Object.keys(o).forEach(k=>{if(k!=='offMap')R[k]=o[k];});
 R.targets=R.targets.map(t=>{const p=T.px(t.px,t.py),q=Object.assign({},t,{x:p.x,z:p.z});delete q.px;delete q.py;if(o.offMap===false){delete q.stock;delete q.people;}return q;});
 return R;};
if(typeof module!=='undefined'&&module.exports)module.exports=T;
return T;})();
