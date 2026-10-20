// prefix: et
// ================================================================= THE STATE (PLAN.md section 4, P4): the paper state's offices.
// The ministry is the stepped pier bundle in pale brick with figures in its niches; the registry a long hall of lancets
// with its vault; the examination hall a hexagon of cells round a court under a tower (the Sanctum's six-fold plan); the
// customs house an oculus wall over its gate. Every civic door is held up by two ancestors with arms spread.

/* the ministry: on a stone podium, the stepped pier bundle of nine piers (figures in the niches under their tops, a
   verdigris spire), a lancet bundle and an oculus over the civic door, the circuit-maze band, banners of the sign; the
   hall behind under a steep celadon hip, lancets down its flanks, three floors of offices in it (the clerks and the
   archive, the council room, the minister's floor with the household's niche); a tube head in a niche on its right flank */
defBuilding({key:'et_ministry',name:'Ministry',seed:7101,cut:true,w:27,d:22,h:46,budget:240000,
 tags:{types:['civic'],wealth:'rich',style:'ministry'},
 note:'the stepped pier bundle in pale brick, figures in its niches, a verdigris spire, a lancet bundle and oculus over a civic door held by two ancestors; the hall behind under celadon; a tube head in its flank',
 build(o){const sd=P('stoneD'),br=P('brick'),brD=new THREE.Color(br).multiplyScalar(.86),G=1.2;
  box('stone',0,0,0,25,G,20,sd);for(let k=0;k<4;k++)box('stone',0,0,10.3+k*.32,9-k*.6,G-k*.3,.32,sd);
  // the hall behind
  pushM(TF(0,G,-3));
   const bw=y=>[{x:-5,w:1.2,h:2.4,y:y,steel:true,shut:false},{x:5,w:1.2,h:2.4,y:y,steel:true,shut:false}];
   etWalls(20,12,0,14,'brick',br,{back:bw(1.2).concat(bw(5.8),bw(10.4)),front:[{x:0,w:2.0,h:3.2,door:true,mask:false,leaf:P('bronze')}]},{frame:brD});
   box('paving',0,-.02,0,19.4,.05,11.4,P('paving'));
   for(const y of [4.6,9.2]){box('timber',1.15,y-.25,0,17.1,.25,11.4,P('timber'));box('timber',-8.55,y-.25,-2.2,2.3,.25,7,P('timber'));
    etStair(-8.55,y-4.6,1.4,1.6,.23,.21,20,P('timberL'));}
   /* the clerks and the archive; the council room; the minister's floor and the household's niche */
   for(const x of [-4,0,4])FURNISH('eternian_common_register_desk',x,0,-1.8,0);
   for(const x of [-7.5,-2.5,2.5,7.5])FURNISH('eternian_common_archive_shelf',x,0,-5.47,0);
   FURNISH('eternian_common_tube_rack',9.45,0,2.2,-PI/2);FURNISH('eternian_common_bench',2,0,5.45,PI);
   FURNISH('eternian_common_table',1,4.6,0,0);FURNISH('eternian_common_table',3.8,4.6,0,0);
   for(const z of [-1.2,1.2])FURNISH('eternian_court_gallery_bench',2.4,4.6,z*1.6,z<0?0:PI);
   FURNISH('eternian_court_alabaster_lamp',-5,4.6,-5.2,0);FURNISH('eternian_court_alabaster_lamp',8.5,4.6,-5.2,0);
   FURNISH('eternian_court_ancestor_niche',0,9.2,-5.45,0);FURNISH('eternian_common_register_desk',4,9.2,-1,0);
   FURNISH('eternian_court_gallery_bench',-3.5,9.2,-5.45,0);FURNISH('eternian_court_alabaster_lamp',-1.6,9.2,-5.2,0);FURNISH('eternian_court_alabaster_lamp',1.6,9.2,-5.2,0);
   FURNISH('eternian_court_visor_case',9.47,9.2,-2,-PI/2);
   for(const s of [-1,1]){pushM(TF(s*10,0,0,s*PI/2));for(const x of [-3.2,3.2])etLancets(x,2.5,0,{n:3,w:.9,gap:.3,h:7.5,step:.6,light:'glass',headMk:'brick',headCol:brD});
    etMazeBand(0,12.2,.02,11,.7);popM();}
   box('stone',0,13.7,0,20.6,.4,12.6,sd);
   etHip(20,12,14.1,7,{mk:'celadon',ov:.8,flare:.6,under:P('timber'),cap:P('celadon')});
   pushM(TF(10,0,2.2,PI/2));etTubeHead(0,.02,3.0);popM();
  popM();
  // the pier bundle at the front, the figures in its niches by rank
  pushM(TF(0,G,5.5));
   const R=etPierBundle({n:9,w:22,d:5,h0:17,step:2.2,mk:'brick',col:br,spire:16,niches:true});
   const ranks=['gunmetal','bronze','silver','gold','gold','gold','silver','bronze','gunmetal'];
   R.niches.forEach((q,i)=>{box('stone',q[0],q[1]-.12,q[2]+.12,R.pw*.6,.16,.5,P('stoneD'));etFigure(q[0],q[1]+.04,q[2]+.14,R.pw*.85,{metal:ranks[i],pose:i===4?'folded':'stand'});});   /* on a ledge before the niche */
   etLancets(0,6.0,2.78,{n:5,w:1.1,gap:.35,h:7.5,step:.7,oculus:1.1,light:'glass',headMk:'brick',headCol:brD});
   etMazeBand(0,15.2,2.78,20.5,.75);
   for(const s of [-1,1])etBanner(s*7.3,15.0,2.78,1.4,5.2);
   etCivicDoor(0,2.5,2.4,4.6,{metal:'gold'});
  popM();}});

