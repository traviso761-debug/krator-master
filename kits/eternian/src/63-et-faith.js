// prefix: et
// ================================================================= THE ANCESTORS (PLAN.md sections 4 and 5, P4): the city's temple
// is a hall of heads; a shrine is one head with a lamp; the dead get their masks at the mask house; the house of the
// Withdrawn has a gallery in and none out; the Order of Historians keeps a chapter house for its archives.

/* the ancestor gallery, the city's temple: a long hall of pale brick behind a pier-bundle front with heads in its niches,
   a civic door; inside, two rows of heads down each wall on stone ledges, in the metals of rank (the upper row the
   higher), every seventh veiled (the kin who went into the Valley); the household niche at the end, benches and lamps
   down the middle (the census's temple priests and servants) */
defBuilding({key:'et_ancestor_gallery',name:'Ancestor gallery',seed:7130,cut:true,w:13,d:30,h:23.4,budget:150000,
 tags:{types:['religious'],wealth:'rich',style:'ministry'},
 note:'the hall of heads: a pier-bundle front, two rows of heads down each wall by rank, the veiled among them, benches and lamps; the city temple',
 build(o){const sd=P('stoneD'),br=P('brick'),brD=new THREE.Color(br).multiplyScalar(.86),G=.8,W=11,D=24,H=9,dk=new THREE.Color(sd).multiplyScalar(.45);
  box('stone',0,0,0,W+1,G,28,sd);
  pushM(TF(0,0,-1.5));
   box('paving',0,G-.02,0,W-.6,.05,D-.6,P('paving'));
   etWalls(W,D,G,H,'brick',br,{back:[{x:0,w:1.0,h:2.2,y:4.5,steel:true,shut:false}]},{frame:brD});
   for(const s of [-1,1]){pushM(TF(s*W/2,0,0,s*PI/2));for(let i=0;i<5;i++)etLancet(-9.6+i*4.8,G+5.2,.01,.9,3.2,{light:'glass'});popM();}
   // the rows of heads, facing the aisle
   let n=0;for(const s of [-1,1])for(const [y,ms] of [[G+1.1,['bronze','gunmetal','stone']],[G+3.6,['gold','silver','bronze']]]){
    const xw=s*(W/2-ET_T/2);box('stone',xw-s*.3,y-.12,0,.6,.12,D-2,sd);
    for(let i=0;i<13;i++){const z=-D/2+1.8+i*1.7,m=ms[(i+(s>0?1:0))%3];n++;
     box('stone',xw-s*.17,y,z,.04,1.5,1.0,dk);etHead(xw-s*.38,y,z,.78,{metal:m,ry:-s*PI/2,veiled:n%7===0});}}
   box('stone',0,G+H,0,W+.5,.35,D+.5,sd);etHip(W,D,G+H+.35,4.6,{mk:'celadon',ov:.6,flare:.4,under:P('timber'),cap:P('celadon')});
  popM();
  // the front: a pier bundle with heads in its niches, the civic door
  pushM(TF(0,G,12));
   const R=etPierBundle({n:5,w:W+1,d:3,h0:H+3,step:1.6,mk:'brick',col:br,niches:true,spire:5});
   R.niches.forEach((q,i)=>etHead(q[0],q[1]+.04,q[2]-.3,R.pw*.6,{metal:['silver','gold','gold','gold','silver'][i]}));
   etCivicDoor(0,1.5,1.8,3.6,{metal:'gold'});
  popM();
  FURNISH('eternian_court_ancestor_niche',0,G,-1.5-D/2+.55,0);
  for(const z of [-9,1])FURNISH('eternian_court_gallery_bench',0,G,z,0);
  for(const z of [-12,-4,4])for(const x of [-2,2])FURNISH('eternian_court_alabaster_lamp',x,G,z,0);}});

/* a street shrine: one head on a ledge in a stepped stone niche, eyes closed, a lamp before it, two clay pots of
   offerings (the census's shrine keepers) */
