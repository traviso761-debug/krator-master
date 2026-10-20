// prefix: et
// ================================================================= THE RICH (PLAN.md section 4): the merchant's house and the
// official's villa. Pale brick in piers, lancets in bundles glazed behind bronze, steep celadon tile with turned-up tips;
// a gilt face over the door where the common town hangs a mask. The villa carries the census's household service (its
// servants' quarters: ET_TRADES).

/* the merchant's house: three storeys of pale brick between piers, lancet bundles on the upper floors and a tall lancet
   over the bronze door, a gilt face on a corbel over it, string courses, a steep celadon hip roof; the counting room
   below, the hall and the household's niche on the first floor, the bedchamber above */
defBuilding({key:'et_merchant_house',name:"Merchant's house",seed:7007,cut:true,w:12.4,d:11.4,h:18.4,budget:150000,
 tags:{types:['dwelling-single'],wealth:'rich',style:'ministry'},
 note:'three storeys of pale brick between piers, lancet bundles glazed behind bronze, a bronze door under a gilt face, a steep celadon hip roof with turned-up tips',
 build(o){const W=10,D=9,G=.5,F1=4.4,F2=8.2,E=11.9,br=P('brick'),brD=new THREE.Color(P('brick')).multiplyScalar(.86),sd=P('stoneD');
  box('stone',0,0,0,W+.4,G,D+.4,sd);box('paving',0,G-.04,0,W-.5,.05,D-.5,P('paving'));
  for(let k=0;k<3;k++)box('stone',0,0,D/2+.3+k*.32,2.4-k*.2,G-k*.16,.32,sd);              /* the steps */
  const st=y=>[{x:-2.5,w:1.0,h:1.8,y:y,steel:true,shut:false},{x:2.5,w:1.0,h:1.8,y:y,steel:true,shut:false}];
  etWalls(W,D,G,E-G,'brick',br,{front:[{x:0,w:1.5,h:2.9,door:true,mask:false,leaf:P('bronze')},{x:-3.2,w:1.1,h:1.8,y:.9,steel:true,shut:false},{x:3.2,w:1.1,h:1.8,y:.9,steel:true,shut:false}],
   back:st(1.0).concat(st(F1-G+1.0),st(F2-G+1.0)),left:st(F1-G+1.0).concat(st(F2-G+1.0)),right:[{x:-2.5,w:1.0,h:1.8,y:1.0,steel:true,shut:false}].concat(st(F2-G+1.0))},{frame:brD});
  // the front: piers between the bays, the lancet bundles, the tall lancet over the door, the gilt face on its corbel
  for(const x of [-W/2+.27,-1.45,1.45,W/2-.27]){box('brick',x,G,D/2+.12,.55,E-G-.3,.3,brD);box('brick',x,E-.3,D/2+.12,.7,.3,.4,brD);}
  for(const F of [F1,F2]){for(const s of [-1,1])etLancets(s*3.25,F+.55,D/2,{n:3,w:.6,gap:.2,h:2.5,step:.3,light:'glass',headMk:'brick',headCol:brD});
   box('brick',0,F-.14,0,W+.2,.22,D+.2,brD);}
  etLancet(0,F1+.4,D/2,.95,F2-F1+2.2,{light:'glass'});
  box('stone',0,G+2.98,D/2+.22,.75,.14,.44,sd);etHead(0,G+3.12,D/2+.24,.8,{metal:'gold'});
  box('stone',0,E-.32,0,W+.5,.32,D+.5,sd);
  etHip(W,D,E,5.2,{mk:'celadon',ov:.7,flare:.45,under:P('timber'),cap:P('celadon')});
  // the floors and the stair in the back right corner
  for(const F of [F1,F2]){box('timber',-.95,F-.2,0,7.5,.2,D-.6,P('timber'));box('timber',3.75,F-.2,1.6,1.9,.2,5.2,P('timber'));}
  etStair(3.75,G,-1.1,1.4,.195,-.155,20,P('timberL'));etStair(3.75,F1,-1.1,1.4,.19,-.155,20,P('timberL'));
  // the counting room, the hall and the household niche, the bedchamber
  FURNISH('eternian_common_register_desk',-3.3,G,-3.85,0);FURNISH('generic_crate',-1.2,G,-3.6,0);FURNISH('generic_sack',-.1,G,-3.75,0);
  FURNISH('eternian_common_bench',-4.49,G,1.6,PI/2);
  FURNISH('eternian_common_table',-1.5,F1,.2,0);FURNISH('eternian_common_bench',-1.5,F1,1.35,PI);
  FURNISH('eternian_court_ancestor_niche',-2.0,F1,-3.95,0);FURNISH('eternian_court_alabaster_lamp',-4.2,F1,3.6,0);
  FURNISH('eternian_common_stove',1.2,F1,-3.85,0);
  FURNISH('eternian_court_canopy_bed',-2.4,F2,-3.05,0);FURNISH('eternian_common_chest',.4,F2,-3.92,0);
  FURNISH('eternian_court_alabaster_lamp',-4.2,F2,1.8,0);}});