/* the registry: the land and census registry, a long hall of pale brick on a podium, seven lancets in its front between
   pilasters, a civic door, a celadon hip; the vault at its back corner, a squat stone block with an iron door. Inside:
   the clerks at their desks, the registers on their shelves (the census's guild officers and clerks) */
defBuilding({key:'et_registry',name:'Registry',seed:7102,cut:true,w:30,d:18,h:17,budget:160000,
 tags:{types:['civic'],wealth:'rich',style:'ministry'},
 note:'a long hall of pale brick, seven lancets between pilasters, a civic door held by two ancestors, a celadon hip; a stone vault behind; the clerks and the registers inside',
 build(o){const sd=P('stoneD'),br=P('brick'),brD=new THREE.Color(br).multiplyScalar(.86),G=.8,W=26,D=10,H=8;
  box('stone',0,0,0,W+1,G,D+1,sd);for(let k=0;k<3;k++)box('stone',0,0,D/2+.8+k*.3,6-k*.5,G-k*.25,.3,sd);
  box('paving',0,G-.02,0,W-.6,.05,D-.6,P('paving'));
  etWalls(W,D,G,H,'brick',br,{back:[{x:-8,w:1.2,h:2.2,y:4,steel:true,shut:false},{x:8,w:1.2,h:2.2,y:4,steel:true,shut:false}],
   left:[{x:0,w:1.2,h:2.2,y:4,steel:true,shut:false}],right:[{x:0,w:1.2,h:2.2,y:4,steel:true,shut:false}]},{frame:brD});
  for(let i=0;i<8;i++){const x=-W/2+.4+i*(W-.8)/7;box('brick',x,G,D/2+.15,.6,H,.3,brD);}
  for(let i=0;i<7;i++){const x=-W/2+.4+(i+.5)*(W-.8)/7;if(i!==3)etLancet(x,G+1.6,D/2+.15,1.3,5.6,{light:'glass'});}
  etFrieze(0,G+H-1.6,D/2+.32,W-1,1.2);
  pushM(TF(0,G,0));etCivicDoor(0,D/2+.15,2.0,3.9,{metal:'bronze'});popM();
  box('stone',0,G+H,0,W+.6,.35,D+.6,sd);
  etHip(W,D,G+H+.35,5.2,{mk:'celadon',ov:.7,flare:.5,under:P('timber'),cap:P('celadon')});
  // the vault
  box('stone',W/2-3,0,-D/2-2.6,5.5,4.6,4.8,sd);for(let k=0;k<3;k++)box('stone',W/2-3,4.6+k*.35,-D/2-2.6,5-k*1.2,.35,4.3-k*1.0,new THREE.Color(sd).multiplyScalar(1.1));
  box('iron',W/2-3,0,-D/2-.18,1.3,2.3,.1,P('iron'));
  // the clerks and the registers
  for(const x of [-9,-5,-1,3])FURNISH('eternian_common_register_desk',x,G,-3.2,0);
  for(const x of [-11,-7.5,6.5,10])FURNISH('eternian_common_archive_shelf',x,G,-D/2+.52,0);
  FURNISH('eternian_common_bench',-6,G,1.6,PI);FURNISH('eternian_common_table',7,G,1.0,0);
  FURNISH('eternian_court_alabaster_lamp',-12.2,G,3.8,0);FURNISH('eternian_court_alabaster_lamp',12.2,G,3.8,0);
  FURNISH('generic_writing_supplies',7.6,G+.76,1.0,0);}});

