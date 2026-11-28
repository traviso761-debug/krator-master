// ================================================================= MATRONSCOAST — 7 giant gastropod, megachiton & predator records ([G data])
// Pure engine-neutral fauna records and 24-hour schedules for Matron's Coast / The Snail Coast (PLAN.md section 5.2):
//   1. matron_towersnail  (0.70-1.10 m spiral shell, 25 kg herbivorous pulmonate; edible, tameable, yields nacre, sealime & royal-purple)
//   2. skerry_megachiton  (0.85-1.25 m 8-plated magnetite-radula intertidal skerry grazer)
//   3. velvet_keelslug    (0.55-0.90 m emerald-and-gold forest floor decomposer leaving silver mucin highways)
//   4. harpoon_conesnail  (0.35-0.50 m venomous ambush carnivorous land-snail in hollow coquina middens; KHAZ snail:harpoon)
//   5. lantern_treesnail  (0.12-0.22 m porcelain-banded jade/saffron/carmine arboreal algae-grazer above 2.2 m browse line)
//   6. shagshell_snail    (0.40-0.65 m furry-periostracum cold-tolerant Cfb cloud-slope mountain snail)
//   7. anvil_stork        (1.12 m wading crusher-bird dropping medium snails onto granite anvil boulders)
var SNAIL_FAUNA=(function(){
 'use strict';
 function nz(x,d){return x==null?d:x;}

 var SPECIES=[
  {
   key:'matron_towersnail',
   name:'Matrons Tower-Snail (Achatina matrona)',
   clade:'giant-pulmonate-gastropod',
   biosphere:'earth',
   scaleM:0.92,
   shellRangeM:[0.70,1.10],
   massKg:25.0,
   edible:true,
   tameable:true,
   sinistralQueenRate:0.02,
   speedMs:0.08,
   climate:'tropic..subtropic',
   aridity:'humid',
   abyssal:false,
   riparian:'both',
   koppen:['Af','Cfa'],
   diet:'folivore-wrack-grazer',
   stations:['skerry','browsewood','kelpfront'],
   zone:'browse_cathedral',
   yields:['nacre','sealime','royal-purple','snail-meat'],
   schedule:[
    {from:0,to:9,state:'GLIDE_SILVER_HIGHWAY'},
    {from:9,to:16,state:'CLAMP_NACRE_TRUNK'},
    {from:16,to:24,state:'BROWSE_SKIRT_AND_KELP'}
   ]
  },
  {
   key:'skerry_megachiton',
   name:'Skerry Megachiton (Cryptochiton skerryensis)',
   clade:'polyplacophoran-megachiton',
   biosphere:'earth',
   scaleM:1.08,
   shellRangeM:[0.85,1.25],
   plates:8,
   massKg:32.0,
   edible:true,
   tameable:false,
   speedMs:0.03,
   climate:'tropic..temperate',
   aridity:'humid',
   abyssal:false,
   riparian:'yes',
   koppen:['Af','Cfa'],
   diet:'litho-wrack-rasp',
   stations:['skerry','kelpfront'],
   zone:'skerry_intertidal',
   yields:['chiton-plate','magnetite-radula','sealime'],
   schedule:[
    {from:0,to:7,state:'RASP_SPRAY_WRACK'},
    {from:7,to:17,state:'SUCTION_SURF_VISOR'},
    {from:17,to:24,state:'GRAZE_HOLDFASTS'}
   ]
  },
  {
   key:'velvet_keelslug',
   name:'Velvet Keel-Slug (Limax smaragdinus)',
   clade:'terrestrial-keelslug',
   biosphere:'earth',
   scaleM:0.72,
   shellRangeM:[0.55,0.90],
   massKg:9.5,
   edible:false,
   tameable:false,
   speedMs:0.11,
   climate:'tropic..temperate',
   aridity:'humid',
   abyssal:false,
   riparian:'both',
   koppen:['Af','Cfa','Cfb'],
   diet:'detritivore',
   stations:['browsewood','kelpfront','cloudslope'],
   zone:'mucus_highway',
   yields:['saponin-mucilage','ant-repellent'],
   schedule:[
    {from:0,to:10,state:'PAVE_MUCUS_HIGHWAY'},
    {from:10,to:17,state:'SHELTER_NURSE_LOG'},
    {from:17,to:24,state:'DECOMPOSE_WRACK_AND_DUFF'}
   ]
  },
  {
   key:'harpoon_conesnail',
   name:'Midden Harpoon Cone-Snail (Terraconus rox)',
   clade:'toxoglossan-land-snail',
   biosphere:'earth',
   scaleM:0.42,
   shellRangeM:[0.35,0.50],
   massKg:4.8,
   edible:false,
   tameable:false,
   hazard:'snail:harpoon',
   speedMs:0.04,
   climate:'tropic..subtropic',
   aridity:'humid',
   abyssal:false,
   riparian:'no',
   koppen:['Af','Cfa'],
   diet:'malacophage-ambush',
   stations:['skerry','browsewood','kelpfront'],
   zone:'coquina_midden',
   yields:['neuro-analgesic','patterned-conch'],
   schedule:[
    {from:0,to:6,state:'STALK_MIDDEN_HOLLOW'},
    {from:6,to:18,state:'AMBUSH_CREVICE'},
    {from:18,to:24,state:'HARPOON_HUNT'}
   ]
  },
  {
   key:'lantern_treesnail',
   name:'Painted Lantern-Snail (Polymita lucerna)',
   clade:'arboreal-porcelain-snail',
   biosphere:'earth',
   scaleM:0.18,
   shellRangeM:[0.12,0.22],
   massKg:0.35,
   edible:false,
   tameable:true,
   speedMs:0.05,
   climate:'tropic..temperate',
   aridity:'humid',
   abyssal:false,
   riparian:'no',
   koppen:['Af','Cfa','Cfb'],
   diet:'epiphyll-algae-grazer',
   stations:['browsewood','cloudslope'],
   zone:'upper_canopy',
   yields:['porcelain-shell-bead'],
   schedule:[
    {from:0,to:8,state:'GRAZE_EPIPHYLL_FILM'},
    {from:8,to:17,state:'HANG_UNDER_SISTER_CUP'},
    {from:17,to:24,state:'GLIDE_CANOPY_BOUGH'}
   ]
  },
  {
   key:'shagshell_snail',
   name:'Shag-Shell Mountain Snail (Helix villosa montana)',
   clade:'periostracum-cloud-snail',
   biosphere:'earth',
   scaleM:0.54,
   shellRangeM:[0.40,0.65],
   massKg:7.2,
   edible:true,
   tameable:false,
   speedMs:0.06,
   climate:'temperate',
   aridity:'humid',
   abyssal:false,
   riparian:'yes',
   koppen:['Cfb','Dfb'],
   diet:'moss-fern-grazer',
   stations:['cloudslope'],
   zone:'cloud_cataract',
   yields:['furry-shell','sealime'],
   schedule:[
    {from:0,to:7,state:'HUDDLE_TUFA_LEDGE'},
    {from:7,to:19,state:'GRAZE_CLOUD_MOSS'},
    {from:19,to:24,state:'HUDDLE_TUFA_LEDGE'}
   ]
  },
  {
   key:'anvil_stork',
   name:'Skerry Anvil-Stork (Anastomus incus)',
   clade:'malacophagous-wader',
   biosphere:'earth',
   scaleM:1.12,
   massKg:6.4,
   edible:true,
   tameable:false,
   speedMs:0.85,
   climate:'tropic..temperate',
   aridity:'humid',
   abyssal:false,
   riparian:'yes',
   koppen:['Af','Cfa','Cfb'],
   diet:'malacophage',
   stations:['skerry','browsewood','kelpfront','cloudslope'],
   zone:'anvil_boulder',
   yields:['feathers','fowl'],
   schedule:[
    {from:6,to:18,state:'DROP_SHELL_ON_ANVIL'},
    {from:18,to:24,state:'ROOST_SKERRY_CROWN'},
    {from:0,to:6,state:'ROOST_SKERRY_CROWN'}
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

if(typeof window!=='undefined')window.SNAIL_FAUNA=SNAIL_FAUNA;
if(typeof module!=='undefined'&&module.exports)module.exports=SNAIL_FAUNA;
