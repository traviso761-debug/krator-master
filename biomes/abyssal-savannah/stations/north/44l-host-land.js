// ================================================================= HOST — THE LAND (station 3: hyperjungle N's savannah, the blind grass)
// biomes/hyperjungle/PLAN-LANDS.md sections 3, 4 and 9 (J4, 2026-11-08): the XV, Aw and BSh two-thirds of `hyperjungle N` (~1,035 mm,
// 769-1,631; 1.88 atm; +32), east of the Hexahedron (px 555,338) where Screamer wood (the hyperjungle's station `north`) opens out. The
// blind grass is the land: cane-grass 5-8 m to the horizon, lanes through it (the Screamers' raiders', the kit's SAVRIM.laneAt), the
// north's bone giants standing white out of it and its bloodwoods at the jungle's edge and along the gallery (the hyperjungle's north
// land, read in place); red oat grass on the drier rises; the jungle's edge to the west (its roof past the map).
const LAND={key:'north',name:'Hyperjungle N\'s savannah (ideal type)',sky:{px:600,py:332,label:'hyperjungle N\'s savannah east of the Hexahedron'},
 title:'Krator biome — the savannah rims: hyperjungle N\'s blind grass',hint:'Station 3: hyperjungle N\'s abyssal savannah, the blind grass under bone giants, bloodwood at the jungle\'s edge',
 air:{pressure:1.88,humidity:.7},R:3000,
 rise:{dir:[1,.3],m:35},
 river:{pts:[[3300,700],[2300,400],[1300,700],[300,200],[-700,500],[-1700,100],[-3300,350]],w:26,depth:2.2},
 edge:{dir:[-1,0],at:1900,w:800,kind:'jungle'},
 kopjes:[],laterite:.1,dambos:[[1900,-1500,280],[-600,-1800,240],[900,1900,220]],
 grass:{redoat:.55,blind:.8,col:[0xb8a060,0xc8b070,0xa89050,0xb09a58]},palette:{straw:[160,138,84],soil:[128,76,46],green:[90,108,52]},
 trees:{thorn:.3,borassus:.3,gallery:1,kapok:.2,baobab:.25,bone:.9,blood:.8},
 fires:[{ago:.04,x:2400,z:-2000,frac:.04,veer:.15},{ago:1.4,x:-900,z:1700,frac:.08,veer:.2},{ago:2.9,x:1500,z:1300,frac:.07,veer:.3}],
 wind:[-1,.2],
 need:{blindgrass:40000,bonegiant:8,bloodwood:8},
 views:{'The blind grass':[400,3,-900,800,5,-600],'Over the blind grass':[-1200,90,-1600,800,10,200]},
 checks(add,L){const n=L.n||{};
  add('the blind grass to the horizon, lanes through it',(()=>{let lane=0;for(let i=0;i<2000;i++){const x=(KRAND.unit(KRAND.hash(13,i,1))-.5)*4000,z=(KRAND.unit(KRAND.hash(13,i,2))-.5)*4000;if(SAVRIM.laneAt(8131,x,z))lane++;}
   return{ok:(n.blindgrass==null?0:n.blindgrass)>(n.redoat==null?0:n.redoat)*.03&&lane>0&&lane<200,detail:'blind grass '+(n.blindgrass==null?0:n.blindgrass)+', red oat '+(n.redoat==null?0:n.redoat)+'; lane samples '+lane+' of 2000'};})());
  add('the north\'s own, read in place (the hyperjungle\'s bone giants and bloodwood)',(()=>{const N=HYPERJUNGLE.LANDS&&HYPERJUNGLE.LANDS.north;
   return{ok:!!N&&(n.bonegiant>0)&&(n.bloodwood>0),detail:'bone giants '+(n.bonegiant==null?0:n.bonegiant)+', bloodwoods '+(n.bloodwood==null?0:n.bloodwood)};})());}};
var HYPERJUNGLE_LOOK={deciduous:[3,5]};
