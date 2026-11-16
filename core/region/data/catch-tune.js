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
//   CATCH_TUNE.places        Stair, the oases, the salt works, the Twins' stations, the Brotherhood's Stair house, the
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
 monks:{grain:150*D,salt:5*D,tea:2*D,water:6}};
/* the year: core/clock's, Xanadu's clock (year day 0 is the clock's 259). The Catch floor is BWk: the pans are raked in the
   cool months, when the brine is not boiling off the bed faster than the rakers can draw it (proposed) */
T.calendar={windows:{pans:[300,90]}};
T.yearDay0=259;
/* a caravan's beasts (C2, proposed): a pack train of mules and camels, a carrier's load on 40 of them; a beast drinks about
   30 litres and eats about 6 kg of fodder a day on the crossing */
T.caravan={beasts:40,eat:{water:30,fodder:6},loss:.5};
/* THE PLACES. id (the map's pin where it has one), name, faction, px, py, people, kind (its diet), parent (a house in a town),
   wells: [l a day the aquifer gives, days it stores], fodder: kg a day the reed beds and tamarisk give, and what else it
   makes. Kolli and Lasso are each split between their two keepers (the owner's answer 4: "Each caravan group keeps hands
   at its own well": both Iziz houses at Kolli, Yuni's Guild and the Geomancers at Lasso; the split is proposed) */
T.places=[
 {id:'s2o8f4p123',name:'Stair (the crossing\'s entrepôt, in the Hill arcology\'s springs\' hollow)',faction:'stair',px:1106,py:1442,people:690,kind:'stair',
  well:[400000,30],fodder:900,make:{alloy:8000,cells:400},salvageYears:60,repairs:true},
 {id:'horns.stair',name:'The Brotherhood of the Two Horns: the guild house at the Stair gate',faction:'horns',px:1106.5,py:1442.5,people:60,kind:'stair',parent:'s2o8f4p123'},
 {id:'scatchkolli01',name:'Kolli, "the cold one": the Getmastarz well (snowmelt at the north fan\'s toe)',faction:'getmastarz',px:1058,py:1367,people:40,kind:'oasis',well:[25000,20],fodder:250},
 {id:'scatchkolli01.goldanda',name:'Kolli: the Goldanda well, across the reed bed',faction:'goldanda',px:1058.5,py:1367.5,people:40,kind:'oasis',well:[25000,20],fodder:250},
 {id:'scatcharfwai01',name:'Arfwai, "halfway": the Train of Jabal\'s lined well, by the road to the salt pans',faction:'train',px:1090,py:1387,people:60,kind:'oasis',well:[15000,15],fodder:120},
 {id:'scatchbitta01',name:'Bitta, "bitter water": the brackish well kept by Stair\'s pens',faction:'stair',px:1088,py:1455,people:40,kind:'oasis',well:[30000,20],fodder:300},
 {id:'scatchlasso01',name:'Lasso, "the last water": the Yuni Merchants\' Guild\'s well, 4 km from the Rīfar al-Layl',faction:'yuniguild',px:1083,py:1474,people:50,kind:'oasis',well:[200000,10],fodder:600},
 {id:'scatchlasso01.geo',name:'Lasso: the Geomancers\' well and pens',faction:'geomancer',px:1083.5,py:1474.5,people:50,kind:'oasis',well:[200000,10],fodder:600},
 {id:'svhmyhf33w',name:'Ṣalṭ al-Bān, the Catch salt works (the Train of Jabal\'s pans)',faction:'train',px:1080,py:1428,people:120,kind:'works',well:[4000,15],
  pans:{salt:600000,soda:200000,potash:60000,saltpeter:30000,gypsum:100000}},
 /* the Twins (biomes/twins/PLAN.md section 3): the Brotherhood's waystations, hot springs and heated stone corrals */
 {id:'twins.sinter',name:'Sinter-Gate (Bāb al-Bukhār): Route B\'s south gate, the Brotherhood\'s south-west toll house',faction:'horns',px:996,py:1504,people:20,kind:'oasis',well:[20000,10],fodder:150},
 {id:'twins.kettle',name:'Mud-Kettle Hollow (a maar crater of mud pots)',faction:'horns',px:1005,py:1489,people:10,kind:'oasis',well:[8000,10]},
 {id:'twins.brazier',name:'The Brazier (Al-Miǧmarah): the mid-pass crossroads and the Shrine of the Split Horn',faction:'horns',px:1016,py:1479,people:30,kind:'oasis',well:[20000,10],fodder:120},
 {id:'twins.tarn',name:'Brimstone-Tarn (a sulfur tarn)',faction:'horns',px:1031,py:1473,people:10,kind:'oasis',well:[8000,10],make:{sulfur:20000},salvageYears:200},
 {id:'twins.lookout',name:'Catch-Lookout Spring (where caravans wash the alkali from their eyes)',faction:'horns',px:1056,py:1462,people:20,kind:'oasis',well:[20000,10],fodder:100},
 {id:'twins.hall',name:'The Hall of the Tally-Marks (Route A\'s overnight cistern in tube A3)',faction:'horns',px:1014,py:1464,people:15,kind:'oasis',well:[12000,30]},
 {id:'sttkxo9ndy',name:'The White Gills Hermitage (the Order\'s; it doubles as a caravan stop)',faction:'order',px:1035,py:1535,people:15,kind:'monks',well:[6000,20],fodder:40}];
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
return T;})();
if(typeof module!=='undefined')module.exports=CATCH_TUNE;
