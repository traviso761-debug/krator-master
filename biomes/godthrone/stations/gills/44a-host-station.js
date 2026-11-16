// ================================================================= HOST — the station: THE RED GILL (station 7; biomes/gills/PLAN.md section 11, item 1)
// map 5.1 px 862,1438 (old canvas 590,1108): 5,441 m, 0.81 atm, 157 mm, EF, -7 C (6/-20); the Godthrone's south flank at the bloodfalls' level.
// The south frame (stations/gills/45b-host-model.js) is shared with the bloodfalls (station 6, 11 km south-east). Set in spring, the page opening
// at the out-breath's middle (GILLS.peakHour on its day: the top of the giant's nod), the first ten seconds of the plan's dawn.
const STN={key:'gills',title:'Krator Godthrone: the Red Gill',
 hint:'The Red Gill (Reḍ Gīl, station 7) on the Godthrone\'s south flank at 5.4 km: one great crack 1.6 km long and 300 m deep breathing once a day with the giant\'s nod; its lips lined with tall red pipes in rows, rust collars and dark fringes at their mouths, the steam on the out-breath (Bhlo) tipping downwind over the rust-stained ice; on the in-breath (Suq) the throats draw. The ice belt\'s cliff and the bloodfalls 11 km south-east. N for night',
 centre:[0,0],R:4800,step:8,vent:false,portal:false,summit:false,site:{px:590,py:1108},
 items:['boulder','stone'],counts:B=>B.talus>=10&&B.stones>1000,
 minimap:'The Red Gill',iceH:7000,treeH:5300,pipeStep:16,
 sky:{air:{pressure:1.6,humidity:.35,thin:{y0:0,scale:8000}},clouds:{cover:.2,cumulus:.25,cirrus:.35},fogDensity:.00005},
 viewHour:()=>GILLS.peakHour(GDAY()),
 layers:sd=>[KGROUND.layer('godthrone','iceGlacier',{w:'vGX.y*(1.0-vGX.z)',amt:.9,gain:1,tint:'vec3(1.0)'}),
  KGROUND.layer('godthrone','iceRust',{w:'vGX.z',amt:.95,gain:1.1,tint:'vec3(1.0)'}),
  KGROUND.layer('godthrone','palagonite',{w:'vGX.x',amt:.85,gain:1,tint:'vec3(1.0)'}),
  KGROUND.layer('godthrone','lichenCrust',{w:'vGY.w',amt:.8,gain:1,tint:'vec3(1.0)'})],
 /* the gill's walls at 4 m (the base lattice's 8 m cannot draw a 60 m slot 300 m deep): three boxes along it */
 insets:()=>[-540,0,540].map((z,i)=>({x:0,z,r:280,st:4,name:'gill',label:'The Red Gill\'s walls (ground, 4 m)'})),
 spine:()=>[[0,0],[0,-700],[0,700],[900,900],[1800,2200],[-2000,-1500],[3000,3500],[-3000,2000]]};
/* THE DAY: #day= (days from game start), else the first day whose out-breath falls at dawn (~6.7 h: the plan's first ten seconds, "as the sun
   rises the whole crack begins to steam"); the breath's hour drifts ~3.9 minutes a day (a sidereal day), so it comes round */
function GDAY(){const m=/[?&#]day=([^&#]*)/.exec(location.search+location.hash);if(m)return +decodeURIComponent(m[1])||0;if(GDAY.d!=null)return GDAY.d;
 let b=0,bd=99;for(let d=0;d<400;d++){const e=Math.abs(GILLS.peakHour(d)-6.7);if(e<bd){bd=e;b=d;}}return GDAY.d=b;}
