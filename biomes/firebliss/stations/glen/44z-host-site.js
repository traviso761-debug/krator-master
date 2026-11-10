// ================================================================= HOST — the site: STATION 2, SOLFATARA GLEN (PLAN.md sections 7, 7a; 2026-11-10)
// THE SITE (scale model 5.1 after edit 3, read at build time by model_site.py): the page's middle at px 234,1320.5, on the lake's west shore where
// the Tlahn Warra comes in (the model's r_fb_central reaches the lake at 234,1321, a kilometre from the plan's point 235,1319). The lake's level
// 2,119.9 m (the model's wl), its water over the east half; the shore from (2400, -2000) round by (-600, 0) to (800, 2400). The glen's floor west
// of it, 5-8 m over the water, rising to 35 m at the south-west corner. Cfb; mean 12.9 degC (warm month 21.8, cold 4.3), 1,240 mm.
// THE MAP (x east, z south, north is -z; origin at the page's middle, R 2600):
//   THE LAKE        the glen's warm lake (WH), sulphur-tinted where the acid fields drain into it
//   THE SOLFATARA   the fumarole field south of the river (the geyser kit's layout: two acid fields of mud pots and fumaroles, acid pools, a boiling
//                   funnel, the Cauldron, white altered clay, sulphur crusts round the throats, dead pines at its edge): the range's richest sulphur
//   THE WARRA       the Tlahn Warra from the west edge into the lake (out of the Great Firebliss Vale, on to the Labyrinth's Lake 3)
//   THE HOLLOWS     the glen's gas traps (it is a works, not a home: PLAN.md section 6)
//   THE TRACK       the sulphur gatherers' cairned track up from the south to the Solfatara
const SITE={key:'glen',name:'Solfatara Glen',region:'Solfatara Glen (the Firebliss Range, ideal type)',
 tarn:{level:2119.9,name:'Solfatara Glen\'s lake (warm; sulphur-tinted where the acid fields drain)',seed:[1800,600],warm:.5,shallow:0x7aa88a,deep:0x2a5e60},
 river:{name:'The Tlahn Warra (from the Great Firebliss Vale into the glen\'s lake)',pts:[[-2900,-1050],[-2300,-980],[-1700,-820],[-1150,-560],[-700,-300]],hw:12,depth:1.3,fall:.003,wander:30},
 thermal:{seed:4402,amb:14,runLen:240,
  geysers:[{key:'mudspout',name:'A spouter (grey with mud)',kind:'spouter',x:-1080,z:640,H:2.6,pool:2.2,mound:{r:9,h:.4}}],
  springs:[
   {key:'acidpool',name:'An acid pool (milky, sulphur-yellow at its rim)',kind:'pool',x:-1450,z:560,r:9,temp:.75,out:1,milky:true},
   {key:'boiler',name:'A boiling funnel',kind:'funnel',x:-960,z:1030,r:4,temp:1.0,out:1},
   {key:'green',name:'A green pool (cooler: the mats fill it)',kind:'pool',x:-1700,z:900,r:6,temp:.6,out:1},
   {key:'cauldron',name:'The Cauldron (a boiling acid spring)',kind:'prismatic',x:-780,z:560,r:14,temp:.92,out:2,shield:.8}],
  acid:[{key:'solfatara',name:'The Solfatara (the glen\'s acid field: mud pots and fumaroles)',x:-1250,z:850,r:180,mud:9,fumaroles:28},
   {key:'brim',name:'The Brimstone flat (sulphur fumaroles)',x:-700,z:1500,r:120,mud:4,fumaroles:20}],
  fumaroles:[{x:-1800,z:300,r:120,n:8},{x:-950,z:240,r:90,n:5}],
  flats:[{key:'glenflat',name:'The Solfatara\'s white clay',x:-1150,z:900,rx:420,rz:320,a:.5}],
  dead:[{key:'deadglen',name:'Dead pines at the Solfatara\'s edge',x:-1900,z:1500,r:120}],
  terraces:[]},
 hollows:[{x:-2000,z:1900,r:70,d:4,name:'The Choke (a hollow where the gas lies on still nights)'},{x:-1700,z:-1700,r:60,d:3.5,name:'A hollow north of the Warra (dead birds in it)'}],
 camp:null,
 trail:{name:'The sulphur gatherers\' track (cairns up to the Solfatara)',pts:[[-1600,2900],[-1500,2200],[-1350,1600],[-1250,1100]],people:'fellgang'},
 butchery:[],
 floor:[40,160],
 snowLine:[4900,5300],coral:[0,0],
 need:['firebliss.grass','firebliss.ferns','firebliss.flowers','firebliss.sulphur','firebliss.birds','firebliss.reeds','hunt.cairns','hunt.markers'],
 afar:[-1,1],
 sky:{air:{humidity:.6},clouds:{cover:.42,cumulus:.45,cirrus:.3}},
 views:'glen'};
