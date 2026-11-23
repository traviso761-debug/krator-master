// ================================================================= SPRINGHOLLOWS — 6 native karst & shut-in fauna records ([G data])
// Pure engine-neutral fauna records and 24-hour activity schedules for Sikwingi-Khaloyi (PLAN.md section 5):
//   1. alabastercraw      (0.32 m stygobitic phreatic cave-hexapod in tube_ozarks_15 sumps)
//   2. springhellbender   (1.25 m sapphire-run giant cryptobranchid amphibian under +18 C resurgence slabs)
//   3. fenestregnat       (0.14 m twilight micro-swarm & spinner lured by 495 nm tufabryum glow)
//   4. porphyrylizard     (0.38 m bipedal-sprinting turquoise-and-crimson agamid on red-porphyry monoliths)
//   5. shutinkingfisher   (0.30 m silver-crested plunge-fisher diving from springcypress limbs)
//   6. chinkapingrouse    (0.65 m woodland karst gobbler-fowl foraging chinkapin oak benches)
var SPRINGHOLLOWS_FAUNA=(function(){
 'use strict';
 function nz(x,d){return x==null?d:x;}

 var SPECIES=[
  {
   key:'alabastercraw',
   name:'Blind Phreatic Cave-Hexapod',
   clade:'stygobitic-hexapod',
   scaleM:0.32,
   climate:'temperate',
   aridity:'humid',
   abyssal:false,
   riparian:'yes',
   koppen:['Cfa'],
   diet:'detritivore',
   stations:['spring','fenestre','glade'],
   zone:'fenestrecavern',
   yields:['cave-chitin','pearl-gastrolith'],
   schedule:[
    {from:0,to:24,state:'FORAGE_SUMP'}
   ]
  },
  {
   key:'springhellbender',
   name:'Sapphire-Run Giant Cryptobranchid',
   clade:'aquatic-amphibian',
   scaleM:1.25,
   climate:'temperate',
   aridity:'humid',
   abyssal:false,
   riparian:'yes',
   koppen:['Cfa'],
   diet:'carnivore',
   stations:['spring','shutin'],
   zone:'springrun',
   yields:['amphibian-meat','mucus-salve'],
   schedule:[
    {from:0,to:7,state:'HUNT_RIFFLE'},
    {from:7,to:18,state:'SHELTER_SLAB'},
    {from:18,to:24,state:'PATROL_BOIL'}
   ]
  },
  {
   key:'fenestregnat',
   name:'Cyan-Lure Cave Gnat & Spinner',
   clade:'twilight-arthropod',
   scaleM:0.14,
   climate:'temperate',
   aridity:'humid',
   abyssal:false,
   riparian:'both',
   koppen:['Cfa'],
   diet:'omnivore',
   stations:['spring','fenestre'],
   zone:'fenestrecavern',
   yields:['glow-mucilage'],
   schedule:[
    {from:5,to:18,state:'ROOST_ARCH'},
    {from:18,to:24,state:'SWARM_GLOW'},
    {from:0,to:5,state:'SWARM_GLOW'}
   ]
  },
  {
   key:'porphyrylizard',
   name:'Red-Shut-In Collared Agamid',
   clade:'saxicolous-reptile',
   scaleM:0.38,
   climate:'temperate',
   aridity:'subhumid',
   abyssal:false,
   riparian:'no',
   koppen:['Cfa'],
   diet:'insectivore',
   stations:['shutin','glade'],
   zone:'porphyryglade',
   yields:['reptile-skin','small-meat'],
   schedule:[
    {from:7,to:11,state:'BASK_DIKE'},
    {from:11,to:17,state:'HUNT_GLADE'},
    {from:17,to:24,state:'CREVICE_SLEEP'},
    {from:0,to:7,state:'CREVICE_SLEEP'}
   ]
  },
  {
   key:'shutinkingfisher',
   name:'Silver-Crested Plunge-Fisher',
   clade:'riparian-bird',
   scaleM:0.30,
   climate:'temperate',
   aridity:'humid',
   abyssal:false,
   riparian:'yes',
   koppen:['Cfa'],
   diet:'piscivore',
   stations:['spring','shutin'],
   zone:'springrun',
   yields:['feathers'],
   schedule:[
    {from:6,to:18,state:'DIVE_SPRING'},
    {from:18,to:24,state:'ROOST_CYPRESS'},
    {from:0,to:6,state:'ROOST_CYPRESS'}
   ]
  },
  {
   key:'chinkapingrouse',
   name:'Karst Gobbler-Fowl',
   clade:'woodland-galliform',
   scaleM:0.65,
   climate:'temperate',
   aridity:'humid',
   abyssal:false,
   riparian:'no',
   koppen:['Cfa'],
   diet:'granivore',
   stations:['shutin','fenestre','glade'],
   zone:'dolomitebench',
   yields:['fowl','feathers','eggs'],
   schedule:[
    {from:6,to:11,state:'FORAGE_ACORN'},
    {from:11,to:15,state:'DUST_GLADE'},
    {from:15,to:19,state:'PECK_BENCH'},
    {from:19,to:24,state:'ROOST_OAK'},
    {from:0,to:6,state:'ROOST_OAK'}
   ]
  }
 ];

 var BY_KEY={};
 for(var i=0;i<SPECIES.length;i++)BY_KEY[SPECIES[i].key]=SPECIES[i];

 function stateAt(key,hour24){
  var sp=BY_KEY[key];
  if(!sp)return null;
  var h=((nz(hour24,12.0)%24)+24)%24;
  for(var i=0;i<sp.schedule.length;i++){
   var s=sp.schedule[i];
   if(h>=s.from&&h<s.to)return s.state;
  }
  return sp.schedule[0].state;
 }

 function forStation(stationId){
  var st=stationId==='labyrinth'?'glade':nz(stationId,'spring');
  var out=[];
  for(var i=0;i<SPECIES.length;i++){
   if(SPECIES[i].stations.indexOf(st)>=0)out.push(SPECIES[i]);
  }
  return out;
 }

 return{
  SPECIES:SPECIES,
  BY_KEY:BY_KEY,
  stateAt:stateAt,
  forStation:forStation
 };
})();

if(typeof window!=='undefined')window.SPRINGHOLLOWS_FAUNA=SPRINGHOLLOWS_FAUNA;
if(typeof module!=='undefined'&&module.exports)module.exports=SPRINGHOLLOWS_FAUNA;
