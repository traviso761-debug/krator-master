// ================================================================= CORE/REGION DATA — the Bowl's tune (S2)
// [G data] openworld/catch-bowl/PLAN-SIM.md section 3 (the owner's brief of 2026-11-24, "Include se outer wall and
// stalker range in the Sim as well", and the answers of that plan's section 7). The Bowl -- the south-eastern desert's
// abyssal end, a salt basin under 1.83 atm, the hottest ground in the east -- as data for core/region's valley host
// (50-region-valley.js, H.simValley), in XANADU'S FRAME (BOWL_TUNE.px, as CATCH_TUNE.px) so the two join the same way
// and EAST_RIFT can take both at step C6.
//   BOWL_TUNE.px(px, py)   metres from px 1191,1569 (2 km a pixel)
//   BOWL_TUNE.goods        the Bowl's own, beside the ones CATCH_TUNE names
//   BOWL_TUNE.diet         a person's day by the kind of place
//   BOWL_TUNE.calendar     the pans in the cool months (as the Catch's), Mantis's monsoon, the floor's dead summer
//   BOWL_TUNE.places       Jabal, Mantis, Solta, Arcbeam, Parabola, Esper
//   BOWL_TUNE.conflicts    the two census rows that disagree with the region's site plans and WAIT ON THE OWNER (below)
//   BOWL_TUNE.valley(o)    the valley spec. o {scale (people an actor stands for: 25), days (the stocked start: 400)}
// WHAT IT IS FOR. The Train of Jabal stops being an off-map pool: its home becomes a town with a census, and the salt
// goes Solta -> Jabal -> Salt al-Ban -> Stair -> the Twins -> Strongbow. That is the single biggest change to books
// that currently balance, so S2 declares the places and their make FIRST, on their own and in balance, exactly as C0
// did for the Catch; the rounds come after (BOWL_TUNE.join, still to write).
//
// THE CENSUS (PLAN-SIM.md section 3a). Every number but Esper's and the rings' comes from
// openworld/populations-gemini.json, except where the owner has ruled since: Stair 750, Ranger HQ 500 and Bab al-Hawa 120
// are CATCH_TUNE's or the Catch's, not this tune's, and Salt al-Ban is CATCH_TUNE's 120 under the Train rather than
// Gemini's 350 under "Nomad Country".
// THE TWO ROWS THAT WERE OPEN ARE RULED (the owner, 2026-11-24):
//   MANTIS is "a lot bigger than 300, maybe 15000 + hinterlands". So it is the Bowl's second city, not a village: at
//     15,000 in the town with 9,000 more in the green pocket's gardens round it, it can carry the programme the owner's
//     lore gives it -- three fabrics on one street, a merchant tower, a domed shrine, the walled date and fig gardens and
//     the frankincense trade (openworld/catch-bowl/PLAN-SITES.md section 4).
//   THE ARCOLOGY ON THE NORTH ROAD is "10k + hinterlands", so Gemini's number stands with a countryside added. It is
//     therefore NOT a marker to pass: at 10,000 with 6,000 round it, it is the largest place on the north road after
//     Jabal and a market the caravans trade at, and PLAN-SITES.md's "a marker, massing out to 30 km" is superseded.
//   ARCBEAM ITSELF HAS MOVED (the owner, 2026-11-25: "sound great i agree"). It goes to px 1120,190, in the arachnoid
//     canyons 10 km off the Shell-Silkhead-Ria lifeline, where the model gives 332 m of trench at Arcbeam's own 4 km
//     span with rims 1 m apart on all four axes -- the best bridge-city site on the planet, and the one place where the
//     lore already wants a gorge (the Web-Cleaver River saws through the Arachnoid ring-dikes). The survey is
//     openworld/catch-bowl/PLAN-SITES.md section 7c. That is 2,000 km from the Bowl, so Arcbeam leaves this tune.
//   WHAT STANDS AT px 1016,1058 INSTEAD is "an arcology TBD of about 10k + hinterlands" (the owner, 2026-11-25), who is
//     having a new model made. The census, the market and the road's role belong to THE PLACE rather than to the name,
//     so they stay exactly as they were and only the name is unknown. `tbd:true` marks it, and the id below is
//     Arcbeam's old one standing in until the new model issues one for whoever is there.
// THE HINTERLANDS. A town's countryside is a settlement of its own at a coarser scale, as XAN_TUNE's countrysides are
// (its towns at 50 people an actor, its countrysides at 200): `ring` on a place makes `<id>.ring`, which farms and sends
// its make down to the town, and the town feeds it what it does not grow. Only Mantis and Arcbeam have one; Jabal's is
// the Sheikhdom's own and waits on its page.
var BOWL_TUNE=(function(){'use strict';
const T={},D=1/365;
T.px=(px,py)=>({x:(px-1191)*2000,z:(py-1569)*2000});
/* every good the Bowl's places use. The first row is the ones CATCH_TUNE declares too: they are declared AGAIN here so
   this tune stands on its own in node (core/region/tests/test-bowl.js loads it without the Catch's), and the join merges
   the two tables with Object.assign, where a duplicate costs nothing. The second row is the Bowl's own. */
T.goods={grain:{unit:'kg'},salt:{unit:'kg'},tea:{unit:'kg'},tools:{unit:'kg'},water:{unit:'l'},fodder:{unit:'kg'},
 gypsum:{unit:'kg'},alloy:{unit:'kg'},cells:{unit:'cell'},
 dates:{unit:'kg'},figs:{unit:'kg'},frankincense:{unit:'kg'},resin:{unit:'kg'},hides:{unit:'kg'},
 shrimp:{unit:'kg'},fish:{unit:'kg'},brick:{unit:'kg'},timber:{unit:'kg'},coffee:{unit:'kg'},cloth:{unit:'m'},
 /* the herds' goods (the owner, 2026-11-25: Jabal "should have a hinterland and be supported by Dasri bowl nomads") */
 meat:{unit:'kg'},dairy:{unit:'kg'},beasts:{unit:'ea'},wool:{unit:'kg'}};
/* a person's day. The floor is hot and salt: everyone drinks hard (the Bowl's extreme is +47 degC at 1.83 atm,
   biomes/sedesert/PLAN-BOWL.md section 1), and salt is the one thing nobody here lacks */
T.diet={city:{grain:200*D,salt:8*D,tea:2*D,tools:1.5*D,cloth:.4*D,meat:44*D,dairy:55*D,water:18},
 town:{grain:190*D,salt:8*D,tea:1.5*D,tools:.8*D,cloth:.3*D,meat:36*D,dairy:44*D,water:16},
 works:{grain:200*D,salt:8*D,tea:1*D,tools:1.5*D,meat:36*D,water:20},        /* the rakers: the hardest work on the floor */
 village:{grain:175*D,salt:7*D,tea:1*D,tools:.5*D,meat:30*D,dairy:40*D,water:14},
 ruin:{grain:180*D,salt:7*D,tea:1*D,tools:.8*D,water:14},
 /* a band's day on the move: it eats its own herd's meat and milk and buys its bread, which is the trade with Jabal */
 band:{grain:150*D,salt:9*D,tea:1*D,meat:80*D,dairy:70*D,water:16}};
/* the year (year day 0 is Xanadu's clock's 259, as CATCH_TUNE's): the pans are raked in the cool months, as the Catch's
   are; Mantis's pocket takes the monsoon (1,553 mm, the one wet place on a hot-desert shore); and the floor's high
   summer is too hot to work at all, which no other tune in the repo has had to say */
T.calendar={windows:{pans:[300,90],monsoon:[150,240],deadheat:[20,70]}};
T.yearDay0=259;
/* THE PLACES. id (the map's pin), name, faction, px, py, people, kind (its diet), wells: [l a day the aquifer gives,
   days it stores], and what it makes a year. `pending` marks a census the owner has still to rule on (above). */
T.places=[
 /* JABAL HAS A HINTERLAND (the owner, 2026-11-25: it "should have a hinterland and be supported by Dasri bowl nomads",
    answering PLAN-SIM.md 3c's question). Before this it was 15,000 people with no countryside and no grain source in the
    province, which is what made the Bowl 15 % short of its own bread. Its ring is the Sheikhdom's irrigated land on the
    wadi fans above the salt, at the same 200 people an actor as Mantis's and the arcology's, and it is the biggest of
    the three because Jabal is the Bowl's capital and has the most mouths. The nomads are the other half of the answer:
    T.nomads below. */
 {id:'sa5o6dvjdv',name:'Jabal, the Sheikhdom\'s seat and the Train of Jabal\'s home',faction:'jabal',px:1225,py:1149,people:15000,kind:'city',
  well:[3000000,30],make:{brick:900000,cloth:120000,tools:220000,coffee:40000},serai:[400000,60000],repairs:true,
  ring:{people:9500,scale:200,make:{grain:5700000,dates:1100000,hides:150000,meat:995000,dairy:1258000,wool:95000,timber:60000}}},
 {id:'slw9dufqfs',name:'Mantis, the Bowl\'s second city in its green pocket (an Iziz holding under Izani merchant houses)',faction:'mantishouses',px:1113,py:1164,people:15000,kind:'city',
  well:[2200000,25],make:{frankincense:70000,resin:55000,dates:900000,figs:400000,fish:300000,shrimp:140000,cloth:70000,tools:90000},season:{dates:'monsoon'},
  serai:[200000,30000],repairs:true,
  ring:{people:9000,scale:200,make:{grain:5400000,dates:1600000,figs:700000,hides:160000,meat:942000,dairy:1192000,wool:90000,timber:90000},season:{dates:'monsoon'}}},
 {id:'s0zgu7u6yb',name:'Solta, the Train of Jabal\'s Bowl salt works by the great salt lake',faction:'train',px:1169,py:1150,people:400,kind:'works',
  well:[60000,20],pans:{salt:900000,gypsum:400000}},
 {id:'skz25tuq0w',name:'An arcology TBD: the Iziz arcology on the north road (Arcbeam moved to the arachnoid canyons, 2026-11-25)',faction:'iziz',px:1016,py:1058,people:10000,kind:'city',tbd:true,
  well:[1500000,30],make:{alloy:30000,cells:1200,tools:260000,brick:400000,cloth:50000},salvageYears:80,repairs:true,serai:[250000,40000],
  ring:{people:6000,scale:200,make:{grain:3600000,hides:140000,meat:628000,dairy:794000,wool:60000,timber:120000}}},
 {id:'scyeauyek7',name:'Parabola, the Bowl arcology and the north road\'s mustering ground',faction:'iziz',px:970,py:1186,people:450,kind:'ruin',
  well:[200000,25],make:{alloy:9000,cells:400},salvageYears:60,repairs:true},
 {id:'sq11desertw7',name:'Esper, the Bowl\'s farming village',faction:'iziz',px:1042,py:1083,people:220,kind:'village',
  well:[90000,20],fodder:4000,make:{dates:80000,hides:9000,timber:20000}}];
/* the two census rows that were open, with the owner's ruling of 2026-11-24, so a test can see that they were settled
   and how (and so nobody re-opens them from Gemini's file) */
T.ruled=[{ref:'(a)',id:'skz25tuq0w',was:10000,now:10000,ring:6000,
  owner:'"arcbeam can be 10k + hinterlands"; then 2026-11-25, Arcbeam moved to px 1120,190 on the Shell-Arachnoid-Ria route and "we can treat the model as having an arcology TBD of about 10k + hinterlands" here (T.places tbd:true)'},
 {ref:'(b)',id:'slw9dufqfs',was:300,now:15000,ring:9000,
  owner:'"mantis should be a lot bigger than 300, maybe 15000 + hinterlands"'}];
T.factions=[{id:'jabal',name:'The Jabal Sheikhdom (the Dasri\'s Bowl capital)'},
 {id:'train',name:'The Train of Jabal (the Dasri\'s salt caravan company: Solta\'s pans and the Catch\'s)'},
 {id:'mantishouses',name:'The Izani merchant houses of Mantis (frankincense, resin and the lake\'s take)'},
 {id:'iziz',name:'The Empire of Iziz (Arcbeam, Parabola and Esper)'}];
/* the Train sells salt to all comers and holds both works, which the Izani houses -- who once had Solta's salt --
   resent (the owner, 2026-11-16: "Solta too"); everyone else friendly */
/* ================================================================= THE DASRI BOWL NOMADS
   The owner, 2026-11-25: Jabal "should have a hinterland and be supported by Dasri bowl nomads." The hinterland is
   Jabal's `ring` above; these are the other half, and they are a different kind of thing -- not a settlement with a
   census but BANDS THAT MOVE, on `core/camp` (KCAMP), as Pinnacle Rock's eighteen Beast Rider bands are
   (`settlements/pinnacle-rock/src/15-pr-tune.js` T.bands). Four bands of 40-70 range the wadi fans and the grazing
   margins above the salt, and each is a settlement of its own in the valley so that core/camp's hand-over has somewhere
   to land its stock.

   WHAT THEY ARE FOR, and it is not bulk food. Four bands of about sixty cannot feed a city of 15,000: the rings carry
   the province's meat and milk, and the bands' distinctive trade is BEASTS -- the pack animals the Train of Jabal runs
   on. That is the connection worth having: the Dasri capital's caravan arm is mounted on beasts its own nomads breed,
   so a bad year in the grazing is a bad year for the salt road, and `T.rivals`' quarrel between the Train and Mantis's
   houses has a supply side as well as a price side. Beside the beasts they sell hides, wool and the herds' surplus, and
   they buy their bread, salt and tea at Jabal, which is the trade.

   THE TENTS are the Tents kit's `desert` dress through `KCAMP.tentProgram` -- black goat-hair tents, the chief's large,
   a council marquee, a smith's and a tanner's workshop -- so no new culture row was written for them.
   ONE THING IS HONESTLY WRONG AND RECORDED RATHER THAN PAPERED OVER: the generic program's `assign` deals a
   FORAGER'S role mix (about fourteen hunters and eight gatherers to one herder in a band of sixty), which is the Beast
   Riders' shape, not a herding people's. The economy below therefore sizes its crews off the band's ADULTS rather than
   off `role === 'herder'`, and a Dasri herder row in `core/camp` (as `11-camp-coyote.js` is for the coyote-herders) is
   owed. The census's pop, adults, children, elders and mounts are all sound and are what the economy uses. */
T.nomads={culture:'desert',n:4,households:7,trades:['smith','tanner'],council:true,
 /* where each band's home ground is: the wadi fans and grazing margins round Jabal, 40-120 km out */
 at:[[1198,1120],[1252,1176],[1210,1190],[1268,1128]],
 names:['the Bani Ghubar','the Bani Sabkha','the Bani Rakhm','the Bani Thalj'],
 keep:30,want:45,
 /* a band's herd, per head of its people: the Bowl's margins carry goats, and the Dasri breed the pack beasts */
 herdPer:14,            /* head of stock a person */
 offtake:{meat:15,dairy:80,hides:2,wool:1.8},   /* kg a head of stock a year */
 breedPer:50,           /* one beast a year sold off every 50 head: the Train's remounts */
 graze:1.4};            /* kg of fodder a head of stock a day the margins give back */
/* the four bands by core/camp's census, ids as a page would write them. Needs KCAMP (core/rand, core/space, core/camp
   loaded by the host); without it the valley runs without bands and says so in `_noBands`. */
T.bands=function(world){if(typeof KCAMP==='undefined')return null;
 const N=T.nomads,P=KCAMP.tentProgram({culture:N.culture,households:N.households,trades:N.trades,council:N.council});
 return N.at.map((px,i)=>{const id='sa5o6dvjdv:dasri:'+(i+1);
  return{id,i,name:N.names[i],px,census:KCAMP.census({id,world,culture:P.culture,program:P.program})};});};
T.rivals=[['train','mantishouses']];
T.speed=30;      /* km a day on a Bowl track, as CATCH_TUNE's: the same beasts on the same kind of road */
T.winding=1.25;  /* road over straight line */
/* THE BOWL'S OWN TRADE (S2). Five roads, each between two places this tune declares, so they run in the standalone
   valley as well as in the join. Every one is named from what the census and the works already say:
   - the pans at Solta make 900 t of salt and 400 t of gypsum a year and grow nothing, so the salt goes to Jabal and the
     food comes back. This is the Train of Jabal's own works and its own road.
   - MANTIS BUYS ITS SALT FROM THE TRAIN, which is PLAN-SIM.md section 3's grievance and `T.rivals`' one pair: the
     Dasri hold the Bowl's only salt and Mantis's Izani houses must buy it at the Train's price, which is what sends
     them onto the Catch road looking for another seller.
   - Esper is the Bowl's one farming village, and its market is the arcology on the north road, not Jabal: its own
     record reads "72 km from Arcbeam" and the model agrees to the kilometre (36 px), where Jabal is 486 km off. A
     village of 220 does not haul dates 486 km past a nearer buyer.
   - the north road's arcology (10,000 with 6,000 in its ring) is fed by its own countryside but buys its salt here too.
   - Parabola's divers sell alloy and cells up the north road to the arcology, which is the nearest market that wants
     them, and eat on what comes back. */
T.trade=[
 {id:'trade.solta.jabal',a:'s0zgu7u6yb',b:'sa5o6dvjdv',cap:240000,carriers:3,want:30,
  out:['salt','gypsum'],back:['grain','dates','tools','cloth']},
 {id:'trade.jabal.mantis',a:'sa5o6dvjdv',b:'slw9dufqfs',cap:300000,carriers:4,want:25,
  out:['salt','brick','tools','coffee'],back:['dates','figs','fish','frankincense','resin','cloth']},
 {id:'trade.esper.arcology',a:'sq11desertw7',b:'skz25tuq0w',cap:60000,carriers:1,want:40,
  out:['dates','hides','timber'],back:['salt','tools','tea','cloth']},
 {id:'trade.solta.arcology',a:'s0zgu7u6yb',b:'skz25tuq0w',cap:200000,carriers:3,want:30,
  out:['salt','gypsum'],back:['tools','brick','cloth']},
 {id:'trade.parabola.arcology',a:'scyeauyek7',b:'skz25tuq0w',cap:80000,carriers:2,want:45,
  out:['alloy','cells'],back:['grain','salt','tools']}];
T.valley=function(o){o=o||{};const K=o.scale==null?25:o.scale,yr=365,days=o.days==null?400:o.days;
 const win=w=>{const W=T.calendar.windows[w];return(W[1]-W[0]+yr)%yr;};
 const rate=(perYr,crew,d)=>perYr/(Math.max(1,Math.round(crew/K))*K*(d==null?yr:d)*12);
 const S=T.places.map(P=>{const p=T.px(P.px,P.py),diet=T.diet[P.kind],n=P.people,works=[];
  works.push({id:P.id+'.market',kind:'market',name:'the market and its pens',crew:Math.min(200,Math.round(n*.1)),out:[],rate:0});
  if(P.well){const[lDay,store]=P.well,crew=Math.max(2,Math.round(n*.04));
   works.push({id:P.id+'.well',kind:'well',name:'the wells and the cisterns',crew,out:['water'],rate:rate(lDay*yr,crew),cap:lDay*store,
    site:{kind:'aquifer',amount:lDay*store,regen:lDay}});}
  if(P.fodder){const crew=Math.max(2,Math.round(n*.1));
   works.push({id:P.id+'.fodder',kind:'fodder-yard',name:'the fodder yard',crew,out:['fodder'],rate:rate(P.fodder*yr,crew),cap:P.fodder*60,
    site:{kind:'reeds',amount:P.fodder*60,regen:P.fodder}});}
  Object.keys(P.make||{}).forEach(g=>{const crew=Math.max(2,Math.round(n*(g==='alloy'||g==='cells'?.06:.12))),season=(P.season||{})[g];
   works.push({id:P.id+'.'+g,kind:g==='alloy'||g==='cells'?'divers':g==='frankincense'||g==='resin'?'tappers':g==='fish'||g==='shrimp'?'fishery':'works',
    name:'the '+g,crew,out:[g],rate:rate(P.make[g],crew,season?win(season):null),season:season||undefined,
    site:P.salvageYears&&(g==='alloy'||g==='cells')?{kind:'salvage',amount:P.make[g]*P.salvageYears}:undefined});});
  Object.keys(P.pans||{}).forEach(g=>{const crew=Math.round(n*.7/2),kg=P.pans[g];
   works.push({id:P.id+'.'+g,kind:'pans',name:'the pans\' '+g,crew,out:[g],rate:rate(kg,crew,win('pans')),season:'pans',
    site:{kind:'evaporite',amount:kg*20,regen:kg/yr*.5}});});
  if(P.serai){const[lDay,fDay]=P.serai,crew=Math.max(4,Math.round(n*.02));
   works.push({id:P.id+'.serai.well',kind:'well',name:'the caravanserais\' wells',crew,out:['water'],rate:rate(lDay*yr,crew),cap:lDay*10,site:{kind:'aquifer',amount:lDay*10,regen:lDay}},
    {id:P.id+'.serai.fodder',kind:'fodder-yard',name:'the caravanserais\' fodder yards',crew,out:['fodder'],rate:rate(fDay*yr,crew),cap:fDay*60});}
  if(P.repairs)works.push({id:P.id+'.repairs',kind:'repairs',name:'the wheelwrights, farriers and saddlers',crew:Math.max(10,Math.round(n*.02)),out:[],rate:0});
  const start={};Object.keys(diet).forEach(g=>{start[g]=Math.ceil(n*diet[g]*days);});
  if(P.well)start.water=P.well[0]*3;
  if(P.fodder)start.fodder=P.fodder*10;
  if(P.serai){start.water=(start.water||0)+P.serai[0]*3;start.fodder=(start.fodder||0)+P.serai[1]*10;}
  return{id:P.id,name:P.name,faction:P.faction,people:n,x:p.x,z:p.z,scale:K,eats:Object.assign({},diet),keepDays:20,start,works};});
 /* THE HINTERLANDS (the owner, 2026-11-24: Mantis and Arcbeam are "+ hinterlands"). A town's countryside is a
    settlement of its own at a coarser scale, as XAN_TUNE's countrysides are: it farms, sends its make down the lanes to
    the town, and is fed back what it does not grow. Placed 12 km out so it is clearly the town's ring and not the town */
 const RINGS=[],RR=[];
 T.places.filter(P=>P.ring).forEach(P=>{const G=P.ring,KR=G.scale==null?200:G.scale,p=T.px(P.px,P.py),diet=T.diet.village,n=G.people,works=[];
  works.push({id:P.id+'.ring.market',kind:'market',name:'the lanes\' market',crew:Math.min(100,Math.round(n*.02)),out:[],rate:0});
  Object.keys(G.make||{}).forEach(g=>{const crew=Math.max(4,Math.round(n*.3/Object.keys(G.make).length)),season=(G.season||{})[g];
   works.push({id:P.id+'.ring.'+g,kind:g==='hides'?'herders':g==='timber'?'woodcutters':'farms',name:'the '+g,crew,out:[g],
    rate:rate(G.make[g],crew,season?win(season):null)/ (KR/K),season:season||undefined});});
  const start={};Object.keys(diet).forEach(g=>{start[g]=Math.ceil(n*diet[g]*days);});
  RINGS.push({id:P.id+'.ring',name:P.name.split(',')[0]+'\'s countryside',faction:P.faction,people:n,x:p.x+12000,z:p.z+12000,scale:KR,
   eats:Object.assign({},diet),keepDays:30,start,works});
  /* the lanes: the ring sends what it grows down to the town, the town sends back what the ring does not */
  RR.push({id:'lane.'+P.id,from:P.id+'.ring',to:P.id,minutes:600,cap:400000,want:30,
   goods:{[P.id+'.ring']:Object.keys(G.make||{}),[P.id]:['salt','tea','tools','cloth'].filter(g=>T.goods[g])}});});
 /* the Bowl's five trade roads (T.trade), their passages measured off the places' own positions */
 const byId={};S.forEach(s=>{byId[s.id]=s;});
 const legKm=(a,b)=>{const A=byId[a],B=byId[b];return Math.hypot(A.x-B.x,A.z-B.z)/1000*T.winding;};
 const mins=km=>Math.max(240,Math.round(km/T.speed*1440));
 const TR=T.trade.map(R=>({id:R.id,from:R.a,to:R.b,minutes:mins(legKm(R.a,R.b)),cap:R.cap,carriers:R.carriers,
  want:R.want,keep:20,goods:{[R.a]:R.out.filter(g=>T.goods[g]),[R.b]:R.back.filter(g=>T.goods[g])},
  stagger:Math.round(mins(legKm(R.a,R.b))*2/R.carriers)}));
/* THE BANDS AS SETTLEMENTS (Pinnacle Rock's pattern): each is a settlement so core/camp's hand-over has somewhere to
   land its stock, with a `home.<band>` road to Jabal carrying the herds' make down and its bread and salt back. The
   crews are sized off the band's ADULTS, not off role === 'herder': see T.nomads' note on the generic role mix. */
 const BANDS=[],BR=[],world=o.world==null?20261125:o.world,bands=o.bands===false?null:T.bands(world);
 (bands||[]).forEach(b=>{const c=b.census,p=T.px(b.px[0],b.px[1]),N=T.nomads,diet=T.diet.band;
  const stock=Math.round(c.pop*N.herdPer),hands=Math.max(3,c.adults-4);   /* less the chief, the smith, the tanner and the quartermaster */
  const works=[{id:b.id+'.stores',kind:'tent-store',name:'the band\'s stores',crew:0,out:[],rate:0}];
  works.push({id:b.id+'.herd',kind:'herd',name:'the herds\' offtake',crew:hands,out:['meat','dairy','hides','wool'],
   rate:rate(stock*(N.offtake.meat+N.offtake.dairy+N.offtake.hides+N.offtake.wool),hands)});
  works.push({id:b.id+'.pasture',kind:'pasture',name:'the margins\' grazing',crew:Math.max(2,Math.round(hands*.3)),out:['fodder'],
   rate:rate(stock*N.graze*365,Math.max(2,Math.round(hands*.3)))});
  works.push({id:b.id+'.breed',kind:'breaking-pen',name:'the young beasts broken for the Train',crew:2,out:['beasts'],
   rate:rate(Math.round(stock/N.breedPer),2)});
  const start={};Object.keys(diet).forEach(g=>{start[g]=Math.ceil(c.pop*diet[g]*days);});
  BANDS.push({id:b.id,name:b.name+' (a Dasri band of the Bowl)',faction:'jabal',parent:'sa5o6dvjdv',people:c.pop,
   x:p.x,z:p.z,scale:K,eats:Object.assign({},diet),keepDays:N.keep,start,works,band:b,
   reserve:{grain:Math.round(c.pop*diet.grain*(N.keep+5)),salt:Math.round(c.pop*diet.salt*(N.keep+5))}});
  BR.push({id:'home.'+b.id,from:b.id,to:'sa5o6dvjdv',minutes:Math.max(240,Math.round(Math.hypot(p.x-T.px(1225,1149).x,p.z-T.px(1225,1149).z)/1000*T.winding/T.speed*1440)),
   cap:60000,want:N.want,keep:N.keep,goods:{[b.id]:['meat','dairy','hides','wool','beasts'],'sa5o6dvjdv':['grain','salt','tea','tools','cloth']}});});
 const F=T.factions.map(f=>f.id),wary=(a,b)=>T.rivals.some(([x,y])=>(x===a&&y===b)||(x===b&&y===a));
 return{seed:20261124,scale:K,start:0,calendar:T.calendar,goods:T.goods,factions:T.factions,
  relations:[].concat(...F.map(a=>F.filter(b=>b!==a).map(b=>({a,b,stance:wary(a,b)?'wary':'friendly'})))),
  settlements:S.concat(RINGS).concat(BANDS),roads:RR.concat(TR).concat(BR),transfers:[],
  bands:bands||undefined,_noBands:bands?undefined:'core/camp (KCAMP) is not loaded, so the Dasri bands are absent'};};

/* ================================================================= THE JOIN (S2, PLAN-SIM.md section 6)
   `CV` is the Catch-joined valley -- `CATCH_TUNE.join(XAN_TUNE.valley())` -- so this is the third plan into the frame,
   and it joins the way EAST_RIFT joins the others: merge goods, factions, relations and calendar windows, concatenate
   settlements and roads.
   AND THE TRAIN OF JABAL COMES HOME. `CATCH_TUNE` carries the Dasri as an off-map pool, `gate.dasri`, standing at
   px 1225,1149 -- which is JABAL'S OWN CELL, because the pool was only ever a stand-in for a city that was not on the
   map. With the Bowl joined it is, so the stand-in goes and both of the Train's rounds load at Jabal instead: its
   warehouse (the pool's `start`) comes with it, since that stock is the Dasri caravan masters' and they keep it at
   Jabal. The home legs are re-measured from Jabal's real position rather than the pool's declared 0 km. */
T.join=function(CV,o){o=o||{};
 const B=T.valley({scale:CV.scale==null?25:Math.min(25,CV.scale),days:o.days});
 const JABAL='sa5o6dvjdv',POOL='gate.dasri';
 const V=Object.assign({},CV);
 V.goods=Object.assign({},CV.goods,T.goods);
 V.factions=CV.factions.concat(B.factions.filter(f=>!CV.factions.some(g=>g.id===f.id)));
 const rel=CV.relations.slice(),has=(a,b)=>rel.some(r=>r.a===a&&r.b===b);
 B.relations.forEach(r=>{if(!has(r.a,r.b))rel.push(r);});
 V.factions.forEach(f=>V.factions.forEach(g=>{if(f.id!==g.id&&!has(f.id,g.id))rel.push({a:f.id,b:g.id,stance:'friendly'});}));
 V.relations=rel;
 V.calendar=Object.assign({},CV.calendar,{windows:Object.assign({},CV.calendar.windows,T.calendar.windows)});
 /* the pool goes; Jabal takes its warehouse */
 const pool=CV.settlements.find(s=>s.id===POOL);
 const setts=CV.settlements.filter(s=>s.id!==POOL).concat(B.settlements);
 const J=setts.find(s=>s.id===JABAL);
 if(!J)throw new Error('BOWL_TUNE.join: no Jabal ('+JABAL+') in the Bowl\'s settlements');
 J.start=Object.assign({},pool?pool.start:{},J.start);   /* Jabal's own stock wins where both name a good */
 if(pool&&pool.start)Object.keys(pool.start).forEach(g=>{J.start[g]=Math.max(J.start[g]||0,pool.start[g]);});
 V.settlements=setts;
 /* the Train's two rounds re-homed on Jabal, their home legs re-measured */
 const by={};setts.forEach(s=>{by[s.id]=s;});
 const legKm=(a,b)=>{const A=by[a],Bq=by[b];return Math.hypot(A.x-Bq.x,A.z-Bq.z)/1000*T.winding;};
 const mins=km=>Math.max(240,Math.round(km/T.speed*1440));
 const rehomed=[];
 V.roads=CV.roads.map(R=>{
  if(!R.stops||R.stops.indexOf(POOL)<0)return R;
  const stops=R.stops.map(s=>s===POOL?JABAL:s),n=stops.length;
  const legs=(R.legs||[]).map((m,i)=>{const a=stops[i],b=stops[(i+1)%n];
   return(R.stops[i]===POOL||R.stops[(i+1)%n]===POOL)?mins(legKm(a,b)):m;});
  rehomed.push(R.id);
  return Object.assign({},R,{stops,legs:legs.length?legs:undefined});
 }).concat(B.roads);
 V._bowl={rehomed,pooled:!!pool,jabal:JABAL,places:T.places.length,rings:T.places.filter(P=>P.ring).length,
  trade:T.trade.map(R=>R.id)};
 return V;};
return T;})();
if(typeof module!=='undefined')module.exports=BOWL_TUNE;
