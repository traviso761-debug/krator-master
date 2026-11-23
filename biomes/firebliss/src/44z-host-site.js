// ================================================================= HOST — the site: STATION 1, THE GREAT FIREBLISS VALE (PLAN.md sections 7, 7a; 2026-11-10)
// Each station's land as numbers, read by the one stage (45-host-stage.js); a station replaces this fragment (stations/<name>/44z-host-site.js).
// THE SITE (scale model 5.1 after edit 3, read at build time by model_site.py): the page's middle at px 183,1315, the plan's north-shore point
// (183,1314) a kilometre toward the lake so its shore crosses the page. The lake's level 2,279.8 m (the model's wl), its water over the south-east;
// the shore a diagonal from (-2000, 800) through (-400, 0) to (2400, -700). The floor rises north-west, 40 m to the corner: the valley walls are off the
// page (4.7 km within 16 km north). Cfb; mean 12 degC (warm month 21, cold 4), 1,050 mm (the model's tm, tw, tc and p off the land cells round it).
// The Tlahn Warra leaves the lake's east side (189,1318), 12 km off the page.
// THE MAP (x east, z south, north is -z; origin at the page's middle, R 2600):
//   THE LAKE       the Great Firebliss Vale's warm lake (WH): over the south-east, still, warm-tinted off the springs
//   THE SHIELD     the vale's sinter shield on the north shore (the geyser kit's layout: a cone geyser, a fountain in its pool, a spouter, the Bliss
//                  Eye prismatic spring, funnels and pools, the sinter steps down to the water, a small acid patch, dead pines at its edge)
//   THE FLOOR      the warm meadow, ferns and reeds round the water; the hollows where the gas lies on still nights (the dead birds in them)
//   THE GROVES     Firebliss pines (the Throne's ash pine, a cousin) and tree ferns on the rise north-west, toward the walls
//   THE CAMP       a Fellgang band's night camp on the rise (core/camp), its cairned trail north-east toward the fells, a butchery site by it
// Positions on the shore are set from a shore point S0 (-400, 0), the shore's way t (.87, -.5) and the way inland n (-.5, -.87)
const SITE={key:'vale',name:'The Great Firebliss Vale',region:'The Great Firebliss Vale (the Firebliss Range, ideal type)',
 tarn:{level:2279.8,name:'The Great Firebliss Vale\'s lake (warm: the springs feed it)',seed:[1500,1600],warm:.55},
 river:null,
 // the geyser kit's layout (biomes/geyser BIOME-API.md; 47 adds ground, sink, wind and the terraces' mask): the shield on the shore
 thermal:{seed:4401,amb:12,runLen:260,
  geysers:[
   {key:'pyrecone',name:'The Ember Cone (a cone geyser)',kind:'cone',x:-396,z:-234,H:28,period:5400,pre:60,dur:180,steam:300,off:800,demo:{period:150,pre:16,dur:24,steam:28,off:20},cone:{r:5.5,h:3.6},mound:{r:24,h:1.6}},
   {key:'bowl',name:'The Bowl (a fountain geyser in its pool)',kind:'fountain',x:-567,z:-170,H:20,period:14400,pre:900,dur:1200,steam:600,off:5000,demo:{period:240,pre:30,dur:40,steam:40,off:120},pool:7,mound:{r:22,h:1.1}},
   {key:'chatter',name:'A spouter',kind:'spouter',x:-243,z:-229,H:3.5,pool:2.2,mound:{r:10,h:.5}}],
  springs:[
   {key:'eye',name:'The Bliss Eye (a prismatic spring)',kind:'prismatic',x:-575,z:-3,r:30,temp:.95,out:4,shield:1.6},
   {key:'tealpool',name:'A teal pool',kind:'pool',x:-264,z:-368,r:6,temp:.7,out:1},
   {key:'throat',name:'A boiling funnel',kind:'funnel',x:-440,z:-150,r:4,temp:1.0,out:1},
   {key:'ochre',name:'An ochre pool (cool: the mats fill it)',kind:'pool',x:-741,z:11,r:5,temp:.5,out:1},
   {key:'milk',name:'A milky pool',kind:'pool',x:-760,z:110,r:7,temp:.8,out:2,milky:true}],
  acid:[{key:'acid',name:'The vale\'s acid patch (mud pots and fumaroles)',x:-113,z:-547,r:70,mud:4,fumaroles:9}],
  fumaroles:[{x:-478,z:-256,r:80,n:4},{x:-152,z:-374,r:60,n:3}],
  flats:[{key:'shield',name:'The Bliss shield (the vale\'s sinter flat)',x:-490,z:-157,rx:330,rz:170,a:-.52},
   {key:'eyeflat',name:'The Eye\'s apron',x:-590,z:0,rx:120,rz:95,a:0}],
  dead:[{key:'dead',name:'Dead pines at the shield\'s edge (drowned in silica)',x:-218,z:-590,r:95}],
  terraces:[{key:'steps',name:'The sinter steps (down to the lake)',S2:1.6,cu:24,cv:14,drop:.3,lip:.14,depth:.3,temp:[64,30]}]},
 // the sinter steps: a band from the Eye down to the water (47 makes the mask; a capsule a-b, half-width w)
 steps:{a:[-560,23],b:[-470,180],w:120},
 // the hollows on the floor (86: the gas pools in them on still nights)
 hollows:[{x:900,z:-900,r:60,d:3.5,name:'The Still Hollow (the gas lies here on still nights)'},{x:1700,z:-1400,r:80,d:4.5,name:'A hollow on the floor (dead birds in it)'},
  {x:-1500,z:-500,r:50,d:3,name:'A hollow under the rise'}],
 // a Fellgang band's camp (core/camp: 65), its cairned trail north-east toward the fells, a butchery site by it
 camp:{culture:'fellgang-hunt',id:'fellgang:vale',x:-1150,z:-1350,pad:34,way:[.6,-.8],name:'A Fellgang band\'s night camp'},
 trail:{name:'The Fellgang trail (cairns north-east toward the fells)',pts:[[2700,-2300],[1800,-1950],[900,-1650],[0,-1450],[-1020,-1360]],people:'fellgang'},
 butchery:[{x:-700,z:-1950,name:'A butchery site (a kill dressed and the bones left)'}],
 floor:[16,32],   /* the warm floor's top: level + these (the meadow to the first, the groves to the second; above them the ash, in the page's north-west corner) */
 pinesUp:1,
 snowLine:[4900,5300],coral:[0,0],
 // what 99 checks is here (kit.stat: FIREBLISS.build, the hunters, the geyser kit's build)
 need:['firebliss.grass','firebliss.ferns','firebliss.reeds','firebliss.pines','firebliss.treeferns','firebliss.birds',
  'hunt.shelters','hunt.racks','hunt.hearths','hunt.cairns','hunt.markers','hunt.bones'],
 afar:[-1,-1],
 sky:{air:{humidity:.62},clouds:{cover:.38,cumulus:.45,cirrus:.3}},
 views:'vale'};
