// ================================================================= SW OUTER WALL — 6 boreal-lake & hypoxic-wall fauna records ([G data])
// Pure engine-neutral fauna records and 24-hour schedules for the South-Western Outer Wall (PLAN.md section 4.2):
//   1. boreal_loon     (Belt A paternoster lakes: haunting-voiced diving waterfowl fishing dark northern lakes)
//   2. tarn_char       (Belt A-C lakes up to +5,680 m Trigemini Tarn: ruby-bellied cold-water salmonid under 8 months of ice)
//   3. fen_beaver      (Belt A outlets: builds larch-and-peat lodges across northern paternoster riffles)
//   4. thinair_ibex    (Belt B-C up to 0.65 atm: barrel-chested high-hematocrit cliff caprid leaping 0.75 g megabreccia ledges)
//   5. cushion_pika    (Belt B-C: hay-stacking lagomorph nesting beside +12 C warmer lungcushion domes)
//   6. ice_midge_swarm (Belt C: wingless antifreeze-blooded tarn-edge hexapod feeding tarn_char)
var SWOW_FAUNA=(function(){
 'use strict';
 function nz(x,d){return x==null?d:x;}

 var SPECIES=[
  {
   key:'boreal_loon',
   name:'Veil-Foot Boreal Tarn Loon',
   clade:'diving-waterfowl',
   biosphere:'earth',
   scaleM:0.78,
   minAtm:0.92,
   climate:'cold',
   aridity:'humid',
   abyssal:false,
   riparian:'yes',
   koppen:['Dfc','Dfb'],
   diet:'piscivore',
   stations:['boreallakes'],
   zone:'boreal_lake',
   yields:['waterproof-plumage','fowl'],
   schedule:[
    {from:0,to:5,state:'REED_RAFT_SLEEP'},
    {from:5,to:11,state:'DIVE_PATERNOSTER_TARN'},
    {from:11,to:17,state:'DRIFT_PREEN'},
    {from:17,to:21,state:'DUSK_WAIL_CHORUS'},
    {from:21,to:24,state:'REED_RAFT_SLEEP'}
   ]
  },
  {
   key:'tarn_char',
   name:'Ruby-Bellied Trigemini Tarn Char',
   clade:'cryophilic-salmonid',
   biosphere:'earth',
   scaleM:0.54,
   minAtm:0.72,
   climate:'polar',
   aridity:'humid',
   abyssal:false,
   riparian:'yes',
   koppen:['Dfc','ET','HT'],
   diet:'invertivore',
   stations:['boreallakes','morainetarn','trigemini'],
   zone:'glacial_tarn',
   yields:['salted-char','fish-oil'],
   schedule:[
    {from:0,to:7,state:'HOVER_SUB_ICE_SHELF'},
    {from:7,to:18,state:'CRUISE_OPEN_LEAD'},
    {from:18,to:24,state:'FEED_ICE_MIDGE_MARGIN'}
   ]
  },
  {
   key:'fen_beaver',
   name:'Paternoster Larch-and-Peat Beaver',
   clade:'semi-aquatic-rodent',
   biosphere:'earth',
   scaleM:0.92,
   minAtm:0.95,
   climate:'cold',
   aridity:'humid',
   abyssal:false,
   riparian:'yes',
   koppen:['Dfc','Dfb'],
   diet:'herbivore',
   stations:['boreallakes'],
   zone:'sphagnum_fen',
   yields:['dense-underfur','castoreum'],
   schedule:[
    {from:0,to:6,state:'REPAIR_RIFFLE_DAM'},
    {from:6,to:17,state:'LODGE_SLEEP'},
    {from:17,to:24,state:'FELL_DWARF_BIRCH'}
   ]
  },
  {
   key:'thinair_ibex',
   name:'High-Hematocrit Megabreccia Bharal-Ibex',
   clade:'hypoxic-caprid',
   biosphere:'earth',
   scaleM:1.35,
   minAtm:0.64,
   climate:'polar',
   aridity:'semiarid',
   abyssal:false,
   riparian:'no',
   koppen:['ET','HT'],
   diet:'grazer',
   stations:['morainetarn','trigemini','breathvale'],
   zone:'megabreccia_crag',
   yields:['hollow-hair-fleece','curved-horn','game-meat'],
   schedule:[
    {from:0,to:6,state:'ROOST_CIRQUE_LEDGE'},
    {from:6,to:13,state:'LEAP_MEGABRECCIA_SCARP'},
    {from:13,to:18,state:'GRAZE_STONE_RING_SEDGE'},
    {from:18,to:24,state:'ROOST_CIRQUE_LEDGE'}
   ]
  },
  {
   key:'cushion_pika',
   name:'Bellows-Dome Hay-Stacking Pika',
   clade:'alpine-lagomorph',
   biosphere:'earth',
   scaleM:0.21,
   minAtm:0.65,
   climate:'polar',
   aridity:'semiarid',
   abyssal:false,
   riparian:'no',
   koppen:['ET','HT'],
   diet:'herbivore',
   stations:['morainetarn','trigemini','breathvale'],
   zone:'frost_polygons',
   yields:['winter-pelt'],
   schedule:[
    {from:0,to:7,state:'HUDDLE_WARM_LUNGCUSHION'},
    {from:7,to:17,state:'CURING_HAY_PILE'},
    {from:17,to:24,state:'HUDDLE_WARM_LUNGCUSHION'}
   ]
  },
  {
   key:'ice_midge_swarm',
   name:'Glycerol-Blooded Tarn-Edge Ice-Midge',
   clade:'cryo-hexapod',
   biosphere:'earth',
   scaleM:0.02,
   minAtm:0.62,
   climate:'polar',
   aridity:'subhumid',
   abyssal:false,
   riparian:'yes',
   koppen:['ET','HT','EF'],
   diet:'detritivore',
   stations:['trigemini','breathvale'],
   zone:'ice_apron',
   yields:['char-forage'],
   schedule:[
    {from:0,to:10,state:'TORPOR_RIME_CRACK'},
    {from:10,to:16,state:'CRAWL_SUNLIT_ICE_APRON'},
    {from:16,to:24,state:'TORPOR_RIME_CRACK'}
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

 function forStation(stKey){
  var out=[];
  for(var i=0;i<SPECIES.length;i++){
   if(SPECIES[i].stations.indexOf(stKey)>=0)out.push(SPECIES[i]);
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

if(typeof window!=='undefined')window.SWOW_FAUNA=SWOW_FAUNA;
if(typeof module!=='undefined'&&module.exports)module.exports=SWOW_FAUNA;
