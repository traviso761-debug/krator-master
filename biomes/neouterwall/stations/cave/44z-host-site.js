// ================================================================= HOST — the cave station's site: the Epidote Cave's Marble Hall
// PLAN.md sections 2a and 7 (station 5b); the scale model's record `tube_epidote_16` (5.1 edit 1): the hypogene cave dissolved in the skarn's
// marble bands along the Outland Gate fault (NNW-SSE), 71 km from the Portal (5,900 m) to the Inner Mouth on the Epidote-Steam Tarn (2,700 m).
// Its middle cavern, `cav_epidote_marble_hall`, at px 1336,326: "the upper level's great chamber under the crest (ground 11.8-12.1 km, about
// 6.2 km of rock overhead): white skarn marble dissolved from below, gypsum crust and cupolas, dry since the old water table fell", 240 x 150 m,
// 55 m high. The page is that hall and the cave round it: the dry UPPER storey (y = 0: its floor, the plan's 5.6-5.9 km band, 5,750 m here)
// and, 80 m under it, the LOWER storey that is still hot and wet (the plan: "the lower is still hot and wet, and feeds the tarn its warm
// water"), its water reached down the feeder wells. Every height below is metres over the upper storey's floor (G).
const SITE={key:'cave',name:'The Marble Hall (the Epidote Cave)',region:'The Epidote Cave, the upper level (the NE outer wall)',px:1336,py:326,G:5750,
 koppen:['O'],atm:.78,rain:0,surfaceT:-40,      /* over it the airless crest; inside, the air is the cave's own (the Portal's, 0.77 atm, ~150 m higher) */
 world:61626,
 /* the crest 6.2 km overhead (KCAVERN's ground: no cupola reaches it, so no vent opens) */
 ground:(x,z)=>6200+40*Math.sin(x/700)+30*Math.cos(z/530),
 /* the network (KKARST hypogene): the lower, active storey 80 m under the hall at its table, the upper storey dry at y 0; the joints on the
    fault's strike (NNW: -1.35 rad from +x), the feeders up the fault's strands */
 net:{box:[-900,-900,900,900],kind:'hypogene',level:-80,table:-79,temp:48,
  levels:[{y:0}],form:'maze',p:.45,joints:{angle:-1.35,sp:60},
  feeders:{cell:300,p:.6,depth:220,faults:[[-250,-900,250,900],[-650,-900,-150,900],[200,-900,700,900]]},
  chamber:{p:.4,r:[18,50],h:[12,30]},cupola:{p:.75,n:[1,4],r:[4,11],h:[3,9]},thin:12,outlet:[0,900],w:[4,9],h:[3,8]},
 /* the Marble Hall itself (the tube record's cavern), carved over the network's upper-storey chamber nearest the page's middle */
 hall:{id:'cav_epidote_marble_hall',name:'The Marble Hall',rx:120,rz:75,h:55,belly:.3,cupolas:[[-60,-20,9,10],[35,25,11,12],[80,-30,7,8],[-15,40,8,9],[0,0,13,14]]},
 half:200,                               /* the page: 400 m round the hall */
 cell:1,chunk:16,
 /* the warmth (KTHERM): the rock cooled by the crest's meltwater draining down the fault (PLAN.md section 2a, proposed), the feeders' rising heat */
 therm:{soil:14,T:50,reach:160,decay:2.2,scald:45},
 /* the dress (KSPELEO): the gypsum on the dry storey's floor (blades and blocks: the replacement gypsum), the hypogene crusts (chandeliers,
    cupolas' blisters) wherever KKARST laid a crust band */
 crystals:{floor:{cell:3,kinds:{block:{p:.08,len:[.3,1.4],r:[.3,1],n:[2,5],mineral:'gypsum'},druse:{p:.35,len:[.12,.6],r:[.8,2.2],n:[10,24],mineral:'gypsum'}}}},
 storeys:[0,1],
 hypogene:{cell:4},
 heat:{danger:1,soak:{full:2400,from:0,out:3600}}};
