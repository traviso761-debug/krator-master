// ================================================================= HOST — the site: STATION 1, THE GREAT FIREBLISS VALE (PLAN.md sections 7, 7a; 2026-11-10)
// Each station's land as numbers, read by the one stage (45-host-stage.js); a station replaces this fragment (stations/<name>/44z-host-site.js).
// THE SITE (scale model 5.1, read at build time by model_site.py): the page's middle at px 188,1319.2, on the tarn's south-east shore. The tarn's level
// 2,279.8 m (the model's wl); its water over the page's north-west half, the shore a diagonal from (-2400, 350) to (2400, -1650). The floor rises south-
// east at 2-3% for a kilometre, then 10-15% to 2,540 m at the corner: the ash slopes under the walls (3.5 km, off the page). Cfb; mean 10.4 degC (warm
// month 19, cold 1.7), 1,170 mm (the model's tm, tw, tc and p off the land cells round it).
// THE MAP (x east, z south, north is -z; origin at the page's middle, R 2600):
//   THE TARN       the Great Firebliss Vale's warm tarn (WH): over the north-west half, still, warm-tinted off the springs
//   THE SHIELD     the vale's sinter shield on the shore (the geyser kit's layout: a cone geyser, a fountain in its pool, a spouter, the Bliss Eye
//                  prismatic spring, funnels and pools, the sinter steps down to the water, a small acid patch, dead pines at its edge)
//   THE FLOOR      the warm meadow, ferns and reeds round the water; the hollows where the gas lies on still nights (the dead birds in them)
//   THE GROVES     Firebliss pines (the Throne's ash pine, a cousin) and tree ferns in the lee under the slope
//   THE SLOPES     the ash slopes to the south-east: ash, cushions, lichen, pumice and obsidian
//   THE CAMP       a Fellgang hunting camp on the rise (core/camp), its cairned trail east toward the fells, a butchery site above it
const SITE={key:'vale',name:'The Great Firebliss Vale',region:'The Great Firebliss Vale (the Firebliss Range, ideal type)',
 tarn:{level:2279.8,name:'The Great Firebliss Vale\'s tarn (warm: the springs feed it)',seed:[-1600,-1500],warm:.55},
 river:null,
 // the geyser kit's layout (biomes/geyser BIOME-API.md; 47 adds ground, sink, wind and the terraces' mask): the shield on the shore
 thermal:{seed:4401,amb:12,runLen:260,
  geysers:[
   {key:'pyrecone',name:'The Ember Cone (a cone geyser)',kind:'cone',x:-80,z:-170,H:28,period:5400,pre:60,dur:180,steam:300,off:800,demo:{period:150,pre:16,dur:24,steam:28,off:20},cone:{r:5.5,h:3.6},mound:{r:24,h:1.6}},
   {key:'bowl',name:'The Bowl (a fountain geyser in its pool)',kind:'fountain',x:-330,z:-250,H:20,period:14400,pre:900,dur:1200,steam:600,off:5000,demo:{period:240,pre:30,dur:40,steam:40,off:120},pool:7,mound:{r:22,h:1.1}},
   {key:'chatter',name:'A spouter',kind:'spouter',x:60,z:-300,H:3.5,pool:2.2,mound:{r:10,h:.5}}],
  springs:[
   {key:'eye',name:'The Bliss Eye (a prismatic spring)',kind:'prismatic',x:-430,z:-40,r:30,temp:.95,out:4,shield:1.6},
   {key:'tealpool',name:'A teal pool',kind:'pool',x:150,z:-90,r:6,temp:.7,out:1},
   {key:'throat',name:'A boiling funnel',kind:'funnel',x:-220,z:-110,r:4,temp:1.0,out:1},
   {key:'ochre',name:'An ochre pool (cool: the mats fill it)',kind:'pool',x:250,z:-330,r:5,temp:.5,out:1},
   {key:'milk',name:'A milky pool',kind:'pool',x:-560,z:-230,r:7,temp:.8,out:2,milky:true}],
  acid:[{key:'acid',name:'The vale\'s acid patch (mud pots and fumaroles)',x:520,z:130,r:70,mud:4,fumaroles:9}],
  fumaroles:[{x:-120,z:-60,r:80,n:4},{x:300,z:-60,r:60,n:3}],
  flats:[{key:'shield',name:'The Bliss shield (the vale\'s sinter flat)',x:-180,z:-200,rx:330,rz:170,a:-.43},
   {key:'eyeflat',name:'The Eye\'s apron',x:-450,z:-50,rx:120,rz:95,a:0}],
  dead:[{key:'dead',name:'Dead pines at the shield\'s edge (drowned in silica)',x:320,z:240,r:95}],
  terraces:[{key:'steps',name:'The sinter steps (down to the tarn)',S2:1.6,cu:24,cv:14,drop:.3,lip:.14,depth:.3,temp:[64,30]}]},
 // the sinter steps: a band from the Eye down to the water (47 makes the mask; a capsule a-b, half-width w)
 steps:{a:[-470,-110],b:[-760,-420],w:120},
 // the hollows on the floor (86: the gas pools in them on still nights)
 hollows:[{x:900,z:520,r:60,d:3.5,name:'The Still Hollow (the gas lies here on still nights)'},{x:1720,z:260,r:80,d:4.5,name:'A hollow on the floor (dead birds in it)'},
  {x:-950,z:920,r:50,d:3,name:'A hollow under the rise'}],
 // the Fellgangs' hunting camp (core/camp: 65), its cairned trail east toward the fells, a butchery site above it
 camp:{culture:'fellgang-hunt',id:'fellgang:vale',x:-180,z:1260,pad:34,way:[1,-.2],name:'A Fellgang hunting camp'},
 trail:{name:'The Fellgang trail (cairns east toward the fells)',pts:[[2700,300],[1900,600],[1100,880],[400,1120],[-60,1230]],people:'fellgang'},
 butchery:[{x:420,z:1720,name:'A butchery site (a kill dressed and the bones left)'}],
 floor:[45,150],   /* the warm floor's top: level + these (the meadow to the first, the groves to the second; above them the ash slopes) */
 snowLine:[3400,3900],coral:[0,0],
 // what 99 checks is here (kit.stat: FIREBLISS.build, the hunters, Copper Glacier's passes, the geyser kit's build)
 need:['firebliss.grass','firebliss.ferns','firebliss.reeds','firebliss.pines','firebliss.treeferns','firebliss.ashgrass','firebliss.birds','firebliss.pumice',
  'hunt.shelters','hunt.racks','hunt.hearths','hunt.cairns','hunt.markers','hunt.bones','cold.cushions','cold.boulders'],
 afar:[1,-1],
 sky:{air:{humidity:.62},clouds:{cover:.38,cumulus:.45,cirrus:.3}},
 views:'vale'};
