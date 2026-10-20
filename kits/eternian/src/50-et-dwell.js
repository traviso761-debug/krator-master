// prefix: et
// ================================================================= THE DWELLINGS (kits/eternian/PLAN.md section 4)
// The canal house (P0) and the poor (P3: the reed house, the block hut, the canal row). The middle tier's other houses are
// in 51-et-dwell-mid.js, the rich in 52-et-dwell-rich.js, the court's pavilion and gallery in 53-et-court.js.

/* the canal house (the owner's arch-30): two storeys of white lime over block on a dark stone plinth, a fluted bay
   thrown out on the right of the front and carried up past the roof, shuttered windows under stepped Deco heads, the
   door on the left with the mask of the household's dead over it and an oculus in the stepped crown above, a flat
   roof behind a parapet; at the back a kitchen under a grey-tiled pent roof, and a yard walled in cast pattern block */
defBuilding({key:'et_canal_house',name:'Canal house',seed:7001,cut:true,w:10,d:12,h:10,budget:90000,
 tags:{types:['dwelling-single'],wealth:'middle',style:'common'},
 note:'two storeys of white lime on a dark plinth, a fluted bay, shutters under stepped heads, a mask over the door, an oculus in the crown, a grey-tiled kitchen and a pattern-block yard behind',
 build(o){const W=9,D=8,G0=.4,G1=3.6,U1=7.0,lime=P('lime'),ls=P('limeShade'),BX0=.6,BX1=3.8,BC=(BX0+BX1)/2,BW=BX1-BX0;
  pushM(TF(0,0,1));   /* the block stands 1 m forward of the def's centre so the kitchen and yard fit behind it */
  box('stone',0,0,0,W+.3,G0,D+.3,P('stoneD'));                                            /* the plinth */
  box('paving',0,G0-.03,0,W-.5,.06,D-.5,P('paving'));                                    /* the ground floor */
  // the ground storey: the door on the left, the bay's opening on the right, windows all round
  etWalls(W,D,G0,G1-G0,'lime',lime,{
   front:[{x:-2.6,w:1.15,h:2.35,door:true,maskMetal:'terracotta'},{x:BC,w:BW-.6,h:2.8,y:.1,gap:true}],
   back:[{x:2.0,w:1.1,h:1.4,y:1.0},{x:-2.0,w:1.0,h:2.2,door:true,mask:false}],
   right:[{x:-1.6,w:1.0,h:1.4,y:1.0},{x:1.6,w:1.0,h:1.4,y:1.0}],
   left:[{x:1.4,w:1.0,h:1.4,y:1.0}]});
  // the upper floor, with the stairwell left open along the left wall
  box('timber',.6,G1,0,W-1.8,.2,D-.6,P('timber'));box('timber',-3.6,G1,-2.6,1.2,.2,2.2,P('timber'));
  etStair(-3.6,G0,2.9,1.0,.2,-.25,16,P('timberL'));
  etWalls(W,D,G1,U1-G1,'lime',lime,{
   front:[{x:-2.6,w:1.1,h:1.7,y:1.1},{x:BC,w:BW-.6,h:2.6,y:.3,gap:true}],
   back:[{x:-2.0,w:1.0,h:1.4,y:1.1},{x:2.2,w:1.0,h:1.4,y:1.1}],
   right:[{x:0,w:1.1,h:1.5,y:1.1}],
   left:[{x:-.2,w:1.0,h:1.4,y:1.1}]});
  // the roof and its parapet; the stepped crown over the door's axis carries the oculus
  box('lime',0,U1,0,W,.2,D,ls);
  etParapet(W,D,U1+.2,.9,{crown:true,crownX:-2.6,crownW:2.8,steps:3,col:lime,cope:ls});
  etOculus(-2.6,U1+1.2+.75,D/2+.02,.42,{col:ls});
  // the fluted bay: thrown out 1 m on the right of the front, carried past the roof under a stepped cap
  const BZ=D/2+1.0;
  pushM(TF(BC,0,BZ-ET_T/2));
   /* the bay's windows are steel-framed, unshuttered: the flutes run up either side of them */
   etWall(BW,G0,U1+.6-G0,'lime',lime,[{x:0,w:1.2,h:1.5,y:1.0,shut:false,steel:true},{x:0,w:1.0,h:2.3,y:4.0,shut:false,steel:true}]);
   for(const sx of [-1,1])etFlutes(sx*(BW/2-.4)-.36,sx*(BW/2-.4)+.36,G0,U1+.6,ET_T/2+.08,4,lime);
  popM();
  box('stone',BC,0,D/2+.5,BW+.3,G0,1.3,P('stoneD'));                                    /* the plinth under the bay */
  for(const sx of [BX0+.15,BX1-.15])box('lime',sx,G0,D/2+.5,ET_T,U1+.6-G0,1.0,lime);     /* the bay's sides */
  box('timber',BC,G1,D/2+.45,BW-.6,.2,.9,P('timber'));                                   /* its upper floor */
  box('lime',BC,U1+.6,D/2+.5,BW+.2,.2,1.25,ls);box('lime',BC,U1+.8,D/2+.55,BW-.6,.25,1.05,lime);box('lime',BC,U1+1.05,D/2+.6,BW-1.4,.3,.85,ls);
  // the kitchen behind, under a grey-tiled pent roof
  pushM(TF(-2.0,0,-D/2-1.5));
   box('stone',0,0,0,4.6,G0,3.2,P('stoneD'));box('paving',0,G0-.03,0,4.1,.06,2.7,P('paving'));
   etWalls(4.4,3,G0,2.6,'lime',lime,{back:[{x:.6,w:.95,h:2.1,door:true,maskMetal:'lead'}],left:[{x:0,w:.9,h:1.0,y:1.1}],front:[{x:0,w:1.0,h:2.2,gap:true}]});
   box('tile',0,G0+2.75,-.1,4.9,.14,3.6,P('tile'),0,-.13);
   for(let i=0;i<7;i++)box('tile',-2.1+i*.7,G0+2.82,-.1,.08,.08,3.5,new THREE.Color(P('tile')).multiplyScalar(.8),0,-.13);
  popM();
  // the yard: paved, walled in cast pattern block
  box('paving',2.45,0,-D/2-1.3,4.0,.06,2.6,P('paving'));
  pushM(TF(2.45,0,-D/2-2.55));etBlockScreen(4.0,2.0,0,0);popM();
  pushM(TF(4.3,0,-D/2-1.3,PI/2));etBlockScreen(2.4,2.0,0,0);popM();
  // the household: a clerk's house (the State keeps the register, so a clerk keeps one at home)
  FURNISH('eternian_common_register_desk',-2.4,G0,-3.3,0);
  FURNISH('eternian_common_table',1.0,G0,.3,0);
  FURNISH('eternian_common_bench',1.0,G0,1.25,PI);
  FURNISH('eternian_common_stove',2.8,G0,-3.3,0);
  FURNISH('eternian_common_mask_shelf',4.05,G0,-.8,-PI/2);
  FURNISH('eternian_common_bed',2.0,G1+.2,-2.6,0);
  FURNISH('eternian_common_chest',2.0,G1+.2,-.9,0);
  FURNISH('eternian_common_bench',-1.0,G1+.2,3.5,PI);
  popM();}});

