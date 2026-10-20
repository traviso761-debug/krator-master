// prefix: et
// ================================================================= THE MIDDLE TIER (PLAN.md section 4): the court house and the
// corner turret (the canal house is 50-et-dwell.js's). White lime over block, grey tile, terracotta masks over the doors.

/* the court house (the owner's arch-32): a courtyard behind a wall of pierced block, entered by a lime gatehouse with the
   mask of the household's dead over the gate; a hall across the back under grey tile, two wings under pent roofs facing
   the court, a basin in the court, and the household's shrine niche by the hall door with the family's heads */
defBuilding({key:'et_court_house',name:'Court house',seed:7005,cut:true,w:14.4,d:14.4,h:7,budget:130000,
 tags:{types:['dwelling-single'],wealth:'middle',style:'common'},
 note:'a court behind a pierced block wall and a lime gatehouse; a hall under grey tile, two wings under pent roofs, a basin, the household shrine with the family heads',
 build(o){const lime=P('lime'),ls=P('limeShade'),bl=P('block'),G=.3;
  box('paving',0,0,2.2,8,.08,9.2,P('paving'));                                           /* the court */
  // the front: the gatehouse and the pierced block either side, plain block walls back to the wings
  pushM(TF(0,0,6.85));etWall(3.0,0,3.1,'lime',lime,[{x:0,w:1.3,h:2.3,door:true,maskMetal:'terracotta'}]);
   box('lime',0,3.1,0,3.3,.2,.5,ls);box('lime',0,3.3,0,2.2,.3,.4,lime);box('lime',0,3.6,0,1.2,.25,.4,ls);popM();
  for(const s of [-1,1]){pushM(TF(s*4.25,0,6.85));etBlockScreen(5.2,2.4,0,0,{s:.4});box('lime',0,2.4,0,5.3,.12,.34,ls);popM();
   box('block',s*6.85,0,5.2,.3,2.4,3.3,bl);box('lime',s*6.85,2.4,5.2,.4,.12,3.3,ls);}
  // the hall across the back
  pushM(TF(0,0,-4.7));
   box('stone',0,0,0,14.2,G,4.8,P('stoneD'));box('paving',0,G-.02,0,13.4,.05,4.0,P('paving'));
   etWalls(14,4.6,G,3.0,'lime',lime,{front:[{x:0,w:1.2,h:2.3,door:true,maskMetal:'terracotta'},{x:-1.9,w:1.0,h:1.4,y:.9},{x:1.9,w:1.0,h:1.4,y:.9}],
    back:[{x:-3,w:1.0,h:1.3,y:1.0},{x:3,w:1.0,h:1.3,y:1.0}],left:[{x:0,w:.9,h:1.2,y:1.0}],right:[{x:0,w:.9,h:1.2,y:1.0}]});
   etGable(14,4.6,G+3.0,2.2,{mk:'tile',ribs:.3,ov:.45,wallMk:'lime',wallCol:lime});
  popM();
  // the wings, facing the court under pent roofs that run down to it
  for(const s of [-1,1]){pushM(TF(s*5.5,0,.6,-s*PI/2));
   box('stone',0,0,0,6.2,G,3.2,P('stoneD'));
   etWalls(6,3,G,2.6,'lime',lime,{front:[{x:-s*1.3,w:1.0,h:2.2,door:true,maskMetal:'lead'},{x:s*1.2,w:1.0,h:1.2,y:.9}],back:[{x:0,w:.8,h:1.0,y:1.2}]});
   etPent(6,3,G+2.65,G+3.35,{mk:'tile',ribs:.3,ov:.55});etPentFill(6,3,G+2.6,G+3.35,'lime',lime);
   popM();}
  // the basin, and the household shrine by the hall door: a stone niche, three heads on its shelf, the eyes closed
  box('stone',0,0,2.6,1.9,.42,1.9,P('stoneD'));box('water',0,.08,2.6,1.5,.32,1.5,new THREE.Color(ET_WATER));
  pushM(TF(-3.2,0,-2.05));
   box('stone',0,0,0,1.3,.9,.6,P('stoneD'));box('stone',0,.9,-.24,1.3,1.3,.12,P('stoneD'));
   for(const sx of [-1,1])box('stone',sx*.6,.9,0,.1,1.3,.6,P('stoneD'));
   etStepHead(0,2.2,0,1.0,{col:ls});
   [['stone',-.36],['bronze',0],['stone',.36]].forEach(([m,x])=>etHead(x,.9,-.02,.36,{metal:m}));
   box('bronze',0,.9,.2,.12,.04,.12,P('bronze'));box('glow',0,.94,.2,.03,.05,.03,new THREE.Color(0xffb04a));
  popM();
  FURNISH('eternian_common_table',0,G,-4.6,0);FURNISH('eternian_common_bench',0,G,-3.4,PI);
  FURNISH('eternian_common_mask_shelf',-3,G,-6.55,0);FURNISH('eternian_common_stove',3.5,G,-6.35,0);
  FURNISH('eternian_common_chest',5.8,G,-6.4,0);FURNISH('eternian_common_bed',-5.5,G,-1.05,0);
  FURNISH('eternian_common_register_desk',5.5,G,-1.75,0);FURNISH('eternian_common_chest',5.5,G,2.95,PI);}});

/* the corner turret (the owner's machine-39): a canal corner block of three storeys, a shop on the ground floor and two
   flats over it, white lime over block; a round turret on the corner carried past the parapet to a verdigris cap, and a
   lantern on an iron bracket over the corner */
