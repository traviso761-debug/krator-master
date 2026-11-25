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
//   ARCBEAM is "10k + hinterlands", so Gemini's number stands with a countryside added. It is therefore NOT a marker to
//     pass: at 10,000 with 6,000 round it, it is the largest place on the north road after Jabal and a market the
//     caravans trade at, and PLAN-SITES.md's "a marker, massing out to 30 km" is superseded.
//   Its SITE, though, is still open: the owner wants Arcbeam "in an actual canyon that fits the arcology model,
//     preferably someplace it is actually helpful as a bridge", and there is no such canyon inside this region's cut --
//     openworld/catch-bowl/PLAN-SITES.md section 7a has the survey and the three ways out. The census below does not
//     depend on where it stands, so the tune runs either way; `site:'open'` marks it.
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
 shrimp:{unit:'kg'},fish:{unit:'kg'},brick:{unit:'kg'},timber:{unit:'kg'},coffee:{unit:'kg'},cloth:{unit:'m'}};
/* a person's day. The floor is hot and salt: everyone drinks hard (the Bowl's extreme is +47 degC at 1.83 atm,
   biomes/sedesert/PLAN-BOWL.md section 1), and salt is the one thing nobody here lacks */
T.diet={city:{grain:200*D,salt:8*D,tea:2*D,tools:1.5*D,cloth:.4*D,water:18},
 town:{grain:190*D,salt:8*D,tea:1.5*D,tools:.8*D,cloth:.3*D,water:16},
 works:{grain:200*D,salt:8*D,tea:1*D,tools:1.5*D,water:20},        /* the rakers: the hardest work on the floor */
 village:{grain:175*D,salt:7*D,tea:1*D,tools:.5*D,water:14},
 ruin:{grain:180*D,salt:7*D,tea:1*D,tools:.8*D,water:14}};
/* the year (year day 0 is Xanadu's clock's 259, as CATCH_TUNE's): the pans are raked in the cool months, as the Catch's
   are; Mantis's pocket takes the monsoon (1,553 mm, the one wet place on a hot-desert shore); and the floor's high
   summer is too hot to work at all, which no other tune in the repo has had to say */
T.calendar={windows:{pans:[300,90],monsoon:[150,240],deadheat:[20,70]}};
T.yearDay0=259;
/* THE PLACES. id (the map's pin), name, faction, px, py, people, kind (its diet), wells: [l a day the aquifer gives,
   days it stores], and what it makes a year. `pending` marks a census the owner has still to rule on (above). */
T.places=[
 {id:'sa5o6dvjdv',name:'Jabal, the Sheikhdom\'s seat and the Train of Jabal\'s home',faction:'jabal',px:1225,py:1149,people:15000,kind:'city',
  well:[3000000,30],make:{brick:900000,cloth:120000,tools:220000,coffee:40000},serai:[400000,60000],repairs:true},
 {id:'slw9dufqfs',name:'Mantis, the Bowl\'s second city in its green pocket (an Iziz holding under Izani merchant houses)',faction:'mantishouses',px:1113,py:1164,people:15000,kind:'city',
  well:[2200000,25],make:{frankincense:70000,resin:55000,dates:900000,figs:400000,fish:300000,shrimp:140000,cloth:70000,tools:90000},season:{dates:'monsoon'},
  serai:[200000,30000],repairs:true,
  ring:{people:9000,scale:200,make:{grain:5400000,dates:1600000,figs:700000,hides:160000,timber:90000},season:{dates:'monsoon'}}},
 {id:'s0zgu7u6yb',name:'Solta, the Train of Jabal\'s Bowl salt works by the great salt lake',faction:'train',px:1169,py:1150,people:400,kind:'works',
  well:[60000,20],pans:{salt:900000,gypsum:400000}},
 {id:'skz25tuq0w',name:'Arcbeam, the bridge city: the Iziz arcology on the north road (its canyon site is open)',faction:'iziz',px:1016,py:1058,people:10000,kind:'city',site:'open',
  well:[1500000,30],make:{alloy:30000,cells:1200,tools:260000,brick:400000,cloth:50000},salvageYears:80,repairs:true,serai:[250000,40000],
  ring:{people:6000,scale:200,make:{grain:3600000,hides:140000,timber:120000}}},
 {id:'scyeauyek7',name:'Parabola, the Bowl arcology and the north road\'s mustering ground',faction:'iziz',px:970,py:1186,people:450,kind:'ruin',
  well:[200000,25],make:{alloy:9000,cells:400},salvageYears:60,repairs:true},
 {id:'sq11desertw7',name:'Esper, the Bowl\'s farming village',faction:'iziz',px:1042,py:1083,people:220,kind:'village',
  well:[90000,20],fodder:4000,make:{dates:80000,hides:9000,timber:20000}}];
/* the two census rows that were open, with the owner's ruling of 2026-11-24, so a test can see that they were settled
   and how (and so nobody re-opens them from Gemini's file) */
T.ruled=[{ref:'(a)',id:'skz25tuq0w',was:10000,now:10000,ring:6000,
  owner:'"arcbeam can be 10k + hinterlands"; its canyon site stays open (T.places site:\'open\')'},
 {ref:'(b)',id:'slw9dufqfs',was:300,now:15000,ring:9000,
  owner:'"mantis should be a lot bigger than 300, maybe 15000 + hinterlands"'}];
T.factions=[{id:'jabal',name:'The Jabal Sheikhdom (the Dasri\'s Bowl capital)'},
 {id:'train',name:'The Train of Jabal (the Dasri\'s salt caravan company: Solta\'s pans and the Catch\'s)'},
 {id:'mantishouses',name:'The Izani merchant houses of Mantis (frankincense, resin and the lake\'s take)'},
 {id:'iziz',name:'The Empire of Iziz (Arcbeam, Parabola and Esper)'}];
/* the Train sells salt to all comers and holds both works, which the Izani houses -- who once had Solta's salt --
   resent (the owner, 2026-11-16: "Solta too"); everyone else friendly */
T.rivals=[['train','mantishouses']];
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
 const F=T.factions.map(f=>f.id),wary=(a,b)=>T.rivals.some(([x,y])=>(x===a&&y===b)||(x===b&&y===a));
 return{seed:20261124,scale:K,start:0,calendar:T.calendar,goods:T.goods,factions:T.factions,
  relations:[].concat(...F.map(a=>F.filter(b=>b!==a).map(b=>({a,b,stance:wary(a,b)?'wary':'friendly'})))),
  settlements:S.concat(RINGS),roads:RR,transfers:[]};};
return T;})();
if(typeof module!=='undefined')module.exports=BOWL_TUNE;