/* ================================================================= THE POOR (PLAN.md section 4): silt, reed and cast block.
   The poor copy the court at the scale they can afford: where the canal house hangs a fired mask over the door, the reed
   house paints a face; the block hut and the canal row hang lead. Unglazed openings (etWall `dark`) behind plank shutters */

/* the reed house: one room of silt brick under a steep reed roof, on a beaten-earth platform; a face painted over the
   door where a mask would hang, the eyes closed; a water jar by the door */
defBuilding({key:'et_reed_house',name:'Reed house',seed:7002,cut:true,w:7,d:7,h:5.4,budget:40000,
 tags:{types:['dwelling-single'],wealth:'poor',style:'poor'},
 note:'one room of silt brick under a steep reed roof, a painted face over the door, plank shutters, a water jar by the door',
 build(o){const W=4.8,D=4,G=.2,H=2.3,si=P('silt'),fr=new THREE.Color(P('silt')).multiplyScalar(.82);
  box('earth',0,0,0,W+.8,G,D+.8,P('earth'));
  etWalls(W,D,G,H,'silt',si,{front:[{x:-.8,w:.9,h:1.9,door:true,mask:false,leaf:P('timberL')},{x:1.2,w:.7,h:.7,y:.95,dark:true,head:'flat'}],
   back:[{x:.4,w:.55,h:.55,y:1.1,dark:true,head:'flat',shut:false}],right:[{x:0,w:.6,h:.6,y:1.0,dark:true,head:'flat'}]},{frame:fr});
  etGable(W,D,G+H,2.1,{mk:'reed',col:P('reed'),ov:.6,gov:.45,th:.3,wallMk:'silt',wallCol:si});
  /* the painted face: ochre on the lime-washed panel, the lids two dark strokes, the mouth closed */
  const fz=D/2+.012,fy=G+1.9+.5;box('lime',-.8,fy-.32,fz,.58,.62,.02,P('lime'));box('lime',-.8,fy-.27,fz+.012,.44,.52,.02,new THREE.Color(0xc8945a));
  for(const ex of [-.09,.09])box('lime',-.8+ex,fy+.02,fz+.026,.13,.025,.01,new THREE.Color(0x3a2a20));
  box('lime',-.8,fy-.16,fz+.026,.12,.02,.01,new THREE.Color(0x6a3a28));
  FURNISH('eternian_poor_reed_mat',1.15,G,-1.15,PI/2);
  FURNISH('eternian_poor_hearth',-1.55,G,-1.4,0);
  FURNISH('eternian_poor_mask_board',-2.0,G,.4,PI/2);
  FURNISH('eternian_poor_block_bench',1.1,G,1.45,PI);
  FURNISH('generic_storage_jar',.3,0,D/2+.75,0);}});