defBuilding({key:'et_shrine_niche',name:'Street shrine',seed:7131,w:2.4,d:1.6,h:3.4,budget:12000,front:{x:0,z:.8,yaw:0},
 tags:{types:['religious'],wealth:'poor',style:'common'},
 note:'a stepped stone niche, one head with its eyes closed on a ledge, a lamp and offerings',
 build(o){const sd=P('stoneD'),lime=P('lime');
  box('lime',0,0,-.1,2.0,.9,1.1,lime);box('lime',0,.9,-.55,2.0,1.6,.2,lime);for(const s of [-1,1])box('lime',s*.9,.9,-.1,.2,1.6,1.1,lime);
  box('stone',0,.9,-.44,1.6,1.5,.02,new THREE.Color(sd).multiplyScalar(.5));
  for(let k=0;k<3;k++)box('lime',0,2.5+k*.22,-.1,2.2-k*.6,.22,1.2-k*.2,P('limeShade'));
  etHead(0,.9,-.15,.62,{metal:'stone'});
  box('bronze',0,.9,.32,.14,.04,.14,P('bronze'));box('glow',0,.94,.32,.04,.05,.04,new THREE.Color(0xffb04a));
  for(const s of [-1,1])cyl('terracotta',s*.5,.9,.25,.09,.16,etKeyCol('terracotta'),8);}});

/* the house of the Withdrawn, which nobody names: a bundle of blind piers in dark brick, one dark oculus high on its
   front, and a covered gallery running in at its side with no door out (LORE.md 6.19) */
defBuilding({key:'et_withdrawal_house',name:'House of the Withdrawn',seed:7132,w:19,d:12,h:22,budget:60000,
 tags:{types:['religious'],wealth:'rich',style:'court'},
 note:'blind piers of dark brick, one dark oculus high on its front, a covered gallery in at its side and no door out',
 build(o){const sd=P('stoneD'),dk=new THREE.Color(P('brick')).multiplyScalar(.6);
  box('stone',0,0,0,13,.8,11,sd);
  pushM(TF(0,.8,0));etPierBundle({n:7,w:12,d:10,h0:12,step:1.4,mk:'brick',col:dk});popM();
  etOculus(0,13.6,5.28,1.1,{mk:'stone',col:sd,lit:false,cross:false});
  // the gallery in: a closed passage along the side, roofed, one door at its outer end
  pushM(TF(7.3,0,-1,PI/2));
   box('stone',0,0,0,2.8,.3,8.6,sd);for(const s of [-1,1])box('brick',s*1.3,.3,0,.3,3,8.6,dk);
   pushM(TF(0,0,4.3-ET_T/2));etWall(2.9,.3,3,'brick',dk,[{x:0,w:1.1,h:2.3,door:true,mask:false,leaf:P('gunmetal')}],{frame:dk});popM();
   pushM(TF(0,0,0,PI/2));etGable(8.6,2.9,3.3,1.0,{mk:'scale',col:P('gunmetal'),ov:.25,gov:.1,gables:false});popM();
  popM();}});

/* the mask house, where the dead get their masks: a lime workshop with the makers' benches and the mortuary room behind,
   a yard with a bottle kiln of pale brick and racks of masks drying, every face with its eyes closed (the census's priests
   and undertakers) */
