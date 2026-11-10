// ================================================================= HOST — the site: STATION 3, EAST BLISS VALE (PLAN.md sections 7, 7a; 2026-11-10)
// THE SITE (scale model 5.1, read at build time by model_site.py): the page's middle at px 285,1321.2, south of the tarn. The tarn's level 1,960 m
// (the model's wl), its water over the north-west; its outlet the Weyt Warra (the model's r_fb_east: 284,1320 to 289,1330), south down the low swale
// in the middle of the page. Cfa; mean 13.9 degC (warm month 22.7, cold 5.6), 1,410 mm: the lowest and warmest of the four valleys.
// THE MAP (x east, z south, north is -z; origin at the page's middle, R 2600):
//   THE TARN        East Bliss Vale's warm tarn (WH), its warm springs on the east shore (the geyser kit's layout: the Weyt Eye, pools, a spouter,
//                   sinter steps down to the water)
//   THE BENCH       a tuff bench south of the tarn, ~26 m over the floor (sub-cell: the model's 2 km cells hold none), which the Warra has cut into
//                   THE GORGE: its walls rising to ~40 m by the page's south edge, a ledge either side, the lahar's boulder trains on its floor
//                   (Copper Glacier's boulders on the moraine field this site gives the gorge) and its flood a front on the river (86)
//   THE CAMP        a Kimr hunting camp on the bench east of the gorge (core/camp), their trail up the gorge's rim from the Labyrinth, an
//                   aurochs-horn marker at each end, a butchery site by the shore
//   NOT HERE        the Labyrinth's strays at the water (the fauna kit's: KNOWN_ISSUES.md)
const SITE={key:'east',name:'East Bliss Vale',region:'East Bliss Vale and the Weyt Warra\'s gorge (the Firebliss Range, ideal type)',
 tarn:{level:1960.0,name:'East Bliss Vale\'s tarn (warm: the lowest of the four)',seed:[-1900,-2000],warm:.55},
 river:{name:'The Weyt Warra (out of the tarn and down its gorge toward the Labyrinth)',from:'tarn',pts:[[-760,-760],[-480,0],[-160,700],[100,1400],[300,2100],[480,2920]],
  hw:11,depth:1.5,fall:.0016,wander:40,gorge:{reach:95,ledge:8,slope:2.6}},
 // the tuff bench south of the tarn, cut by the gorge (45: the river's cut takes it down; its own height eased in from the shore)
 bench:(x,z,sm)=>26*sm(-350,500,z)*(1-sm(1900,2700,Math.abs(x-200))),
 // the lahar's boulder trains: the gorge's floor and ledges (Copper Glacier's boulders read the moraine field)
 moraine:(x,z,h)=>{const r=RBK.at(x,z);return r.d>-2&&r.d<RIVER.gorge.ledge+6?.8*smooth(-400,300,z):0;},
 thermal:{seed:4403,amb:16,runLen:220,
  geysers:[{key:'weytspout',name:'A spouter',kind:'spouter',x:1220,z:-1600,H:3.2,pool:2.2,mound:{r:10,h:.5}}],
  springs:[
   {key:'weyteye',name:'The Weyt Eye (a prismatic spring)',kind:'prismatic',x:1040,z:-1680,r:22,temp:.9,out:3,shield:1.3},
   {key:'weytpool',name:'A blue pool',kind:'pool',x:1260,z:-1380,r:5,temp:.65,out:1},
   {key:'weytthroat',name:'A boiling funnel',kind:'funnel',x:880,z:-1400,r:3.6,temp:1.0,out:1}],
  acid:[],
  fumaroles:[{x:1150,z:-1450,r:90,n:4}],
  flats:[{key:'weytflat',name:'The Weyt shield (the east shore\'s sinter)',x:1080,z:-1540,rx:230,rz:150,a:.9}],
  dead:[{key:'weytdead',name:'Dead pines at the shield\'s edge',x:1380,z:-1250,r:70}],
  terraces:[{key:'weytsteps',name:'The Weyt steps (down to the tarn)',S2:1.4,cu:22,cv:13,drop:.3,lip:.14,depth:.3,temp:[60,30]}]},
 steps:{a:[980,-1700],b:[560,-1760],w:110},
 hollows:[{x:1850,z:650,r:60,d:3.5,name:'A hollow on the bench (dead birds in it)'},{x:-1500,z:1500,r:55,d:3,name:'A hollow under the west slope'}],
 camp:{culture:'kimr-hunt',id:'kimr:east',x:1000,z:880,pad:34,way:[-.3,1],name:'A Kimr hunting camp'},
 trail:{name:'The Kimr trail (cairns up the gorge\'s rim from the Labyrinth)',pts:[[880,2920],[930,2100],[980,1400],[1000,960]],people:'kimr'},
 butchery:[{x:-300,z:-500,name:'A butchery site by the outlet (a stray dressed at the water)'}],
 flood:{name:'The Weyt Warra\'s lahar (meltwater and ash from the range, down the gorge)',speed:4.5,period:5400,rise:60,hold:240,fall:900,depth:7},
 floor:[60,250],
 snowLine:[3600,4100],coral:[0,0],fallName:'The gorge\'s wall (a sheer drop to the Warra)',
 need:['firebliss.grass','firebliss.ferns','firebliss.reeds','firebliss.treeferns','firebliss.pines','firebliss.birds',
  'hunt.shelters','hunt.racks','hunt.hearths','hunt.cairns','hunt.markers','hunt.bones','firebliss.lahar'],
 afar:[-1,1],
 sky:{air:{humidity:.66},clouds:{cover:.4,cumulus:.5,cirrus:.25}},
 views:'east'};
