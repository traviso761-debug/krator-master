// ================================================================= HOST — the site: STATION 4, FIREBLISS MONS (PLAN.md sections 7, 7a; 2026-11-10)
// THE SITE (scale model 5.1 after edit 3, read at build time by model_site.py): the page's middle at px 205,1282, the plan's point on Firebliss Mons'
// crater floor (the vent record at 206,1284: its floor 5,480 m, its rim 6,380, radius 8.8 px). The floor flat over the south and east (5,481-5,500 m),
// the inner wall rising north-west to ~5,930 m at the corner, lower toward the south-west where the rim's notch is (PLAN.md section 1: the 180 m notch
// on each rim's south-west side). EF/HT; mean -12.6 degC (warm month -2.3, cold -22.4), 600 mm; 0.81 atm on the floor.
// THE MAP (x east, z south, north is -z; origin at the page's middle, R 2600):
//   THE ICE         the crater's floor (south and east) under ice and snow, bare and wet round the fumaroles (KTHERM's heat: the ice and the snow read it)
//   THE FUMAROLES   the crater's fumarole fields (the geyser kit's layout: acid ground, sulphur, steam; its sinter and its show only, none of its
//                   trees: they are a valley's), the warm ground round them where Krator's cold lineage lives: Copper Glacier's frost coral, cushions
//                   and lichen, read in place, only where the ground is warm
//   THE WALL        the inner wall north-west, steep basaltic andesite (KGROUND's side planes); its drops are fall hazards
//   THE PLUME       Mons' own column over the page's east (the vent record 2 km east and 4 km south), drifting south-east (89b: the plume's sprites; ash on the snow)
//   NOT HERE        the fumarolic ice caves (owed: KGLACIER's cave shells want a glacier's frame; KNOWN_ISSUES.md)
const SITE={key:'mons',name:'Firebliss Mons',region:'Firebliss Mons\' crater (the Firebliss Range, ideal type)',
 tarn:null,river:null,
 thermal:{seed:4404,amb:-10,runLen:120,
  geysers:[],
  springs:[{key:'meltpool',name:'A meltwater pool on warm ground (the vents keep it open)',kind:'pool',x:450,z:1220,r:8,temp:.45,out:1}],
  acid:[{key:'crater',name:'The crater\'s fumarole field (sulphur and steam through the ice)',x:300,z:1000,r:200,mud:2,fumaroles:30},
   {key:'eastvents',name:'The east vents (sulphur crusts)',x:1300,z:1600,r:120,mud:0,fumaroles:18}],
  fumaroles:[{x:-200,z:600,r:150,n:10},{x:900,z:400,r:120,n:6}],
  flats:[],dead:[],terraces:[]},
 thermalOnly:true,   /* the geyser kit's sinter and show only (89z): no thermal trees or floor on a crater at 5,500 m */
 vents:[{x:300,z:1000,T:45,reach:520,decay:1.6},{x:1300,z:1600,T:40,reach:360,decay:1.6},{x:-200,z:600,T:35,reach:300,decay:1.8}],   /* the warm ground under the fields (KTHERM, 47) */
 iceAt:(x,z,h,T)=>smooth(5580,5520,h)*(1-smooth(SOIL+6,SOIL+18,T)),
 coldAt:(x,z,h,T)=>1-smooth(SOIL+4,SOIL+24,T),
 hollows:[{x:1800,z:2000,r:90,d:4,name:'A hollow on the crater floor (the gas lies here in still air)'}],
 camp:null,trail:null,butchery:[],
 floor:[0,0],
 snowLine:[4700,5100],coral:[5300,5700],coralK:1.6,coldQ:1,tri:true,fallName:'The crater\'s inner wall (a sheer drop)',
 need:['firebliss.sulphur','firebliss.pumice','firebliss.obsidian','cold.boulders','cold.coral','cold.lichen'],
 afar:[1,1],
 budget:{tris:16000000,calls:220},
 sky:{air:{humidity:.4},clouds:{cover:.3,cumulus:.35,cirrus:.4}},
 views:'mons'};