/* the block hut: a single room of cast pattern block, flat-roofed behind a low parapet, a lead mask over the door, a
   pierced-block window; a reed lean-to on its right over the hearth */
defBuilding({key:'et_block_hut',name:'Block hut',seed:7003,cut:true,w:7.2,d:5.4,h:4,budget:50000,
 tags:{types:['dwelling-single'],wealth:'poor',style:'poor'},
 note:'one room of cast pattern block under a flat roof, a lead mask over the door, a pierced-block window; a reed lean-to over the hearth',
 build(o){const W=3.6,D=3.2,G=.2,H=2.5,bl=P('block'),ls=P('limeShade');
  pushM(TF(-1,0,0));
  box('earth',0,0,0,W+.5,G,D+.5,P('earth'));
  etWalls(W,D,G,H,'block',bl,{front:[{x:-.7,w:.9,h:2.0,door:true,maskMetal:'lead'},{x:.95,w:1.2,h:1.2,y:.8,gap:true}],
   left:[{x:0,w:.6,h:.6,y:1.2,dark:true,head:'flat',shut:false}]},{frame:new THREE.Color(bl).multiplyScalar(.9)});
  pushM(TF(.95,0,0));etBlockScreen(1.2,1.2,G+.8,D/2-ET_T/2,{s:.4});popM();                                         /* the window: pierced block */
  box('block',0,G+H,0,W+.3,.18,D+.3,ls);etParapet(W+.3,D+.3,G+H+.18,.3,{col:bl,cope:ls});
  /* the lean-to on the right: two timber posts and a reed pent against the hut's wall */
  for(const z of [-1.3,1.3])box('timber',W/2+2.0,0,z,.14,2.05,.14,P('timberL'));
  pushM(TF(W/2+1.1,0,0,PI/2));etPent(3.2,2.2,2.05,2.6,{mk:'reed',col:P('reed'),th:.2,ov:.3});popM();
  box('earth',W/2+1.1,0,0,2.2,.06,3.0,new THREE.Color(P('earth')).multiplyScalar(.9));
  FURNISH('eternian_poor_hearth',W/2+.32,0,.6,PI/2);
  FURNISH('generic_storage_jar',W/2+1.7,0,-.9,0);
  FURNISH('eternian_poor_reed_mat',-.9,G,-.3,0);
  FURNISH('eternian_poor_block_bench',.75,G,-1.1,0);
  FURNISH('eternian_poor_mask_board',1.4,G,.4,-PI/2);
  FURNISH('generic_sack',-1.35,G,1.1,0);
  popM();}});

/* the canal row: three narrow houses of cast block in a terrace, two flats each, the upper flats reached by a shared stair
   at the end and a timber gallery along the front; plank shutters, lead and terracotta masks, a grey-tiled pent roof */
