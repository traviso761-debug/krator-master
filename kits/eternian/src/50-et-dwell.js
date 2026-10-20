// prefix: et
// ================================================================= THE DWELLINGS (kits/eternian/PLAN.md section 4)
// P0 holds the first: the canal house. The rest of the tiers (the reed house, the block hut, the canal row, the court
// house, the corner turret, the merchant house, the official's villa, the Heirs' pavilion and gallery) follow in P3.

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
  box('paving',0,G0-.06,0,W-.5,.06,D-.5,P('paving'));                                    /* the ground floor */
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
   box('stone',0,0,0,4.6,G0,3.2,P('stoneD'));box('paving',0,G0-.06,0,4.1,.06,2.7,P('paving'));
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
