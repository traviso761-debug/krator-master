// ================================================================= RICOCHET PEAKS — 6 island-speciated crater fauna records ([G data])
// Pure engine-neutral fauna records and 24-hour schedules for the Ricochet Peaks sky-archipelago (PLAN.md section 4.2):
//   1. crater_caribou   (1.38 m pale-antlered boreal cervid migrating between crater bowls through 3.8-4.5 km notches)
//   2. suevite_lynx     (0.86 m silver-spotted ambush felid stalking shatter-cone boulder aprons)
//   3. thermal_macaque  (0.64 m thick-furred hot-spring primate/marmot soaking in East Hearth sinter pools through blizzards)
//   4. moat_trout       (0.58 m deep-bodied sapphire-speckled char endemic to annular central-peak crater lakes)
//   5. notch_raven      (0.68 m oversized glossy corvid following bandit parties & mimicking whistle-signals in notches)
//   6. yuni_pack_mule   (1.42 m hardy shaggy pack-stock brought south through Yuni-Gate by pioneering settlers)
var RICOCHET_FAUNA=(function(){
 'use strict';
 function nz(x,d){return x==null?d:x;}

 var SPECIES=[
  {
   key:'crater_caribou',
   name:'Ricochet Ring-Elk (Crater Caribou)',
   clade:'boreal-cervid',
   biosphere:'earth',
   scaleM:1.38,
   climate:'boreal',
   aridity:'subhumid',
   abyssal:false,
   riparian:'both',
   koppen:['Dfc','Dfb','ET'],
   diet:'herbivore',
   stations:['ringlake','notch','glasssheet'],
   zone:'crater_taiga',
   yields:['venison','winter-hide','antler'],
   schedule:[
    {from:0,to:6,state:'BED_THERMAL_APRON'},
    {from:6,to:11,state:'GRAZE_REINDEER_LICHEN'},
    {from:11,to:16,state:'TRANSIT_BREACH_NOTCH'},
    {from:16,to:21,state:'BROWSE_MOAT_WILLOW'},
    {from:21,to:24,state:'BED_THERMAL_APRON'}
   ]
  },
  {
   key:'suevite_lynx',
   name:'Suevite Shatter-Lynx',
   clade:'boreal-felid',
   biosphere:'earth',
   scaleM:0.86,
   climate:'boreal',
   aridity:'subhumid',
   abyssal:false,
   riparian:'no',
   koppen:['Dfc','Dfb'],
   diet:'carnivore',
   stations:['ringlake','notch','glasssheet'],
   zone:'suevite_talus',
   yields:['spotted-pelt'],
   schedule:[
    {from:0,to:7,state:'STALK_TALUS_NOTCH'},
    {from:7,to:17,state:'DEN_SHATTER_TOR'},
    {from:17,to:24,state:'STALK_TALUS_NOTCH'}
   ]
  },
  {
   key:'thermal_macaque',
   name:'East Hearth Sinter-Soaker',
   clade:'thermal-mammal',
   biosphere:'earth',
   scaleM:0.64,
   climate:'boreal',
   aridity:'humid',
   abyssal:false,
   riparian:'yes',
   koppen:['Dfb','Dfc'],
   diet:'omnivore',
   stations:['vents'],
   zone:'hydrothermal_oasis',
   yields:['thick-pelt','small-meat'],
   schedule:[
    {from:0,to:8,state:'SOAK_HOT_SINTER_POOL'},
    {from:8,to:16,state:'FORAGE_VENT_WILLOW'},
    {from:16,to:24,state:'SOAK_HOT_SINTER_POOL'}
   ]
  },
  {
   key:'moat_trout',
   name:'Sapphire Moat-Char',
   clade:'lacustrine-salmonid',
   biosphere:'earth',
   scaleM:0.58,
   climate:'boreal',
   aridity:'humid',
   abyssal:false,
   riparian:'yes',
   koppen:['Dfb','Dfc'],
   diet:'insectivore',
   stations:['ringlake','notch','vents','glasssheet'],
   zone:'annular_moat_lake',
   yields:['char-fillet','fish-oil'],
   schedule:[
    {from:0,to:6,state:'HOLD_DEEP_MOAT'},
    {from:6,to:19,state:'RISE_SNOWMELT_INLET'},
    {from:19,to:24,state:'HOLD_DEEP_MOAT'}
   ]
  },
  {
   key:'notch_raven',
   name:'Skippers Echo-Raven',
   clade:'alpine-corvid',
   biosphere:'earth',
   scaleM:0.68,
   climate:'boreal',
   aridity:'subhumid',
   abyssal:false,
   riparian:'both',
   koppen:['Dfc','Dfb','ET'],
   diet:'omnivore',
   stations:['notch','ringlake','vents','glasssheet','highbowl'],
   zone:'breach_notch',
   yields:['feathers'],
   schedule:[
    {from:0,to:6,state:'ROOST_SUEVITE_CRAG'},
    {from:6,to:19,state:'RIDE_VENTURI_UPDRAFT'},
    {from:19,to:24,state:'ROOST_SUEVITE_CRAG'}
   ]
  },
  {
   key:'yuni_pack_mule',
   name:'Shaggy Yuni-Gate Frontier Pack-Mule',
   clade:'domestic-equid',
   biosphere:'earth',
   scaleM:1.42,
   climate:'boreal',
   aridity:'subhumid',
   abyssal:false,
   riparian:'no',
   koppen:['Dfb','Dfc'],
   diet:'herbivore',
   stations:['ringlake','notch','vents','glasssheet'],
   zone:'pioneer_clearing',
   yields:['pack-haul','leather'],
   schedule:[
    {from:0,to:6,state:'PICKET_SHINGLE_SHED'},
    {from:6,to:18,state:'HAUL_NOTCH_TRAIL'},
    {from:18,to:24,state:'PICKET_SHINGLE_SHED'}
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

if(typeof window!=='undefined')window.RICOCHET_FAUNA=RICOCHET_FAUNA;
if(typeof module!=='undefined'&&module.exports)module.exports=RICOCHET_FAUNA;