defBuilding({key:'et_mask_house',name:'Mask house',seed:7133,cut:true,w:15,d:11,h:8,budget:90000,
 tags:{types:['funerary'],wealth:'middle',style:'common'},
 note:'a lime workshop and mortuary, a bottle kiln in the yard, racks of masks drying with their eyes closed',
 build(o){const lime=P('lime'),ls=P('limeShade'),G=.3,W=9,D=7;
  pushM(TF(-2.5,0,0));
   box('stone',0,0,0,W+.3,G,D+.3,P('stoneD'));box('paving',0,G-.02,0,W-.5,.05,D-.5,P('paving'));
   etWalls(W,D,G,3.4,'lime',lime,{front:[{x:-2.4,w:1.2,h:2.4,door:true,maskMetal:'terracotta'},{x:1.4,w:1.2,h:1.4,y:.9},{x:3.3,w:.9,h:1.4,y:.9}],
    right:[{x:1.6,w:1.0,h:2.2,door:true,mask:false}],back:[{x:-2,w:.8,h:.9,y:1.4}]});
   box('lime',.6,G,-1.0,W-1.2,3.4,.2,lime);                                              /* the mortuary behind its wall */
   box('lime',0,G+3.4,0,W,.2,D,ls);etParapet(W,D,G+3.6,.6,{crown:true,crownX:-2.4,crownW:2.4,steps:3,col:lime,cope:ls,crownMask:'terracotta'});
   FURNISH('eternian_common_mask_bench',-1.4,G,-.6,PI);FURNISH('eternian_common_mask_bench',2.4,G,-.6,PI);
   FURNISH('eternian_common_register_desk',-3.4,G,2.9,PI);FURNISH('eternian_common_chest',3.4,G,2.95,PI);
   FURNISH('eternian_common_table',0,G,-2.4,0);FURNISH('eternian_common_mask_shelf',-4.05,G,-2.3,PI/2);
  popM();
  // the yard: the bottle kiln, the racks of masks drying
  pushM(TF(4.6,0,-1));
   lathe('brick',0,0,[[1.6,0],[1.7,.6],[1.75,2.0],[1.4,3.2],[.8,4.2],[.55,5.6],[.6,6.0]],14,P('brick'));
   box('brick',0,0,1.55,.9,1.1,.3,new THREE.Color(P('brick')).multiplyScalar(.5));smokeAt(0,6.1,0);
  popM();
  for(const z of [2.6,4.0]){box('timber',4.6,0,z,4.2,.08,.08,P('timber'));for(const s of [-1,1])box('timber',4.6+s*2,0,z,.1,1.8,.1,P('timber'));
   box('timber',4.6,1.7,z,4.2,.08,.1,P('timber'));for(let i=0;i<5;i++)etMask(3.0+i*.8,1.25,z+.07,.42,i%2?'lead':'terracotta');}}});

/* the chapter house of the Order of Historians, who keep the archives: a hall of pale brick with lancets under grey tile,
   and its archive tower, three stepped piers with a verdigris needle; the registers on their shelves inside (the
   census's monks and lay brothers) */
defBuilding({key:'et_historians_house',name:"Historians' chapter house",seed:7134,cut:true,w:18,d:13,h:22,budget:110000,
 tags:{types:['religious'],wealth:'middle',style:'ministry'},
 note:'a brick chapter hall with lancets under grey tile, an archive tower of three stepped piers with a verdigris needle; shelves of registers inside',
 build(o){const sd=P('stoneD'),br=P('brick'),brD=new THREE.Color(br).multiplyScalar(.86),G=.5,W=12,D=8,H=6;
  pushM(TF(2,0,0));
   box('stone',0,0,0,W+.4,G,D+.4,sd);box('paving',0,G-.02,0,W-.5,.05,D-.5,P('paving'));
   etWalls(W,D,G,H,'brick',br,{front:[{x:0,w:1.3,h:2.6,door:true,maskMetal:'lead',leaf:P('timber')}],back:[{x:-3,w:1.0,h:2.0,y:2.4,steel:true,shut:false},{x:3,w:1.0,h:2.0,y:2.4,steel:true,shut:false}]},{frame:brD});
   for(const x of [-4,-2,2,4])etLancet(x,G+1.4,D/2+.01,.9,3.6,{light:'glass'});
   etGable(W,D,G+H,3.0,{mk:'tile',ribs:.3,ov:.45,wallMk:'brick',wallCol:br});
   for(const x of [-4.3,-2.5,2.5,4.3])FURNISH('eternian_common_archive_shelf',x,G,-D/2+.52,0);
   FURNISH('eternian_common_register_desk',-3,G,1.2,0);FURNISH('eternian_common_register_desk',3,G,1.2,0);
   FURNISH('eternian_common_table',0,G,-1.0,0);FURNISH('eternian_common_bench',0,G,.1,PI);
  popM();
  pushM(TF(-6.5,0,-1.5));box('stone',0,0,0,5.4,.5,5.4,sd);pushM(TF(0,.5,0));etPierBundle({n:3,w:5,d:5,h0:14,step:1.8,mk:'brick',col:br,spire:5});popM();
   etLancet(0,7,2.52,.6,4,{light:'glass'});popM();}});