/* the official's villa: a walled compound of pale brick entered by a bronze gate under a gilt face; the hall across the
   back on a stone podium under a steep celadon hip, lancet bundles either side of its door; the register room on the
   left under grey tile; the servants' quarters by the gate; on the right a covered gallery of the family's heads, one
   veiled; a reflecting basin in the garden court and clipped trees in celadon pots */
defBuilding({key:'et_official_villa',name:"Official's villa",seed:7008,cut:true,w:24.6,d:20.6,h:11.6,budget:200000,
 tags:{types:['dwelling-single'],wealth:'rich',style:'ministry'},
 note:'a walled compound: the hall on a podium under celadon, the register room, the servants quarters, a covered gallery of the family heads, a reflecting basin',
 build(o){const br=P('brick'),brD=new THREE.Color(P('brick')).multiplyScalar(.86),sd=P('stoneD'),lime=P('lime'),ls=P('limeShade'),gold=KIT_HAS('gold')?new THREE.Color(1,1,1):P('gold');
  // the wall and the gate
  pushM(TF(0,0,9.8));etWall(24,0,2.8,'brick',br,[{x:0,w:2.2,h:2.5,door:true,mask:false,leaf:P('bronze')}],{t:.4,frame:brD});
   for(const s of [-1,1]){box('brick',s*1.55,0,0,.8,3.8,.7,brD);box('brick',s*1.55,3.8,0,.6,.3,.55,brD);}
   box('brick',0,2.8,0,3.9,.6,.6,brD);box('stone',0,3.4,.05,1.0,.14,.5,sd);etHead(0,3.54,.1,.9,{metal:'gold'});popM();
  box('brick',0,0,-9.8,24,2.8,.4,br);for(const s of [-1,1])box('brick',s*11.8,0,0,.4,2.8,19.2,br);
  for(const [x,z,w,d] of [[-6.6,9.8,10.8,.6],[6.6,9.8,10.8,.6],[0,-9.8,24.4,.6],[-11.8,0,.6,19.2],[11.8,0,.6,19.2]])box('stone',x,2.8,z,w,.14,d,sd);
  // the garden court: the path, the basin, the trees
  box('paving',0,0,7.4,2.2,.06,4.6,P('paving'));box('paving',0,0,-.1,2.2,.06,4.0,P('paving'));
  box('paving',0,0,3.5,8.4,.06,4.4,P('paving'));box('stone',0,0,3.5,7.4,.45,3.6,sd);box('water',0,.05,3.5,7.0,.38,3.2,new THREE.Color(ET_WATER));
  for(const x of [-3.9,3.9])for(const z of [.6,6.6]){cyl('glaze',x,0,z,.45,.6,etKeyCol('glaze'),12);box('timber',x,.6,z,.12,.6,.12,P('timber'));
   cone('plain',x,1.1,z,.75,2.1,new THREE.Color(0x3e5e3a),8);}
  // the hall on its podium
  pushM(TF(0,0,-5.6));const G=.6,HW=14,HD=7,HE=6.0;
   box('stone',0,0,0,HW+.6,G,HD+.6,sd);for(let k=0;k<3;k++)box('stone',0,0,HD/2+.45+k*.3,3.2-k*.3,G-k*.2,.3,sd);
   box('paving',0,G-.04,0,HW-.5,.05,HD-.5,P('paving'));
   const sw=[{x:-4,w:1.0,h:2.0,y:1.2,steel:true,shut:false},{x:4,w:1.0,h:2.0,y:1.2,steel:true,shut:false}];
   etWalls(HW,HD,G,HE-G,'brick',br,{front:[{x:0,w:1.6,h:3.0,door:true,mask:false,leaf:P('bronze')}],back:sw,left:[{x:0,w:1.0,h:2.0,y:1.2,steel:true,shut:false}],right:[{x:0,w:1.0,h:2.0,y:1.2,steel:true,shut:false}]},{frame:brD});
   for(const s of [-1,1])etLancets(s*3.9,G+.8,HD/2,{n:5,w:.6,gap:.2,h:3.6,step:.35,light:'glass',headMk:'brick',headCol:brD});
   box('stone',0,G+3.08,HD/2+.2,.7,.12,.4,sd);etHead(0,G+3.2,HD/2+.22,.75,{metal:'gold'});
   box('stone',0,HE-.3,0,HW+.4,.3,HD+.4,sd);
   etHip(HW,HD,HE,4.4,{mk:'celadon',ov:.7,flare:.45,under:P('timber'),cap:P('celadon')});
  popM();
  // the register room on the left, its front to the court
  pushM(TF(-8,0,2.6,PI/2));
   box('stone',0,0,0,7.2,.4,6.2,sd);
   etWalls(7,6,.4,3.2,'brick',br,{front:[{x:1.6,w:1.1,h:2.4,door:true,maskMetal:'terracotta'},{x:-1.4,w:1.1,h:1.6,y:1.0,steel:true,shut:false}],back:[{x:0,w:1.0,h:1.4,y:1.2,steel:true,shut:false}]},{frame:brD});
   etGable(7,6,3.6,2.4,{mk:'tile',ribs:.3,ov:.45,wallMk:'brick',wallCol:br});
  popM();
  // the servants' quarters by the gate (the census's household service)
  pushM(TF(8.8,0,6.5,-PI/2));
   box('stone',0,0,0,5.2,.3,4.8,sd);
   etWalls(5,4.6,.3,2.6,'lime',lime,{front:[{x:-1.2,w:.95,h:2.1,door:true,maskMetal:'lead'},{x:1.0,w:.9,h:1.1,y:1.0}]});
   etPent(5,4.6,2.95,3.5,{mk:'tile',ribs:.3,ov:.45});etPentFill(5,4.6,2.9,3.5,'lime',lime);
  popM();
  // the family gallery: a covered walk against the right wall, the heads on plinths, one veiled
  pushM(TF(9.9,0,.9,-PI/2));
   box('paving',0,0,0,5.6,.12,3.0,P('paving'));box('brick',0,2.8,-1.65,5.6,1.15,.4,br);
   for(const x of [-2.55,-.85,.85,2.55])box('brick',x,0,1.32,.36,3.3,.36,brD);
   etPent(5.6,3.1,3.3,3.95,{mk:'tile',ribs:.3,ov:.3});
   [['gold',0],['silver',0],['bronze',0],['gunmetal',1],['stone',0]].forEach(([m,v],i)=>etHead(-2.1+i*1.05,.12,-.75,.7,{metal:m,plinth:.95,veiled:!!v}));
  popM();
  // the hall: the household's niche, the lamps, the bench, the bed; the register room's desk; the servants' mats
  FURNISH('eternian_court_ancestor_niche',0,G,-8.55,0);FURNISH('eternian_court_alabaster_lamp',-1.6,G,-8.3,0);FURNISH('eternian_court_alabaster_lamp',1.6,G,-8.3,0);
  FURNISH('eternian_court_gallery_bench',-3.6,G,-8.55,0);FURNISH('eternian_common_table',-3.2,G,-5.2,0);FURNISH('eternian_court_canopy_bed',5.2,G,-7.65,0);
  FURNISH('eternian_common_chest',2.9,G,-8.5,0);
  FURNISH('eternian_common_register_desk',-10.35,.4,2.6,PI/2);FURNISH('eternian_common_chest',-10.42,.4,4.9,PI/2);FURNISH('eternian_common_bench',-8,.4,-.39,0);
  FURNISH('eternian_poor_reed_mat',10.2,.3,5.4,0);FURNISH('eternian_poor_reed_mat',10.2,.3,7.5,0);
  FURNISH('eternian_poor_block_bench',7.01,.3,7.6,PI/2);FURNISH('eternian_poor_hearth',8.0,.3,8.4,PI);}});
