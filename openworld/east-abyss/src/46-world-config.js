// ================================================================= EAST ABYSS — this region's own settings
// [G data] What core/world (87-world-places.js, 90-world-camera.js, 98-world-start.js) reads for openworld/east-abyss.
//   built     settlements that already have dedicated world pages (Mungo, Locus, Verge) or Ancients targets (Slice, The Arcades)
//   goOrder   key East Abyss sites first in "Go to"
//   goViews   aerial overview + low-altitude biome-polish vantages over salt lakes, river deltas, escarpment walls, and Yuni Valley
//   start     dramatic low-altitude vantage over Mungo's salt-lake shore looking across the east-abyss canopy toward the eastern rim
var WORLD_CONFIG=(function(){
const M=WORLD_DATA.meta,SITES=M.sites||[];
const byName=n=>SITES.find(s=>s.name===n)||{x:0,z:0,name:n};
const mungo=byName('Mungo'),tafidda=byName('Tafidda'),locus=byName('Locus'),verge=byName('Verge'),
  sfenops=byName('Sfenops'),liikofi=byName('Liikofi'),slice=byName('Slice'),arcades=byName('The Arcades'),
  upsprings=byName('Upsprings'),braita=byName('Braita Reed');
const views=[
  {label:'Overview: East Abyss basin from 120 km up',pos:[0,120000,90000],look:[0,0,0]},
  {label:'Mungo shore & salt-lake canopy (biome close-up)',view:[mungo.x-900,mungo.z+750,180,.62,-.22]},
  {label:'Tafidda middle salt-lake delta',view:[tafidda.x-1400,tafidda.z+1200,320,.58,-.24]},
  {label:'Locus southern salt-marsh & oil basin',view:[locus.x-1300,locus.z+1100,280,.55,-.24]},
  {label:'Verge escarpment foot & Braita Reed',view:[verge.x-1200,verge.z+1400,380,.5,-.26]},
  {label:'Slice & Quintagon cliff gorge',view:[slice.x-1600,slice.z+900,650,.4,-.28]},
  {label:'Sfenops & northern salt-lake arm',view:[sfenops.x-1500,sfenops.z+1200,340,.58,-.24]},
  {label:'The Arcades northern abyssal wall',view:[arcades.x+1600,arcades.z+1400,720,-.7,-.26]},
  {label:'Liikofi river-delta basin',view:[liikofi.x-1200,liikofi.z+950,260,.6,-.22]},
  {label:'Braita Reed lower salt-lake flats',view:[braita.x-800,braita.z+800,150,.7,-.22]},
  {label:'Upsprings & Yuni Valley head',view:[upsprings.x-1100,upsprings.z+1000,380,.55,-.24]}
];
return{
  built:{
    'Mungo':'settlements/mungo (re-specced on kits/tabisti + offshore reedlake + Geomancer enclave)',
    'Locus':'settlements/locus (Option B re-spec: kits/tabisti canal town + Geomancer refinery & 24 pumpjacks)',
    'Verge':'settlements/verge (two-level cliff city on core/city)',
    'Slice':'kits/ancients/targets/slice (inhabited cliff arcology ruin)',
    'The Arcades':'kits/ancients/targets/arcoindian3 (uninhabited northern cliff arcology ruin)'
  },
  goOrder:['Mungo','Tafidda','Locus','Verge','Sfenops','Liikofi','Slice','The Arcades','Middle Tabisti','Sista Riba','Bissa','Braita Reed','Bir-Sakhr Reed','Downback','Upsprings','Quintagon'],
  goViews:views,
  start:{view:[mungo.x-900,mungo.z+750,180,.62,-.22],look:[mungo.x,mungo.z,20]}
};})();