/* the examination hall, where the ministers are made: a hexagon of cells round a paved court, each cell a desk and a
   stool, its door on the court; a hexagonal tower over the court's middle, its cap a celadon ogee; the gate through the
   front range under a stepped head (the census's teachers and scholars) */
defBuilding({key:'et_examination_hall',name:'Examination hall',seed:7103,cut:true,w:26,d:26,h:30,budget:220000,
 tags:{types:['civic'],wealth:'rich',style:'ministry'},
 note:'a hexagon of examination cells round a paved court, a hexagonal tower over the court under a celadon ogee, the gate through the front range',
 build(o){const sd=P('stoneD'),bl=P('block'),br=P('brick'),G=.4,RO=12.4,RI=7.4,H=3.6,api=RI*ET_HEX_AP,apo=RO*ET_HEX_AP,dep=apo-api,L=2*api*Math.tan(PI/6);
  prism('stone',etHex(RO+.3),0,G,sd);prism('paving',etHex(RI),G,G+.04,P('paving'));
  /* each range from the court's hexagon to the outer one: an inner wall of doors on the court, an outer wall of slits, radial
     end walls and partitions, a grey-tiled pent running down to the court */
  etHexFaces((api+apo)/2,(k)=>{const front=k===1,zi=-dep/2+ET_T/2,zo=dep/2-ET_T/2,yc=G+H/2;
   const xi=c=>-RI/2+c*RI/5,xo=c=>-RO/2+c*RO/5,inner=[],outer=[];
   for(let c=0;c<5;c++){if(front&&c===2)continue;inner.push({x:-(xi(c)+RI/10),w:.8,h:2.1,door:true,mask:false,leaf:P('timber')});outer.push({x:xo(c)+RO/10,w:.5,h:.8,y:1.6,dark:true,head:'flat',shut:false});}
   if(front){inner.push({x:0,w:1.8,h:2.8,gap:true});outer.push({x:0,w:1.8,h:2.8,gap:true});
    etStepHead(0,G+3.2,dep/2+.05,2.4,{mk:'brick',col:br});box('paving',0,G-.02,0,1.8,.06,dep,P('paving'));}
   pushM(TF(0,0,zi,PI));etWall(RI,G,H,'block',bl,inner,{frame:bl});popM();
   pushM(TF(0,0,zo));etWall(RO,G,H,'block',bl,outer,{frame:bl});popM();
   for(let c=0;c<=5;c++){if(front&&(c===2||c===3))continue;beam('block',[xi(c),yc,zi],[xo(c),yc,zo],c%5?.2:.3,bl,false,undefined,H);}
   etPent((RI+RO)/2+.8,dep,G+H+.05,G+H+.8,{mk:'tile',ribs:.3,ov:.4});
   if(!front)for(const c of [0,3])FURNISH('eternian_common_exam_desk',xo(c)+RO/10,G,zo-.45,PI);});
  /* the corners between the ranges: brick piers */
  for(const q of etHex((RI+RO)/2))box('brick',q[0],0,q[1],1.3,G+H+.9,1.3,br);
  // the tower over the court's middle
  prism('brick',etHex(3.0),G,G+21,br);prism('stone',etHex(3.3),G+21,G+21.5,sd);
  etHexFaces(3.0*ET_HEX_AP,(k)=>{etLancet(0,G+12,.02,.8,6,{light:'glass'});if(k===1){etFaceScreen(0,G+6,.04,1.4,1.4,ET_FACE_CALM[2]);box('bronze',0,G+5.2,.02,1.7,1.7,.06,P('bronze'));}
   etMazeBand(0,G+19.6,.03,2.9,.55);});
  etOgee(3.6,G+21.5,6,{mk:'celadon',seg:6,a0:0,col:etKeyCol('celadon')});
  FURNISH('eternian_common_bench',0,G,-2.2,0);FURNISH('eternian_court_alabaster_lamp',-3.5,G,3.0,0);}});

