// ================================================================= HOST — the site: STATION 3, THE HIGH ICEFIELD (PLAN.md section 2; 2026-11-03)
// THE SITE (scale model 5.1, surveyed 2026-11-03): px 213,1225, 6,518 m, HT (hyperalpine tundra), -20 degC mean (warm -9, cold -31), 1,330 mm, 0.71 atm.
// The ground rises south to 7-8 km and falls north to 4.9 km at 16 km: the icefield's north edge breaks off there. No copper node in the page's square
// (CG_RES: iron, tin, silver); the gneiss is copper 50, background. Almost nothing lives here: lichen on the nunataks, a little snow algae.
// THE MAP (x east, z south; origin at the site, R 2600):
//   THE ICEFIELD   the plateau ice, 80-120 m thick, crossing the whole page, wind-scoured (sastrugi in the snow)
//   THE NUNATAKS   three ribs of gneiss through the ice (KRELIEF ranges; the ice thins over them and parts round them)
//   THE EDGE       the north: the bed steepens and the ice breaks off in an ice cliff, its seracs, its crevasse field behind
//   THE CAVES      ice caves at the nunataks' feet, where the wind scours a moat between the rock and the ice
const SITE={key:'icefield',name:'The high icefield',region:'The high icefield (Copper Glacier, ideal type)',px:213,py:1225,old:{px:-59,py:895},
 atm:.71,koppen:['HT','EF'],rain:1330,mean:-20,
 up:[0,1],   /* up the ice is south */
 prof:{at:0,h:6430,grads:[[-2900,.36],[-1300,.06]]},
 glacier:{centre:u=>0,W:u=>3800,T:u=>(84+30*smooth(-1300,1500,u))*smooth(-1360,-1300,u),snout:-1350,edge:.6,trough:null,lateral:null,terminal:null,lake:null},
 walls:null,
 ridges:[{a:[-1250,-150],b:[-450,850],h:230,w:240,seed:31},{a:[700,-600],b:[1500,-150],h:190,w:200,seed:32},{a:[200,1500],b:[1300,2100],h:260,w:260,seed:33}],
 tarn:null,
 icefall:[-1345,-1240],crevasses:[[-1230,-650]],
 caves:[{x:-610,z:300,R:14,face:null,name:'An ice cave (the wind\'s moat at a nunatak\'s foot)'},{x:1180,z:-470,R:11,face:null,name:'An ice cave (the wind\'s moat at a nunatak\'s foot)'}],
 streams:[],
 snowLine:[0,1],coral:[0,0],worms:false,algae:.18,sastrugi:true,caveView:3.2,
 sky:{air:{pressure:.71,humidity:.2},clouds:{cover:.15,cumulus:0,cirrus:.5}},
 views:'icefield'};
