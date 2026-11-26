// ================================================================= ARCFLOW — 6 Earth & Carnelian relict fauna records ([G data])
// Pure engine-neutral fauna records and 24-hour schedules for Kulaneva / Arcflow (PLAN.md section 5.2):
//   1. silicagrazer   (0.62 m crimson-plated hexamerous Silica-Grazer rasping Carnelian organ-pipes with magnetite radulae)
//   2. belldrifter    (0.48 m translucent ruby Carnelian Bell-Drifter buoyed in 1.55-1.58 atm seep & fen air)
//   3. koskiotter     (1.05 m sleek Helme-Koski chromite-pool river otter)
//   4. nevacrane      (1.22 m slate-and-amber Musta-Jogi bog-fen wader)
//   5. klintfalcon    (0.46 m Kulaneva-Klint columnar-basalt cliff peregrine)
//   6. ambercaddis    (0.05 m Helme-Koski stream larva cementing chromite & merevaik amber grains into cases)
var ARCFLOW_FAUNA=(function(){
 'use strict';
 function nz(x,d){return x==null?d:x;}

 var SPECIES=[
  {
   key:'silicagrazer',
   name:'Crimson Silica-Grazer',
   clade:'carnelian-hexapod',
   biosphere:'carnelian',
   scaleM:0.62,
   climate:'temperate',
   aridity:'subhumid',
   abyssal:false,
   riparian:'no',
   koppen:['Cfa','Am'],
   diet:'litho-herbivore',
   stations:['koski','seep','neva','auger'],
   zone:'serpentinite_island',
   yields:['carnelian-chitin','magnetite-radula'],
   schedule:[
    {from:0,to:6,state:'CLAMP_SKERRY'},
    {from:6,to:18,state:'RASP_ORGANPIPE'},
    {from:18,to:24,state:'CLAMP_SKERRY'}
   ]
  },
  {
   key:'belldrifter',
   name:'Carnelian Bell-Drifter',
   clade:'carnelian-aerostat',
   biosphere:'carnelian',
   scaleM:0.48,
   climate:'temperate',
   aridity:'humid',
   abyssal:false,
   riparian:'both',
   koppen:['Cfa','Am'],
   diet:'aero-planktotroph',
   stations:['seep','neva','auger'],
   zone:'alkaline_seep',
   yields:['ruby-membrane','float-gas'],
   schedule:[
    {from:0,to:5,state:'TETHER_ROOST'},
    {from:5,to:19,state:'DRIFT_SEEP_PLUME'},
    {from:19,to:24,state:'TETHER_ROOST'}
   ]
  },
  {
   key:'koskiotter',
   name:'Helme-Koski Rapid-Otter',
   clade:'riparian-mustelid',
   biosphere:'earth',
   scaleM:1.05,
   climate:'temperate',
   aridity:'humid',
   abyssal:false,
   riparian:'yes',
   koppen:['Cfa'],
   diet:'piscivore',
   stations:['klint','koski','neva'],
   zone:'koski_rapids',
   yields:['waterproof-pelt','small-meat'],
   schedule:[
    {from:5,to:11,state:'DIVE_KETTLE'},
    {from:11,to:16,state:'GROOM_CUMULATE_SILL'},
    {from:16,to:21,state:'HUNT_EDDY'},
    {from:21,to:24,state:'HOLT_SLEEP'},
    {from:0,to:5,state:'HOLT_SLEEP'}
   ]
  },
  {
   key:'nevacrane',
   name:'Musta-Jogi Crowned Fen-Crane',
   clade:'wetland-gruiform',
   biosphere:'earth',
   scaleM:1.22,
   climate:'temperate',
   aridity:'humid',
   abyssal:false,
   riparian:'yes',
   koppen:['Cfa'],
   diet:'omnivore',
   stations:['neva','klint'],
   zone:'humic_fen',
   yields:['feathers','fowl'],
   schedule:[
    {from:6,to:19,state:'STALK_SHOAL'},
    {from:19,to:24,state:'ROOST_HUMMOCK'},
    {from:0,to:6,state:'ROOST_HUMMOCK'}
   ]
  },
  {
   key:'klintfalcon',
   name:'Kulaneva-Klint Basalt Peregrine',
   clade:'cliff-raptor',
   biosphere:'earth',
   scaleM:0.46,
   climate:'temperate',
   aridity:'humid',
   abyssal:false,
   riparian:'both',
   koppen:['Cfa','Am'],
   diet:'carnivore',
   stations:['klint','seep','auger'],
   zone:'klint_scarp',
   yields:['feathers'],
   schedule:[
    {from:6,to:18,state:'STOOP_GORGE'},
    {from:18,to:24,state:'EYRIE_COLONNADE'},
    {from:0,to:6,state:'EYRIE_COLONNADE'}
   ]
  },
  {
   key:'ambercaddis',
   name:'Merevaik Jewel-Case Caddis',
   clade:'benthic-insect',
   biosphere:'earth',
   scaleM:0.05,
   climate:'temperate',
   aridity:'humid',
   abyssal:false,
   riparian:'yes',
   koppen:['Cfa'],
   diet:'detritivore',
   stations:['koski','klint'],
   zone:'koski_rapids',
   yields:['amber-grit-case','fish-bait'],
   schedule:[
    {from:0,to:24,state:'CEMENT_AMBER_CASE'}
   ]
  }
 ];

 var BY_KEY={};
 for(var i=0;i<SPECIES.length;i++)BY_KEY[SPECIES[i].key]=SPECIES[i];

 function stateAt(key,hour24){
  var sp=BY_KEY[key];
  if(!sp)return 'IDLE';
  var h=((nz(hour24,12)%24)+24)%24;
  for(var i=0;i<sp.schedule.length;i++){
   var s=sp.schedule[i];
   if(h>=s.from&&h<s.to)return s.state;
  }
  return sp.schedule[0].state;
 }

 return{
  SPECIES:SPECIES,
  BY_KEY:BY_KEY,
  stateAt:stateAt
 };
})();

if(typeof window!=='undefined')window.ARCFLOW_FAUNA=ARCFLOW_FAUNA;
if(typeof module!=='undefined'&&module.exports)module.exports=ARCFLOW_FAUNA;