defBuilding({key:'et_corner_turret',name:'Corner turret',seed:7006,cut:true,w:11,d:11,h:16.5,budget:130000,
 tags:{types:['dwelling-multi','shop'],wealth:'middle',style:'common'},
 note:'three storeys on a canal corner: a shop below, two flats above, a round turret on the corner under a verdigris cap, a lantern on an iron bracket',
 build(o){const W=9,G0=.4,F1=3.6,F2=6.8,R0=10.0,lime=P('lime'),ls=P('limeShade'),bl=P('block'),TX=W/2,TR=1.5;
  pushM(TF(-.75,0,-.75));
  box('stone',0,0,0,W+.3,G0,W+.3,P('stoneD'));box('paving',0,G0-.02,0,W-.5,.05,W-.5,P('paving'));
  const win=y=>[{x:-2.8,w:1.0,h:1.5,y:y},{x:-.4,w:1.0,h:1.5,y:y}],side=y=>[{x:.2,w:1.0,h:1.5,y:y},{x:2.4,w:1.0,h:1.5,y:y}];
  etWalls(W,W,G0,F1-G0,'block',bl,{front:[{x:-2.5,w:3.0,h:2.6,y:.1,gap:true},{x:1.4,w:1.1,h:2.3,door:true,maskMetal:'terracotta'}],
   right:side(1.0),back:[{x:2.2,w:1.0,h:2.2,door:true,mask:false},{x:-1.5,w:1.0,h:1.3,y:1.0}],left:[{x:0,w:1.0,h:1.3,y:1.0}]},{frame:new THREE.Color(bl).multiplyScalar(.92)});
  box('timber',-2.5,G0,W/2-.55,2.8,1.0,.4,P('timber'));box('timber',-2.5,G0+1.0,W/2-.5,3.0,.06,.55,P('timberL'));   /* the shop's counter */
  box('lime',-2.5,G0+2.75,W/2+.25,3.6,.12,.7,ls);                                         /* its lintel hood */
  for(const [y0,y1] of [[F1,F2],[F2,R0]])etWalls(W,W,y0,y1-y0,'lime',lime,{front:win(1.0),right:side(1.0),back:[{x:1.6,w:1.0,h:1.4,y:1.0}],left:[{x:-1,w:1.0,h:1.4,y:1.0}]});
  for(const y of [F1,F2]){box('timber',.6,y-.2,0,W-1.8,.2,W-.6,P('timber'));box('timber',-3.6,y-.2,1.4,1.2,.2,W-3.4,P('timber'));
   box('lime',0,y-.1,0,W+.16,.14,W+.16,ls);}                                              /* the floors, the string course */
  etStair(-3.6,G0,-1.5,1.0,.2,-.17,16,P('timberL'));etStair(-3.6,F1,-1.5,1.0,.2,-.17,16,P('timberL'));
  box('lime',0,R0,0,W,.2,W,ls);
  etParapet(W,W,R0+.2,.9,{crown:true,crownX:-1.2,crownW:3,steps:3,col:lime,cope:ls,crownMask:'lead'});
  // the turret on the corner, past the parapet, under a verdigris cap; the lantern on its bracket
  pushM(TF(TX,0,TX,PI/4));
   cyl('lime',0,G0,0,TR,R0+1.6-G0,lime,16);cyl('stone',0,0,0,TR+.15,G0,P('stoneD'),16);
   for(const y of [F1,F2,R0])cyl('lime',0,y-.1,0,TR+.1,.16,ls,16);
   for(const y of [F1+1.0,F2+1.0]){box('lime',0,y-.1,TR-.02,.8,1.5,.12,ls);box('glass',0,y,TR+.03,.5,1.2,.04,P('glass'));}
   cyl('lime',0,R0+1.6,0,TR+.25,.3,ls,16);cone('verdigris',0,R0+1.9,0,TR+.35,3.4,P('verdigris'),8);
   cone('gold',0,R0+5.2,0,.08,.7,KIT_HAS('gold')?new THREE.Color(1,1,1):P('gold'),6);
   beam('iron',[0,3.3,TR],[0,3.3,TR+1.1],.07,P('iron'));beam('iron',[0,2.7,TR],[0,3.3,TR+.7],.05,P('iron'));
   box('verdigris',0,2.82,TR+1.1,.36,.06,.36,P('verdigris'));box('glass',0,2.88,TR+1.1,.26,.38,.26,P('glassLit'));
   cone('verdigris',0,3.26,TR+1.1,.26,.3,P('verdigris'),4);
  popM();
  FURNISH('eternian_common_register_desk',-2.2,G0,-3.85,0);FURNISH('eternian_common_table',1.2,G0,-1.0,0);
  FURNISH('eternian_common_chest',2.9,G0,-3.9,0);FURNISH('eternian_common_bench',3.9,G0,.4,-PI/2);
  FURNISH('eternian_common_bed',2.5,F1,-3.1,0);FURNISH('eternian_common_stove',-1.2,F1,-3.85,0);FURNISH('eternian_common_mask_shelf',4.05,F1,0,-PI/2);
  FURNISH('eternian_common_bed',2.5,F2,-3.1,0);FURNISH('eternian_common_table',.2,F2,.8,0);FURNISH('eternian_common_chest',-1.0,F2,-3.9,0);
  popM();}});
