// ================================================================= HOST — the site: STATION 2, SOLFATARA GLEN (PLAN.md sections 7, 7a; 2026-11-10)
// THE SITE (scale model 5.1, read at build time by model_site.py): the page's middle at px 238,1324.5, on the glen's tarn's south shore. The tarn's
// level 2,119.9 m (the model's wl), its water over the north and north-east; the shore a diagonal from (-1700, -800) to (2400, 900); the glen rising
// south-west, 100 m in 2.5 km. Cfb; mean 12.9 degC (warm month 21.6, cold 4.5), 1,340 mm. The Tlahn Warra comes in from the west (out of the Great
// Firebliss Vale, 50 km up) and into the tarn; it leaves past the page's south-east, on toward the Labyrinth's graben lake.
// THE MAP (x east, z south, north is -z; origin at the page's middle, R 2600):
//   THE TARN        the glen's warm tarn (WH), sulphur-tinted where the acid fields drain into it
//   THE SOLFATARA   the fumarole field on the south shore (the geyser kit's layout: two acid fields of mud pots and fumaroles, acid pools, a boiling
//                   funnel, white altered clay, sulphur crusts round the throats, dead pines at its edge): the range's richest sulphur
//   THE WARRA       the Tlahn Warra from the west edge into the tarn
//   THE HOLLOWS     the glen's gas traps (it is a works, not a home: PLAN.md section 6)
//   THE TRACK       the sulphur gatherers' cairned track up from the south to the Solfatara
const SITE={key:'glen',name:'Solfatara Glen',region:'Solfatara Glen (the Firebliss Range, ideal type)',
 tarn:{level:2119.9,name:'Solfatara Glen\'s tarn (warm; sulphur-tinted where the acid fields drain)',seed:[1200,-1600],warm:.5,shallow:0x7aa88a,deep:0x2a5e60},
 river:{name:'The Tlahn Warra (from the Great Firebliss Vale into the glen\'s tarn)',pts:[[-2900,-150],[-2350,-280],[-1800,-360],[-1300,-430]],hw:9,depth:1.2,fall:.004,wander:30},
 thermal:{seed:4402,amb:14,runLen:240,
  geysers:[{key:'mudspout',name:'A spouter (grey with mud)',kind:'spouter',x:320,z:720,H:2.6,pool:2.2,mound:{r:9,h:.4}}],
  springs:[
   {key:'acidpool',name:'An acid pool (milky, sulphur-yellow at its rim)',kind:'pool',x:-90,z:620,r:9,temp:.75,out:1,milky:true},
   {key:'boiler',name:'A boiling funnel',kind:'funnel',x:430,z:1040,r:4,temp:1.0,out:1},
   {key:'green',name:'A green pool (cooler: the mats fill it)',kind:'pool',x:-340,z:900,r:6,temp:.6,out:1},
   {key:'cauldron',name:'The Cauldron (a boiling acid spring)',kind:'prismatic',x:620,z:640,r:14,temp:.92,out:2,shield:.8}],
  acid:[{key:'solfatara',name:'The Solfatara (the glen\'s acid field: mud pots and fumaroles)',x:180,z:920,r:180,mud:9,fumaroles:28},
   {key:'brim',name:'The Brimstone flat (sulphur fumaroles)',x:880,z:1300,r:120,mud:4,fumaroles:20}],
  fumaroles:[{x:-320,z:1300,r:120,n:8},{x:600,z:480,r:90,n:5}],
  flats:[{key:'glenflat',name:'The Solfatara\'s white clay',x:300,z:950,rx:400,rz:300,a:.3}],
  dead:[{key:'deadglen',name:'Dead pines at the Solfatara\'s edge',x:-520,z:1480,r:120}],
  terraces:[]},
 hollows:[{x:-950,z:1350,r:70,d:4,name:'The Choke (a hollow where the gas lies on still nights)'},{x:1500,z:1750,r:60,d:3.5,name:'A hollow below the Brimstone flat (dead birds in it)'}],
 camp:null,
 trail:{name:'The sulphur gatherers\' track (cairns up to the Solfatara)',pts:[[-300,2900],[-200,2200],[0,1600],[150,1180]],people:'fellgang'},
 butchery:[],
 floor:[50,200],
 snowLine:[3600,4100],coral:[0,0],
 need:['firebliss.grass','firebliss.ferns','firebliss.flowers','firebliss.sulphur','firebliss.birds','firebliss.treeferns','firebliss.pines','hunt.cairns','hunt.markers'],
 afar:[-1,1],
 sky:{air:{humidity:.6},clouds:{cover:.42,cumulus:.45,cirrus:.3}},
 views:'glen'};