defBuilding({key:'et_canal_row',name:'Canal row',seed:7004,cut:true,w:13,d:9,h:8,budget:110000,
 tags:{types:['dwelling-multi'],wealth:'poor',style:'poor'},
 note:'three narrow block houses in a terrace, a flat on each floor; a shared stair at the end and a timber gallery to the upper flats; plank shutters, masks over the doors, a grey-tiled pent roof',
 build(o){const U=3.6,W=3*U,D=6,G=.3,G1=3.3,H=3.0,bl=P('block'),lime=P('lime'),ls=P('limeShade'),tl=P('timberL');
  pushM(TF(-.6,0,-.7));
  box('stone',0,0,0,W+.3,G,D+.3,P('stoneD'));
  const fr=[],up=[],bk=[],bk2=[];
  for(let i=0;i<3;i++){const x=-U+i*U;
   fr.push({x:x-.8,w:.9,h:2.1,door:true,maskMetal:i===1?'terracotta':'lead'},{x:x+.75,w:.8,h:1.2,y:.9,dark:true,head:'flat'});
   up.push({x:x-.8,w:.85,h:2.0,door:true,mask:false},{x:x+.75,w:.8,h:1.1,y:.9,dark:true,head:'flat'});
   bk.push({x:x,w:.6,h:.7,y:1.2,dark:true,head:'flat',shut:false});bk2.push({x:x,w:.6,h:.7,y:1.1,dark:true,head:'flat',shut:false});}
  etWalls(W,D,G,G1-G,'block',bl,{front:fr,back:bk,left:[{x:0,w:.6,h:.7,y:1.2,dark:true,head:'flat',shut:false}]},{frame:new THREE.Color(bl).multiplyScalar(.9)});
  box('timber',0,G1-.2,0,W-.6,.2,D-.6,P('timber'));                                          /* the upper floors */
  etWalls(W,D,G1,H,'lime',lime,{front:up,back:bk2},{frame:ls});
  for(const x of [-U/2,U/2]){box('block',x,G,0,.2,G1-G,D-.6,bl);box('lime',x,G1,0,.2,H,D-.6,lime);}   /* the party walls */
  /* the pent roof, high at the back; the back wall and the side gables carried up to it */
  const y0=G1+H+.05,y1=y0+.9;etPent(W,D,y0,y1,{mk:'tile',col:P('tile'),ribs:.32,ov:1.5});
  box('lime',0,y0-.05,-D/2+ET_T/2,W,y1-y0+.05,ET_T,lime);
  for(const s of [-1,1])etPoly('lime',s>0?[[W/2,y0,D/2],[W/2,y0,-D/2],[W/2,y1,-D/2]]:[[-W/2,y0,-D/2],[-W/2,y0,D/2],[-W/2,y1,-D/2]],lime);
  /* the gallery along the front at the upper floor, on posts, with a rail; the shared stair at the right end */
  const gz=D/2+.65;box('timber',.6,G1-.18,gz,W+1.2,.18,1.3,tl);
  for(let k=0;k<5;k++){const x=-W/2+.2+k*(W+1.0)/4;box('timber',x,0,gz+.55,.14,G1-.18,.14,P('timber'));box('timber',x,G1,gz+.55,.08,1.0,.08,P('timber'));}
  box('timber',.6,G1+.95,gz+.55,W+1.2,.08,.1,P('timber'));box('timber',.6,G1+.45,gz+.55,W+1.2,.05,.06,P('timber'));
  etStair(W/2+.75,G,-D/2+.4,1.0,.2,.33,15,tl);box('timber',W/2+.75,G1-.18,2.75,1.0,.18,1.3,tl);   /* the landing onto the gallery */
  box('timber',W/2+1.22,G,0,.08,G1+1.0-G,.08,P('timber'));
  /* the flats: a mat and a hearth below, a mat and the dead above */
  FURNISH('eternian_poor_hearth',-U-.9,G,-D/2+.62,0);FURNISH('eternian_poor_reed_mat',-U+.7,G,-1.1,0);
  FURNISH('eternian_poor_block_bench',.4,G,-D/2+.52,0);FURNISH('eternian_poor_reed_mat',U+.8,G,-1.0,0);
  FURNISH('eternian_poor_mask_board',-U+1.5,G1,-D/2+.42,0);FURNISH('eternian_poor_reed_mat',-U+.3,G1,-1.0,0);
  FURNISH('eternian_poor_hearth',U+.6,G1,-D/2+.62,0);FURNISH('generic_storage_jar',1.1,G1,-.6,0);
  popM();}});
