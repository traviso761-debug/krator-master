// ================================================================= HOST — the site: STATION 3, EAST BLISS VALE (PLAN.md sections 7, 7a; 2026-11-10)
// THE SITE (scale model 5.1 after edit 3, read at build time by model_site.py): the page's middle at px 285,1320.6, on the Weyt Warra's outlet (the
// model's r_fb_east leaves the lake at 285,1320): the plan's station is "the way in", up the Weyt Warra's gorge, so the page stands at the gorge's
// head, 12 km from the plan's warmest-shore point (282,1315). The lake's level 1,960 m (the model's wl), its water over the north-west; the outlet's
// carved channel (edit 3: 130-250 m deep at the median, 2 km wide on the model's cells) south down the middle; the east rising 14 m. Cfa; mean 13.9
// degC (warm month 22.7, cold 5.6), 1,370 mm: the lowest and warmest of the four valleys.
// THE MAP (x east, z south, north is -z; origin at the page's middle, R 2600):
//   THE LAKE        East Bliss Vale's warm lake (WH), its warm springs on the east shore (the geyser kit's layout: the Weyt Eye, pools, a spouter,
//                   sinter steps down to the water)
//   THE BENCH       a tuff bench south of the lake, ~26 m over the floor, which the Warra cuts: THE GORGE, its walls to ~40 m by the page's south
//                   edge, a ledge either side, the lahar's boulder trains on its floor, its flood a front on the river (86). The model's channel is
//                   2 km wide on its cells: the bench and the gorge in it are the kit's (sub-cell)
//   THE CAMP        a Kimr band's camp on the bench east of the gorge (core/camp), their trail up the gorge's rim from the Labyrinth, an aurochs-
//                   horn marker at each end, a butchery site on the west shore
//   NOT HERE        the Labyrinth's strays at the water (the fauna kit's: KNOWN_ISSUES.md)
const SITE={key:'east',name:'East Bliss Vale',region:'East Bliss Vale and the Weyt Warra\'s gorge (the Firebliss Range, ideal type)',
 tarn:{level:1960.0,name:'East Bliss Vale\'s lake (warm: the lowest of the four)',seed:[-1800,-1800],warm:.55},
 river:{name:'The Weyt Warra (out of the lake and down its gorge toward the Labyrinth)',from:'tarn',pts:[[-150,-200],[-60,500],[0,1200],[40,1900],[60,2920]],
  hw:11,depth:1.5,fall:.0016,wander:40,gorge:{reach:95,ledge:8,slope:2.6}},
 // the tuff bench south of the lake, cut by the gorge (45: the river's cut takes it down; its own height eased in from the shore)
 bench:(x,z,sm)=>26*sm(300,1000,z)*(1-sm(1900,2700,Math.abs(x))),
 // the lahar's boulder trains: the gorge's floor and ledges (the kit's lahar pass reads the moraine field and the canyon)
 moraine:(x,z,h)=>{const r=RBK.at(x,z);return r.d>-2&&r.d<RIVER.gorge.ledge+6?.8*smooth(400,1000,z):0;},
 thermal:{seed:4403,amb:16,runLen:220,
  geysers:[{key:'weytspout',name:'A spouter',kind:'spouter',x:1650,z:-1450,H:3.2,pool:2.2,mound:{r:10,h:.5}}],
  springs:[
   {key:'weyteye',name:'The Weyt Eye (a prismatic spring)',kind:'prismatic',x:1430,z:-1330,r:22,temp:.9,out:3,shield:1.3},
   {key:'weytpool',name:'A blue pool',kind:'pool',x:1700,z:-1150,r:5,temp:.65,out:1},
   {key:'weytthroat',name:'A boiling funnel',kind:'funnel',x:1350,z:-1100,r:3.6,temp:1.0,out:1}],
  acid:[],
  fumaroles:[{x:1550,z:-1250,r:90,n:4}],
  flats:[{key:'weytflat',name:'The Weyt shield (the east shore\'s sinter)',x:1500,z:-1250,rx:230,rz:150,a:.9}],
  dead:[{key:'weytdead',name:'Dead pines at the shield\'s edge',x:1850,z:-950,r:70}],
  terraces:[{key:'weytsteps',name:'The Weyt steps (down to the lake)',S2:1.4,cu:22,cv:13,drop:.3,lip:.14,depth:.3,temp:[60,30]}]},
 steps:{a:[1380,-1380],b:[980,-1520],w:110},
 hollows:[{x:1900,z:300,r:60,d:3.5,name:'A hollow on the bench (dead birds in it)'},{x:-1700,z:2000,r:55,d:3,name:'A hollow under the west slope'}],
 camp:{culture:'kimr-hunt',id:'kimr:east',x:1150,z:1150,pad:34,way:[-.3,1],name:'A Kimr band\'s camp'},
 trail:{name:'The Kimr trail (cairns up the gorge\'s rim from the Labyrinth)',pts:[[900,2920],[950,2200],[1050,1600],[1140,1230]],people:'kimr'},
 butchery:[{x:-1400,z:1300,name:'A butchery site on the west shore (a stray dressed at the water)'}],
 flood:{name:'The Weyt Warra\'s lahar (meltwater and ash from the range, down the gorge)',speed:4.5,period:5400,rise:60,hold:240,fall:900,depth:7},
 floor:[60,250],
 snowLine:[4900,5300],coral:[0,0],fallName:'The gorge\'s wall (a sheer drop to the Warra)',
 need:['firebliss.grass','firebliss.ferns','firebliss.reeds','firebliss.treeferns','firebliss.pines','firebliss.birds','firebliss.lahar',
  'hunt.shelters','hunt.racks','hunt.hearths','hunt.cairns','hunt.markers','hunt.bones'],
 afar:[-1,1],
 sky:{air:{humidity:.66},clouds:{cover:.4,cumulus:.5,cirrus:.25}},
 views:'east'};
