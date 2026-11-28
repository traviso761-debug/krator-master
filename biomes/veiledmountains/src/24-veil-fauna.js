// ================================================================= VEILED MOUNTAINS — 6 mist-rainforest & alpine fauna records ([G data])
// Pure engine-neutral fauna records and 24-hour schedules for the Veiled Mountains (PLAN.md section 7):
//   1. veil_elk            (Roosevelt-elk scale heavy-antlered cervid grazing Z1-Z2 sword-fern & oxalis glades in herds of 5-12)
//   2. kamuy_bear          (Kim-un-kamuy great dark rainforest ursid fishing salmon runs; sacred to Timpar-Kuran iomante rites)
//   3. crimson_salamander  (arboreal crimson-and-black amphibian spending its entire life cycle in 30 m aerial crimsonchalice tanks)
//   4. mist_slug           (25 cm chartreuse-celadon detritivore spreading veilcomb & giant tree-fern spores along nurse logs)
//   5. oculus_swallow      (spray-veil swift wheeling in flocks through cataract & Kanopi oculus mist curtains)
//   6. veil_salmon         (red-run mountain salmon ascending western U-valley cobble streams; smoked over slide-alder)
var VEIL_FAUNA=(function(){
 'use strict';
 function nz(x,d){return x==null?d:x;}

 var SPECIES=[
  {
   key:'veil_elk',
   name:'Veil-Elk',
   clade:'rainforest-cervid',
   biosphere:'earth',
   scaleM:2.25,
   climate:'temperate',
   aridity:'humid',
   abyssal:false,
   riparian:'both',
   koppen:['Cfb','Dfb'],
   diet:'herbivore',
   stations:['hall','southvale','kanopi'],
   zone:'mistfloor',
   yields:['heavy-hide','antler-wedge','sinew','venison'],
   schedule:[
    {from:0,to:5,state:'BED_MOSS_HOLLOW'},
    {from:5,to:11,state:'GRAZE_FERN_GLADE'},
    {from:11,to:16,state:'CHEW_NURSE_SHADOW'},
    {from:16,to:21,state:'BROWSE_CLUBMOSS'},
    {from:21,to:24,state:'BED_MOSS_HOLLOW'}
   ]
  },
  {
   key:'kamuy_bear',
   name:'Mist-Bear (Kim-un-kamuy)',
   clade:'rainforest-ursid',
   biosphere:'earth',
   scaleM:2.40,
   climate:'cool',
   aridity:'humid',
   abyssal:false,
   riparian:'yes',
   koppen:['Cfb','Dfb','Dfc'],
   diet:'omnivore',
   stations:['hall','gorge','veilpass'],
   zone:'mistfloor',
   yields:['kamuy-pelt','bear-gall','heavy-meat'],
   schedule:[
    {from:0,to:6,state:'DEN_CEDAR_HOLLOW'},
    {from:6,to:13,state:'FISH_SALMON_RIFFLE'},
    {from:13,to:19,state:'FORAGE_ALDER_CHUTE'},
    {from:19,to:24,state:'DEN_CEDAR_HOLLOW'}
   ]
  },
  {
   key:'crimson_salamander',
   name:'Canopy Tank-Salamander',
   clade:'arboreal-urodele',
   biosphere:'earth',
   scaleM:0.18,
   climate:'temperate',
   aridity:'wet',
   abyssal:false,
   riparian:'no',
   koppen:['Cfb','Cfc','Dfb'],
   diet:'insectivore',
   stations:['hall','gorge','kanopi','southvale'],
   zone:'cloudbelt',
   yields:['skin-secretion'],
   schedule:[
    {from:0,to:7,state:'HUNT_CHALICE_RIM'},
    {from:7,to:18,state:'SUBMERGE_CISTERN'},
    {from:18,to:24,state:'HUNT_CHALICE_RIM'}
   ]
  },
  {
   key:'mist_slug',
   name:'Giant Celadon Banana-Slug',
   clade:'terrestrial-gastropod',
   biosphere:'earth',
   scaleM:0.25,
   climate:'temperate',
   aridity:'wet',
   abyssal:false,
   riparian:'both',
   koppen:['Cfb','Cfc','Dfb'],
   diet:'detritivore',
   stations:['hall','gorge','kanopi','southvale'],
   zone:'mistfloor',
   yields:['spore-mucus'],
   schedule:[
    {from:0,to:9,state:'GLIDE_NURSE_LOG'},
    {from:9,to:17,state:'GRAZE_VEILCOMB'},
    {from:17,to:24,state:'GLIDE_NURSE_LOG'}
   ]
  },
  {
   key:'oculus_swallow',
   name:'Spray-Veil Swift',
   clade:'cataract-apodiform',
   biosphere:'earth',
   scaleM:0.22,
   climate:'temperate',
   aridity:'wet',
   abyssal:false,
   riparian:'yes',
   koppen:['Cfb','Cfc'],
   diet:'aerial-insectivore',
   stations:['kanopi','gorge'],
   zone:'gorge',
   yields:['swift-feathers'],
   schedule:[
    {from:0,to:5,state:'ROOST_OCULUS_FLANGE'},
    {from:5,to:20,state:'WHEEL_SPRAY_PLUME'},
    {from:20,to:24,state:'ROOST_OCULUS_FLANGE'}
   ]
  },
  {
   key:'veil_salmon',
   name:'Red-Run Mountain Salmon',
   clade:'anadromous-salmonid',
   biosphere:'earth',
   scaleM:0.78,
   climate:'cool',
   aridity:'wet',
   abyssal:false,
   riparian:'yes',
   koppen:['Cfb','Dfb','Dfc'],
   diet:'planktotroph',
   stations:['hall','gorge','veilpass'],
   zone:'mistfloor',
   yields:['smoked-salmon','roe-oil'],
   schedule:[
    {from:0,to:6,state:'HOLD_POOL_EDDY'},
    {from:6,to:19,state:'LEAP_COBBLE_RUN'},
    {from:19,to:24,state:'HOLD_POOL_EDDY'}
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

if(typeof window!=='undefined')window.VEIL_FAUNA=VEIL_FAUNA;
if(typeof module!=='undefined'&&module.exports)module.exports=VEIL_FAUNA;