/* the customs house of Farport and the Cut road: the weighing hall under celadon, its gate through a brick wall raised
   over the road with a great oculus in it and two lancets; the scales, the clerks' desks and the goods inside (the
   census's customs officers and clerks) */
defBuilding({key:'et_customs_house',name:'Customs house',seed:7104,cut:true,w:21,d:13,h:15,budget:130000,
 tags:{types:['civic'],wealth:'middle',style:'ministry'},
 note:'the weighing hall under celadon behind a raised brick gate wall with a great oculus over the gate; scales, clerks and goods inside',
 build(o){const sd=P('stoneD'),br=P('brick'),brD=new THREE.Color(br).multiplyScalar(.86),G=.4,W=19,D=10,H=6.5;
  box('stone',0,0,0,W+.6,G,D+.6,sd);box('paving',0,G-.02,0,W-.6,.05,D-.6,P('paving'));
  etWalls(W,D,G,H,'brick',br,{front:[{x:-6,w:1.1,h:2.0,y:1.2,steel:true,shut:false},{x:6,w:1.1,h:2.0,y:1.2,steel:true,shut:false}],
   back:[{x:0,w:3.6,h:3.8,gap:true}],left:[{x:0,w:1.1,h:2.0,y:1.2,steel:true,shut:false}],right:[{x:0,w:1.1,h:2.0,y:1.2,steel:true,shut:false}]},{frame:brD});
  // the gate wall raised over the road, the gate through it, the oculus over the gate
  pushM(TF(0,0,D/2+.35));box('brick',-4.6,0,0,6,11.5,.7,br);box('brick',4.6,0,0,6,11.5,.7,br);box('brick',0,4.8,0,3.2,6.7,.7,br);
   for(let k=0;k<3;k++)box('brick',0,11.5+k*.45,0,12.4-k*3.2,.45,.8,brD);
   etOculus(0,8.2,.37,1.25,{mk:'brick',col:brD,lit:true});
   for(const s of [-1,1])etLancet(s*4.2,5.6,.37,.8,4.4,{light:'glass'});
   box('bronze',0,0,.2,3.0,4.6,.08,P('bronze'));door(0,0,.4,0,3.0);
   etMazeBand(0,10.2,.37,11,.6);
  popM();
  box('stone',0,G+H,0,W+.5,.3,D+.5,sd);etHip(W,D,G+H+.3,4.2,{mk:'celadon',ov:.6,flare:.4,under:P('timber'),cap:P('celadon')});
  FURNISH('eternian_common_weighing_scale',-3,G,0,0);FURNISH('eternian_common_weighing_scale',3,G,0,0);
  FURNISH('eternian_common_register_desk',-7,G,-4.1,0);FURNISH('eternian_common_register_desk',7,G,-4.1,0);
  FURNISH('job_bales',-7.5,G,2.6,0);FURNISH('generic_crate',7.6,G,2.8,0);FURNISH('generic_sack',6.6,G,3.4,0);FURNISH('generic_strongbox',-4.6,G,-4.0,0);}});
