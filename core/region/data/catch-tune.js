// ================================================================= CORE/REGION DATA — the Catch's tune (C0)
// [G data] core/simulation/PROPOSAL-CATCH.md, step C0 (the owner, 2026-11-16: "make proposal for integrating the Catch and
// its oases to the simulation ... Stair will have a pop of 750. other oases will be ~100 or less", "also integrate the
// Twins", and the seven answers of section 5). The crossing between the Catch's north road and Strongbow as data for
// core/region's valley host (core/region/50-region-valley.js, H.simValley), in Xanadu's frame (XAN_TUNE.px), so it joins
// Xanadu and Longsong in EAST_RIFT at step C6. Read in place by the tests (core/region/tests/test-catch.js).
//   CATCH_TUNE.px(px, py)    metres from px 1191,1569 (2 km a pixel): Xanadu's frame
//   CATCH_TUNE.goods         every good and its unit; water in litres
//   CATCH_TUNE.diet          a person's day by the kind of place (stair, oasis, works, monks)
//   CATCH_TUNE.calendar      the Catch's year: the salt pans worked in the cool months (the storms and the col are C5's)
//   CATCH_TUNE.places        Stair, the oases, the salt works, the Godsgate's caravanserai, the Twins' stations, the Brotherhood's Stair house, the
//                            White Gills (section 1 of the proposal; the people are the owner's, the split of an oasis
//                            between its keepers and the Twins' numbers are proposed)
//   CATCH_TUNE.caravan       a caravan's beasts: how many a carrier leads, what one drinks and eats a day (C2)
//   CATCH_TUNE.valley(o)     the valley spec; o {scale (people an actor stands for: 10), days (the stocked start: 400)}
// C0 declares the places on their own make and a stocked start: no caravans yet (C3 puts each group's round through the
// crossing, in place of Xanadu's gateways). The oases farm nothing (the owner's ruling of 2026-10-23, "no oasis waters
// fields"): they draw water, cut reed and tamarisk for fodder and buy the rest from the caravans. A well is a work drawing
// on a site that recharges each night up to its store (SIM.site's regen), into a cistern (the work's cap), so it draws
// only what is used and holds what the aquifer gives.
var CATCH_TUNE=(function(){'use strict';
const T={},D=1/365;
T.px=(px,py)=>({x:(px-1191)*2000,z:(py-1569)*2000});
T.goods={grain:{unit:'kg'},salt:{unit:'kg'},tea:{unit:'kg'},tools:{unit:'kg'},sulfur:{unit:'kg'},
 water:{unit:'l'},fodder:{unit:'kg'},soda:{unit:'kg'},potash:{unit:'kg'},saltpeter:{unit:'kg'},gypsum:{unit:'kg'},
 alloy:{unit:'kg'},cells:{unit:'cell'}};
/* a person's day: the oases' and Stair's people buy their grain, tea and tools from the caravans; water is drawn at home
   (litres: drinking and the pot in the dry) */
T.diet={stair:{grain:165*D,salt:7*D,tea:1.5*D,tools:.5*D,water:10},
 oasis:{grain:170*D,salt:7*D,tea:1*D,tools:.3*D,water:8},
 works:{grain:190*D,salt:7*D,tea:1*D,tools:1.2*D,water:10},
 monks:{grain:150*D,salt:5*D,tea:2*D,water:6},
 /* the Godsgate's caravanserai (S1): it grows nothing at 3,590 m and buys its whole table off the trains, but it has
    snowmelt at the divide, so water is the one thing it is not short of. More tools than an oasis: it is a repair stop */
 serai:{grain:175*D,salt:7*D,tea:1.5*D,tools:1.2*D,water:12}};
/* the year: core/clock's, Xanadu's clock (year day 0 is the clock's 259). The Catch floor is BWk: the pans are raked in the
   cool months, when the brine is not boiling off the bed faster than the rakers can draw it (proposed) */
T.calendar={windows:{pans:[300,90]}};
T.yearDay0=259;
/* a caravan's beasts (C2, proposed): a pack train of mules and camels, a carrier's load on 40 of them; a beast drinks about
   30 litres and eats about 6 kg of fodder a day on the crossing */
T.caravan={beasts:40,eat:{water:30,fodder:6},loss:.5,maxDays:6};   /* maxDays: a train carries six days' water and fodder; a longer leg (the off-map roads home) has waters of its own */
/* THE PLACES. id (the map's pin where it has one), name, faction, px, py, people, kind (its diet), parent (a house in a town),
   wells: [l a day the aquifer gives, days it stores], fodder: kg a day the reed beds and tamarisk give, and what else it
   makes. Kolli and Lasso are each split between their two keepers (the owner's answer 4: "Each caravan group keeps hands
   at its own well": both Iziz houses at Kolli, Yuni's Guild and the Geomancers at Lasso; the split is proposed) */
T.places=[
 {id:'s2o8f4p123',name:'Stair (the crossing\'s entrepôt, in the Hill arcology\'s springs\' hollow)',faction:'stair',px:1106,py:1442,people:690,kind:'stair',
  well:[400000,30],fodder:6000,make:{alloy:8000,cells:400},salvageYears:60,repairs:true},
 {id:'horns.stair',name:'The Brotherhood of the Two Horns: the guild house at the Stair gate',faction:'horns',px:1106.5,py:1442.5,people:60,kind:'stair',parent:'s2o8f4p123'},
 {id:'scatchkolli01',name:'Kolli, "the cold one": the Getmastarz well (snowmelt at the north fan\'s toe)',faction:'getmastarz',px:1058,py:1367,people:40,kind:'oasis',well:[80000,20],fodder:2000},
 {id:'scatchkolli01.goldanda',name:'Kolli: the Goldanda well, across the reed bed',faction:'goldanda',px:1058.5,py:1367.5,people:40,kind:'oasis',well:[80000,20],fodder:2000},
 {id:'scatcharfwai01',name:'Arfwai, "halfway": the Train of Jabal\'s lined well, by the road to the salt pans',faction:'train',px:1090,py:1387,people:60,kind:'oasis',well:[50000,15],fodder:1500},
 {id:'scatchbitta01',name:'Bitta, "bitter water": the brackish well kept by Stair\'s pens',faction:'stair',px:1088,py:1455,people:40,kind:'oasis',well:[60000,20],fodder:1500},
 {id:'scatchlasso01',name:'Lasso, "the last water": the Yuni Merchants\' Guild\'s well, 4 km from the Rīfar al-Layl',faction:'yuniguild',px:1083,py:1474,people:50,kind:'oasis',well:[200000,10],fodder:3000},
 {id:'scatchlasso01.geo',name:'Lasso: the Geomancers\' well and pens',faction:'geomancer',px:1083.5,py:1474.5,people:50,kind:'oasis',well:[200000,10],fodder:3000},
 {id:'svhmyhf33w',name:'Ṣalṭ al-Bān, the Catch salt works (the Train of Jabal\'s pans)',faction:'train',px:1080,py:1428,people:120,kind:'works',well:[4000,15],fodder:1000,
  pans:{salt:600000,soda:200000,potash:60000,saltpeter:30000,gypsum:100000}},
 /* THE GODSGATE (S1 of openworld/catch-bowl/PLAN-SIM.md section 2; the owner, 2026-11-24 kept the pin: "Agree keep
    both"). Bab al-Hawa, the Vent-Shaft Caravanserai at the pass's divide: the sunken apron inside the Ancients'
    cyclopean wind-baffle crescent, round the 40 m collar of the ruined Parabola-Stair bore's ventilation shaft, which
    still drafts +16 degC air up through its rubble. It is the pass's ONLY safe overnight camp, out of the 80-130 km/h
    nocturnal God-Bore. px 1027,1258 is the Godsgate corridor's own floor at that row (+3,590 m), not the map's present
    pin 1,205 m up the east wall: the move is queued (openworld/catch-bowl/MAP-EDITS.md edit 2).
    What it sells is NIGHTS, water and a night's fodder. Nothing is CUT at 3,590 m -- the `fodder` below is not a reed
    bed but the serai's BARNS, hay winched and carried up 2,400 m and stacked through the summer, which is how a
    caravanserai on an artery works. It has to be there: `provision` draws the beasts' water and fodder at EVERY stop
    (core/simulation/77-sim-6-trade.js, "the beasts water and feed whether or not the stop trades"), so a stop with no
    fodder is a sink that can never be filled. Written without it, the serai ran 321,624 kg short of fodder in a year
    and House Goldanda -- the second of the two houses to load at the shared Iziz pool -- landed no iron at Strongbow at
    all, while Getmastarz landed 4.0 t: openworld/catch-bowl/PLAN-SIM.md 2y has the diagnosis. 1,000 kg a day carries
    the traffic with a little over; `forHalts` therefore no longer hauls fodder as freight, which is capacity the trade
    goods get back. People: 120 permanent (the owner, 2026-11-24), the keepers, the
    shaft's winch crew and the Oasis Stations' hands; Gemini's 320 counts the caravans in residence, which the sim
    holds as halts instead. Faction: Stair's merchants, who keep Bitta's brackish well the same way (proposed) */
 {id:'godsgate.babalhawa',name:'Bab al-Hawa, the Vent-Shaft Caravanserai (the Godsgate\'s only safe night)',faction:'stair',px:1027,py:1258,people:120,kind:'serai',
  well:[120000,15],fodder:1000,repairs:true},   /* fodder: the BARNS, carried up and stacked, not anything cut here (above) */
 /* the Twins (biomes/twins/PLAN.md section 3): the Brotherhood's waystations, hot springs and heated stone corrals */
 {id:'twins.sinter',name:'Sinter-Gate (Bāb al-Bukhār): Route B\'s south gate, the Brotherhood\'s south-west toll house',faction:'horns',px:996,py:1504,people:20,kind:'oasis',well:[80000,10],fodder:1500},
 {id:'twins.kettle',name:'Mud-Kettle Hollow (a maar crater of mud pots)',faction:'horns',px:1005,py:1489,people:10,kind:'oasis',well:[20000,10],fodder:600},
 {id:'twins.brazier',name:'The Brazier (Al-Miǧmarah): the mid-pass crossroads and the Shrine of the Split Horn',faction:'horns',px:1016,py:1479,people:30,kind:'oasis',well:[50000,10],fodder:1500},
 {id:'twins.tarn',name:'Brimstone-Tarn (a sulfur tarn)',faction:'horns',px:1031,py:1473,people:10,kind:'oasis',well:[20000,10],fodder:600,make:{sulfur:20000},salvageYears:200},
 {id:'twins.lookout',name:'Catch-Lookout Spring (where caravans wash the alkali from their eyes)',faction:'horns',px:1056,py:1462,people:20,kind:'oasis',well:[60000,10],fodder:2000},
 {id:'twins.hall',name:'The Hall of the Tally-Marks (Route A\'s overnight cistern in tube A3)',faction:'horns',px:1014,py:1464,people:15,kind:'oasis',well:[30000,30],fodder:800},
 /* the History Monks' hermitage in the White pipe field (the owner, 2026-11-16: "White pipe field. 15 monks"): it doubles
    as Route A's caravan stop, its saltcups the only potable water between Bitta and Lasso (biomes/gills/PLAN.md) */
 {id:'sttkxo9ndy',name:'The White Gills Hermitage (the History Monks\' house in the White pipe field; it doubles as a caravan stop)',faction:'order',px:1015,py:1430,people:15,kind:'monks',well:[40000,20],fodder:600}];
T.factions=[{id:'stair',name:'The merchants of Stair (water, fodder, repairs and news)'},
 {id:'train',name:'The Train of Jabal (the Dasri\'s salt caravan company: the Catch\'s and Solta\'s salt works)'},
 {id:'getmastarz',name:'House Getmastarz, the Gatemasters (an Iziz merchant noble house: the treks past the Godsgate)'},
 {id:'goldanda',name:'House Goldanda, "gold hand" (an Iziz merchant noble house: the bankers of the eastern road)'},
 {id:'yuniguild',name:'The Yuni Merchants\' Guild (on its own account, independent of the Geomancers)'},
 {id:'geomancer',name:'The Geomancers (the drilling guild of Locus)'},
 {id:'horns',name:'The Brotherhood of the Two Horns (the Twins\' guides and merchant houses)'},
 {id:'order',name:'The History Monks (the Order of Longsong)'}];
/* the rivals are wary of each other (they still trade): the two Iziz houses; the Train and the Iziz houses (the Train's salt
   monopoly); Yuni's Guild and the Geomancers. Everyone else friendly */
T.rivals=[['getmastarz','goldanda'],['train','getmastarz'],['train','goldanda'],['yuniguild','geomancer']];
T.valley=function(o){o=o||{};const K=o.scale==null?10:o.scale,yr=365,days=o.days==null?400:o.days,at=(px,py)=>T.px(px,py);
 const win=w=>{const W=T.calendar.windows[w];return(W[1]-W[0]+yr)%yr;};
 const rate=(perYr,crew,d)=>perYr/(Math.max(1,Math.round(crew/K))*K*(d==null?yr:d)*12);
 const S=T.places.map(P=>{const p=at(P.px,P.py),diet=T.diet[P.kind],n=P.people,works=[];
  /* the market (a road lands in a settlement's first work), then the well, the fodder, what else it makes */
  works.push({id:P.id+'.market',kind:P.parent?'guild-house':'market',name:P.parent?'the guild house':'the market and its pens',crew:Math.min(20,Math.round(n*.1)),out:[],rate:0});
  if(P.well){const[lDay,store]=P.well,crew=Math.max(2,Math.round(n*.1));
   works.push({id:P.id+'.well',kind:'well',name:'the well and its cistern',crew,out:['water'],rate:rate(lDay*yr,crew),cap:lDay*store,
    site:{kind:'aquifer',amount:lDay*store,regen:lDay}});}
  if(P.fodder){const crew=Math.max(2,Math.round(n*.15));
   works.push({id:P.id+'.fodder',kind:'reed-bed',name:'the reed bed and the tamarisk',crew,out:['fodder'],rate:rate(P.fodder*yr,crew),cap:P.fodder*60,
    site:{kind:'reeds',amount:P.fodder*60,regen:P.fodder}});}
  Object.keys(P.make||{}).forEach(g=>{const crew=Math.max(2,Math.round(n*.1));
   works.push({id:P.id+'.'+g,kind:g==='sulfur'?'sulfur-diggings':'divers',name:g==='sulfur'?'the tarn\'s sulfur':'the arcology divers\' '+g,crew,out:[g],rate:rate(P.make[g],crew),
    site:{kind:g==='sulfur'?'sulfur':'salvage',amount:P.make[g]*P.salvageYears}});});
  Object.keys(P.pans||{}).forEach(g=>{const crew=Math.round(n*.7/5),kg=P.pans[g];
   works.push({id:P.id+'.'+g,kind:'pans',name:'the pans\' '+g,crew,out:[g],rate:rate(kg,crew,win('pans')),season:'pans',
    site:{kind:'evaporite',amount:kg*20,regen:kg/yr*.5}});});   /* the beds refill slowly: half a season's draw a year */
  if(P.repairs)works.push({id:P.id+'.repairs',kind:'repairs',name:'the wheelwrights, farriers and saddlers',crew:40,out:[],rate:0});
  const start={};Object.keys(diet).forEach(g=>{start[g]=Math.ceil(n*diet[g]*days);});
  if(P.well)start.water=P.well[0]*3;   /* a well's own water: three days of its yield drawn, the cistern fills from the aquifer */
  if(P.fodder)start.fodder=P.fodder*10;   /* ten days of reed and tamarisk cut and stacked */
  return{id:P.id,name:P.name,faction:P.faction,parent:P.parent,people:n,x:p.x,z:p.z,scale:K,eats:Object.assign({},diet),keepDays:20,start,works};});
 /* a house in a town drinks from the town's well: the town sends it water (and nothing else: the house keeps its own table) */
 const R=[];T.places.filter(P=>P.parent).forEach(P=>{R.push({id:'road.'+P.id,from:P.parent,to:P.id,minutes:30,cap:20000,want:5,goods:{[P.parent]:['water']}});});
 const F=T.factions.map(f=>f.id),wary=(a,b)=>T.rivals.some(([x,y])=>(x===a&&y===b)||(x===b&&y===a));
 return{seed:20261117,scale:K,start:0,calendar:T.calendar,goods:T.goods,factions:T.factions,
  relations:[].concat(...F.map(a=>F.filter(b=>b!==a).map(b=>({a,b,stance:wary(a,b)?'wary':'friendly'})))),
  settlements:S,roads:R,transfers:[]};};
/* ---- C3-C5: THE CROSSING JOINED TO XANADU. CATCH_TUNE.join(XV, o) takes XAN_TUNE.valley's spec and returns one valley:
   the Catch's places added, and Xanadu's four Catch gateways (gate.iziz, gate.dasri, gate.yuni, gate.geomancers: an
   off-map pool each, joined to its entry town by one long road) become the five groups' caravan rounds through the
   crossing, out and back (section 2 of the proposal; the owner's answers 1-5). Each round leaves its home's pool (the
   gateway's, still off the map) by the north road (Kolli, Arfwai) or the Train's (Arfwai), crosses the Catch floor
   (Stair, Bitta, Lasso), the Twins by Route A or B (C4) and comes down to Strongbow; Yuni's Guild and the Geomancers go
   on to Qiblai. The oases are halts: the caravan rests and its beasts drink and feed there (C2's provision) with the cargo
   aboard; the peopled ones are selling halts (a carrier leaving a trade stop loads for them too and lands their want as
   it passes: the oases and Stair live on the trade). The Train also works the salt works (a round of its own to Strongbow).
   The Sultan's toll, the Brotherhood's Split Tally and the houses' margins move from the gateway roads onto the rounds:
   the toll and the tally's two halves cut where the caravan lands inside Xanadu (the tally's gate half to Sinter-Gate,
   its shrine half to the Brazier on Route B or the Hall of the Tally-Marks on Route A: C4), its outbound half at home to
   the Brotherhood's Stair house, as Xanadu's tune had it.
   o: {unguided: [group id, ...] (they refuse the guides: no tally, and the Twins take part of the train: C4),
       hazards: false (C5's storms, col, Stalkers and dry oasis off)} */
T.speed=30;   /* a pack caravan's km a day on the crossing (24-40: the proposal's section 1c) */
T.muster=60;  /* days over which the four home pools' caravan seasons are spread, nearest home first (the owner,
                 2026-11-25: "we would probably expect them to arrive at different times as caravans may be coming from
                 as far as Iziz, Jabal, Verge, or Yuni"). A declared window, not a derived one: see the note at T.join's
                 stagger. Four pools at 60 days gives 0, 15, 30 and 45, and the two Iziz houses split their 15 */
T.winding=1.25;   /* road over straight line */
/* the homes, off the map: the leg from the home's pool to the first water, km (section 1c: Iziz to Stair about 1,232 km
   by Arcbeam, Parabola and the Godsgate; Yuni to Stair about 1,415 by Mantis; Locus 92 km beyond Yuni; Jabal to Arfwai by
   the Train's road) */
/* S1: the four groups that come over the Godsgate now stop at Bab al-Hawa, so their home leg ends there instead of at
   Kolli and the pass-to-Kolli stretch (283 km by legKm) is a leg of its own. The totals of section 1c are unchanged:
   Iziz to Stair is still about 1,232 km, Yuni's about 1,415. The Train comes out of Jabal to Arfwai and never crosses
   the pass, so its home is untouched. */
T.homes={'gate.iziz':{km:757},'gate.yuni':{km:942},'gate.geomancers':{km:1017},'gate.dasri':{px:[1225,1149]}};
/* the groups (section 2): their pool (Xanadu's gateway), their caravans, their own wells, their terminus, their Twins
   route (C4: packs take Route A's tubes, wagons and herds Route B's open dash), and whether they carry explosives (the
   Stalkers keep off: the Geomancers') */
T.groups=[
 {id:'getmastarz',pool:'gate.iziz',name:'House Getmastarz\'s caravans (Iziz, past the Godsgate)',north:['godsgate.babalhawa','scatchkolli01','scatcharfwai01'],end:'sfgtxw10kr',route:'A',carriers:4,cap:40000,share:.5},
 {id:'goldanda',pool:'gate.iziz',name:'House Goldanda\'s caravans (Iziz, the bankers of the eastern road)',north:['godsgate.babalhawa','scatchkolli01.goldanda','scatcharfwai01'],end:'sfgtxw10kr',route:'A',carriers:4,cap:40000,share:.5},
 {id:'train',pool:'gate.dasri',name:'The Train of Jabal (the Dasri\'s salt caravans)',north:['scatcharfwai01'],end:'sfgtxw10kr',route:'B',carriers:6,cap:30000,share:1},
 {id:'yuniguild',pool:'gate.yuni',name:'The Yuni Merchants\' Guild\'s caravans',north:['godsgate.babalhawa','scatchkolli01','scatcharfwai01'],lasso:'scatchlasso01',end:'skm4jjo2vl',route:'B',carriers:10,cap:20000,share:1},
 {id:'geomancer',pool:'gate.geomancers',name:'The Geomancers\' oil caravans',north:['godsgate.babalhawa','scatchkolli01','scatcharfwai01'],lasso:'scatchlasso01.geo',end:'skm4jjo2vl',route:'B',carriers:4,cap:30000,share:1,explosives:true}];
/* Route A (the owner, 2026-11-16: "Vale chasm with strongbow branch"): from the Catch's fan by the White Gills
   Hermitage into the tubes, the Hall of the Tally-Marks, then the Strongbow branch's galleries down to Strongbow (the
   Vale's portal is the way on into the Vale, not the caravans' to Strongbow); Route B by its five oases */
T.twins={A:['sttkxo9ndy','twins.hall'],B:['twins.tarn','twins.brazier','twins.kettle','twins.sinter'],shrine:{A:'twins.hall',B:'twins.brazier'}};
T.kgPerBeast=200;   /* a pack beast's load: a carrier's beasts are its cap over this */
/* the seasons (the owner's answer 5, 2026-11-16: "both close"; the windows are proposed): the spring black storms close
   the Catch floor about six weeks; winter shuts the Twins' col to Route B (Route A's tubes stay open to packs); Arfwai's
   well runs low in late summer */
/* S1 adds the Godsgate's two (biomes/seouterwall/PLAN.md section 2, the numbers proposed):
   - `bore`: the nightly katabatic God-Bore, 80-130 km/h down every couloir from two hours after dusk until after dawn.
     All year, not a season. The rate is LOW because Bab al-Hawa is there to shelter in; a train that could not reach it
     is the region's event, not a leg's rate (openworld/catch-bowl/PLAN-SIM.md 2c).
   - `whiteout`: the flash rime-fog banks of winter, 80 km of visibility to under 12 m in minutes. A LOSS, not a
     closure: they are sudden, not seasonal, and the Catch floor's storms and the Twins' col are the crossing's two
     real closures. Closing the pass for the whole window instead would shut the crater's road to Xanadu for a third of
     the year, which the lore does not say and which would swing every book that depends on the crossing. */
T.hazards={windows:{storms:[70,112],col:[330,60],dry:[200,260],whiteout:[300,60]},
 stalkers:{every:6,spare:5,share:.05},gales:{every:4,spare:3,share:.04},unguided:{every:3,spare:1,share:.25},dryRegen:.3,
 bore:{every:5,spare:4,share:.03},whiteout:{every:4,spare:3,share:.05}};
T.join=function(XV,o){o=o||{};const C=T.valley({scale:XV.scale==null?10:Math.min(10,XV.scale)}),haz=o.hazards!==false,un=o.unguided||[];
 const V=Object.assign({},XV),X=XAN_TUNE,at=(px,py)=>T.px(px,py);
 /* the places: the Catch's join Xanadu's (its Stair house replaces Xanadu's off-map stand-in, horns.stair) */
 V.settlements=XV.settlements.filter(s=>s.id!=='horns.stair').concat(C.settlements);
 V.goods=Object.assign({},XV.goods,C.goods);
 V.factions=XV.factions.concat(C.factions.filter(f=>!XV.factions.some(g=>g.id===f.id)));
 const rel=XV.relations.slice(),has=(a,b)=>rel.some(r=>r.a===a&&r.b===b);
 C.relations.forEach(r=>{if(!has(r.a,r.b))rel.push(r);});
 V.factions.forEach(f=>V.factions.forEach(g=>{if(f.id!==g.id&&!has(f.id,g.id))rel.push({a:f.id,b:g.id,stance:'friendly'});}));
 V.relations=rel;
 V.calendar=Object.assign({},XV.calendar,{windows:Object.assign({},XV.calendar.windows,C.calendar.windows,T.hazards.windows)});   /* the seasons always named; the hazards act only when on */
 /* the gateways' long roads go; their pools stay (the homes), now holding the grain, tea and tools the crossing buys too,
    and the water and fodder a train takes on at home */
 const gone=['trade.gate.iziz','trade.gate.dasri','trade.gate.yuni','trade.gate.geomancers'];
 V.roads=XV.roads.filter(r=>gone.indexOf(r.id)<0).concat(C.roads);
 const S=id=>V.settlements.find(s=>s.id===id),G=id=>X.gateways.find(g=>g.id===id);
 T.groups.forEach(g=>{const P=S(g.pool);P.start=Object.assign({},P.start,{grain:5e6,tea:2e5,tools:2e5,water:1e9,fodder:1e8});});
 /* the caravanserais where the trains turn round inside Xanadu (Strongbow's at the lift, Qiblai's by the oil field):
    their wells and fodder yards water and feed the beasts for the road back (proposed) */
 const yr=365,K2=XV.scale==null?10:XV.scale;
 [['sfgtxw10kr',120000,20000],['skm4jjo2vl',80000,12000]].forEach(([id,lDay,fDay])=>{const s=S(id),crew=40,r=(perYr,c)=>perYr/(Math.max(1,Math.round(c/(s.scale||K2)))*(s.scale||K2)*yr*12);
  s.works=s.works.concat([{id:id+'.serai.well',kind:'well',name:'the caravanserai\'s wells',crew,out:['water'],rate:r(lDay*yr,crew),cap:lDay*10,site:{kind:'aquifer',amount:lDay*10,regen:lDay}},
   {id:id+'.serai.fodder',kind:'fodder-yard',name:'the caravanserai\'s fodder yard',crew,out:['fodder'],rate:r(fDay*yr,crew),cap:fDay*60}]);
  s.start=Object.assign({},s.start,{water:lDay*3,fodder:fDay*10});});
 const legKm=(a,b)=>{const A=S(a),B=S(b);return Math.hypot(A.x-B.x,A.z-B.z)/1000*T.winding;},mins=km=>Math.max(240,Math.round(km/T.speed*1440));
 const peopled=id=>{const s=S(id);return s&&s.people>0&&!/^gate\./.test(id);};
 /* THE CARAVANS LEAVE IN TURN, AND THEIR PHASES FOLLOW HOW FAR THEY COME (the owner, 2026-11-25: first "can we
    stagger house departures so they don't step on each other like that", then "we would probably expect them to arrive
    at different times as caravans may be coming from as far as Iziz, Jabal, Verge, or Yuni").

    The first version staggered only the groups that SHARE a pool -- the two Iziz houses, both out of gate.iziz, which
    had identical rounds and identical first sailings, so they reached the warehouse on the same minute and contended
    for the same cargo (PLAN-SIM.md 2z). Every other group still left on the same hour as every other, and S4 found
    what that costs: with the gateway roads replaced by caravan rounds, the far ends of Xanadu's distribution run dry
    between arrivals, 10.1 t of salt over 116 settlements in 120 days (PLAN-SIM.md 6b).

    THE PHASES NOW FOLLOW THE HOMES' DISTANCES, which is the owner's reasoning: a train out of the Geomancers' country
    has 1,017 km to come and one out of Jabal 684, so they do not muster on the same morning and they do not arrive on
    the same week. The pools are ordered by their home leg, and each takes an even slice of `T.muster`; a pool shared by
    two houses splits its own slice between them.

    `T.muster` IS A CHOICE AND IS HERE TO BE SEEN. The distances alone only spread the five by about eleven days (333 km
    between the nearest home and the furthest, at 30 km a day), which is not enough to flatten a 133-day round's
    arrivals. The spread wanted is the caravan season's -- houses do not all leave on the same morning even from the
    same city -- so the window is declared rather than derived, and it is one number to turn if the owner wants the
    arrivals tighter or looser. The ORDER within it is the map's; only its width is a judgement.
    A first version sliced each group's OWN stagger instead, which put Yuni's Guild and House Getmastarz on the same
    day eight days in, because a group's stagger is its round over its carrier count and the five are not comparable.
    One shared window fixes that: every phase is in the same units. */
 const poolOf={};T.groups.forEach(g=>{(poolOf[g.pool]=poolOf[g.pool]||[]).push(g.id);});
 const kmOfPool=p=>{const h=T.homes[p];if(h.km!=null)return h.km;
  const g0=T.groups.find(q=>q.pool===p);
  return Math.hypot(at(h.px[0],h.px[1]).x-S(g0.north[0]).x,at(h.px[0],h.px[1]).z-S(g0.north[0]).z)/1000*T.winding;};
 const poolsByKm=Object.keys(poolOf).sort((a,b)=>kmOfPool(a)-kmOfPool(b));
 T.groups.forEach(g=>{const GW=G(g.pool),south=g.north.concat(['s2o8f4p123','scatchbitta01',g.lasso||'scatchlasso01'],g.route==='A'?[]:['twins.lookout'],T.twins[g.route]);
  const yuni=g.end==='skm4jjo2vl',out=[g.pool].concat(south,['sfgtxw10kr'],yuni?['skm4jjo2vl']:[]),back=out.slice(1,-1).reverse();
  const stops=out.concat(back),n=stops.length,endIdx=out.length-1;
  const home=T.homes[g.pool],homeKm=home.km!=null?home.km:Math.hypot(at(home.px[0],home.px[1]).x-S(g.north[0]).x,at(home.px[0],home.px[1]).z-S(g.north[0]).z)/1000*T.winding;
  const legs=stops.map((s,i)=>{const t=stops[(i+1)%n];if(s===g.pool||t===g.pool)return mins(homeKm);return mins(legKm(s,t));});
  const halts=[],sells=[];stops.forEach((s,i)=>{if(s===g.pool||i===endIdx)return;if(yuni&&s==='sfgtxw10kr'){halts.push(i);sells.push(i);return;}halts.push(i);if(peopled(s))sells.push(i);});
  const exp={};GW.out.forEach(x=>{if(X.gateWant[x])exp[x]=X.gateWant[x]*g.share/ (X.gateways.filter(q=>q.out.indexOf(x)>=0).length);});
  const goods={[g.pool]:GW.in.concat(['grain','tea','tools']),[g.end]:GW.out.slice()};
  stops.forEach(s=>{if(!goods[s])goods[s]=[];});
  const expect={[g.pool]:exp,[g.end]:{iron:30*g.share,arms:.5*g.share,pearls:.06,wine:3,oil:2}};
  const share=poolOf[g.pool],stagger=Math.round(legs.reduce((a,b)=>a+b,0)/g.carriers);
  /* the pool's own slice of the muster window, by how far its caravans come, and the house's share of that slice */
  const slice=T.muster*1440/poolsByKm.length,poolIdx=poolsByKm.indexOf(g.pool);
  const Rd={id:'caravan.'+g.id,stops,legs,mins:720,cap:g.cap,carriers:g.carriers,stagger,
   offset:Math.round(poolIdx*slice+slice*share.indexOf(g.id)/share.length),keep:20,want:Math.max(90,Math.round(legs.reduce((a,b)=>a+b,0)/1440)),
   goods,expect,halts,sells,forHalts:['grain','tea','tools'],provision:{beasts:Math.round(g.cap/T.kgPerBeast),eat:T.caravan.eat,loss:T.caravan.loss,maxDays:T.caravan.maxDays,home:0},_group:g,_stops:{end:endIdx}};
  /* the cuts: the Sultan's toll on what the caravan lands inside Xanadu (at the Strongbow lift; for the Qiblai caravans,
     on what they land at Qiblai having come up it); the tally's two halves on the same landings, and its outbound half at
     home; the Brotherhood's margin at Qiblai where its factor stands */
  const land=g.end,guided=un.indexOf(g.id)<0;
  const tg=GW.in.concat(GW.out);Rd.cut=[{at:land,to:'xan.citadel',share:X.toll,goods:tg,why:'the Sultan\'s toll at the Strongbow lift'}];
  if(guided)Rd.cut.push({at:land,to:'twins.sinter',share:X.horns.tally,goods:tg,why:'the guides\' tally, the gate half (Sinter-Gate)'},
   {at:land,to:T.twins.shrine[g.route],share:X.horns.tally,goods:tg,why:'the guides\' tally, the shrine half ('+(g.route==='A'?'the Hall of the Tally-Marks':'the Brazier')+')'},
   {at:g.pool,to:'horns.stair',share:X.horns.tally,goods:tg,why:'the guides\' tally outbound, at Stair'});
  if(yuni)Rd.cut.push({at:'skm4jjo2vl',to:'horns.qiblai',share:X.horns.margin,goods:tg,why:'the merchant house\'s margin'});
  /* C4-C5's losses and closings, by leg (the leg from stop i is legs[i]) */
  const twinsLegs=[],floorLegs=[],colB=[];
  /* the Twins' legs: from the lookout over the col to Strongbow and back; the Catch floor's: the north road's (Kolli,
     Arfwai) to Stair, the floor the storms close; Route B's open dash between the Twins' oases, the col winter shuts */
  const tw=x=>/^twins\./.test(x)||x==='sttkxo9ndy',fl=x=>/^scatch|^s2o8f4p123/.test(x),north=x=>/^scatchkolli01|^scatcharfwai01/.test(x);
  const gg=x=>/^godsgate\./.test(x),ggLegs=[];   /* S1: a leg with the pass at either end */
  stops.forEach((s,i)=>{const t=stops[(i+1)%n];
   if(tw(s)&&(tw(t)||t==='sfgtxw10kr')||s==='sfgtxw10kr'&&tw(t))twinsLegs.push(i);
   if(fl(s)&&fl(t)&&(north(s)||north(t)))floorLegs.push(i);
   if(g.route==='B'&&tw(s)&&tw(t))colB.push(i);
   if(gg(s)||gg(t))ggLegs.push(i);});
  Rd.losses=[];
  if(!guided)Rd.losses.push(Object.assign({legs:twinsLegs,why:'the unguided crossing of the Twins'},T.hazards.unguided));
  if(haz){Rd.closed=[{legs:floorLegs,window:'storms'}];if(colB.length)Rd.closed.push({legs:colB,window:'col'});
   if(!g.explosives)Rd.losses.push(Object.assign({legs:floorLegs,why:'the Stalkers on the Catch floor'},T.hazards.stalkers));
   if(g.route==='A')Rd.losses.push(Object.assign({legs:twinsLegs,window:'col',why:'the cold and gales on the col'},T.hazards.gales));
   if(ggLegs.length){Rd.losses.push(Object.assign({legs:ggLegs,why:'the God-Bore in the Godsgate'},T.hazards.bore));
    Rd.losses.push(Object.assign({legs:ggLegs,window:'whiteout',why:'the rime whiteouts in the Godsgate'},T.hazards.whiteout));}}
  Rd._legs={twins:twinsLegs,floor:floorLegs,colB,godsgate:ggLegs};
  V.roads.push(Rd);});
 /* the Train works the salt works: a round of its own from the pans to Strongbow by Stair and Route B, food back */
 {const g=T.groups.find(x=>x.id==='train'),out=['svhmyhf33w','s2o8f4p123','scatchbitta01','scatchlasso01','twins.lookout'].concat(T.twins.B,['sfgtxw10kr']),
   stops=out.concat(out.slice(1,-1).reverse()),n=stops.length,endIdx=out.length-1,halts=[],sells=[];
  stops.forEach((s,i)=>{if(i===0||i===endIdx)return;halts.push(i);if(peopled(s))sells.push(i);});
  const legs=stops.map((s,i)=>mins(legKm(s,stops[(i+1)%n]))),floorLegs=[],colB=[];
  stops.forEach((s,i)=>{const t=stops[(i+1)%n];if((s==='svhmyhf33w'||t==='svhmyhf33w')&&(t==='s2o8f4p123'||s==='s2o8f4p123'))floorLegs.push(i);
   if((s==='twins.lookout'||/^twins\./.test(s))&&/^twins\./.test(t))colB.push(i);});
  const salts=Object.keys(T.places.find(p=>p.id==='svhmyhf33w').pans),cap=20000;
  V.roads.push({id:'caravan.train.salt',stops,legs,mins:720,cap,carriers:3,stagger:Math.round(legs.reduce((a,b)=>a+b,0)/3),keep:5,want:120,
   goods:Object.fromEntries(stops.map(s=>[s,s==='svhmyhf33w'?salts:s==='sfgtxw10kr'?['grain','tea','tools']:[]])),
   expect:{sfgtxw10kr:{salt:1200,soda:300,potash:90,saltpeter:45,gypsum:150},svhmyhf33w:{grain:120*T.diet.works.grain,tea:120*T.diet.works.tea,tools:120*T.diet.works.tools}},
   halts,sells,provision:{beasts:Math.round(cap/T.kgPerBeast),eat:T.caravan.eat,loss:T.caravan.loss,maxDays:T.caravan.maxDays,home:0},
   cut:[{at:'sfgtxw10kr',to:'xan.citadel',share:X.toll,goods:salts,why:'the Sultan\'s toll at the Strongbow lift'},
    {at:'sfgtxw10kr',to:'twins.sinter',share:X.horns.tally,goods:salts,why:'the guides\' tally, the gate half (Sinter-Gate)'},
    {at:'sfgtxw10kr',to:'twins.brazier',share:X.horns.tally,goods:salts,why:'the guides\' tally, the shrine half (the Brazier)'}],
   closed:haz?[{legs:floorLegs,window:'storms'},{legs:colB,window:'col'}]:undefined,losses:haz?[Object.assign({legs:floorLegs,why:'the Stalkers on the Catch floor'},T.hazards.stalkers)]:[],
   _legs:{floor:floorLegs,colB}});}
 /* C5: Arfwai's well runs low in late summer */
 V.siteSeasons=(V.siteSeasons||[]).concat(haz?[{settlement:'scatcharfwai01',site:'scatcharfwai01.well.site',window:'dry',regen:T.hazards.dryRegen}]:[]);
 return V;};
return T;})();
if(typeof module!=='undefined')module.exports=CATCH_TUNE;
