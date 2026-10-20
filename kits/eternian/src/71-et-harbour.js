// prefix: et
// ================================================================= HYDRAULICS AND HARBOUR (PLAN.md section 4, P6): the lock and its
// bronze gear, the reservoir's stepped wall (the Khmer pattern), the spillway through a carved face's mouth (its water
// runs: the record's `spill`, run by 91d-et-water.js), the landings of the canal town, and Farport's quay, dockyard,
// lighthouse and the walled quarter its visitors are kept in.

/* the lock: a stone chamber between two reaches of the canal, the upper 1.6 m higher; mitre gates of bronze at both
   ends, each with its balance beams and a geared winch */
defBuilding({key:'et_lock',name:'Canal lock',seed:7704,cls:'feature',kind:'lock',w:30,d:15,h:5,budget:30000,front:{x:0,z:6,yaw:0},
 tags:{types:['infrastructure']},
 note:'a stone lock chamber between two reaches, bronze mitre gates with balance beams and geared winches',
 build(o){const sd=P('stoneD'),Q=ET_QUAY,hw=ET_CANAL_W/2;
  box('stone',0,0,0,30,.05,ET_CANAL_W,new THREE.Color(sd).multiplyScalar(.55));
  box('water',-10,.05,0,10,.5,ET_CANAL_W,new THREE.Color(ET_WATER));box('water',0,.05,0,10,1.2,ET_CANAL_W,new THREE.Color(ET_WATER));box('water',10,.05,0,10,2.1,ET_CANAL_W,new THREE.Color(ET_WATER));
  for(const s of [-1,1]){box('stone',0,0,s*(hw+.6),30,Q+1.6,1.2,sd);box('stone',0,Q+1.6,s*(hw+.6),30,.14,1.6,new THREE.Color(sd).multiplyScalar(1.15));}
  for(const gx of [-5,5])for(const s of [-1,1]){
   beam('bronze',[gx,.3,s*hw],[gx+(gx<0?-1.2:1.2),.3,0],.25,P('bronze'),false,undefined,gx<0?Q:Q+1.6);   /* the leaf */
   beam('timber',[gx,Q+2.0,s*hw],[gx+(gx<0?4:-4),Q+2.0,s*(hw+3.2)],.3,P('timber'));                     /* the balance beam */
   pushM(TF(gx,Q+1.74,s*(hw+1.3),0,PI/2));ring('bronze',0,0,0,.5,.08,P('bronze'),0,PI/2);popM();box('bronze',gx,Q+1.74,s*(hw+1.3),.3,.8,.3,P('bronze'));}}});

/* a reservoir wall: 30 m of the stepped wall on the reservoir's high side, the water held at the top (the Khmer pattern) */
defBuilding({key:'et_reservoir_wall',name:'Reservoir wall',seed:7705,cls:'feature',kind:'reservoir',w:30,d:18,h:9,budget:20000,front:{x:0,z:9,yaw:0},
 tags:{types:['infrastructure']},
 note:'a 30 m run of the stepped reservoir wall in dark stone, the water held behind it at its crest',
 build(o){const sd=P('stoneD');for(let k=0;k<6;k++)box('stone',0,0,4-k*1.4,30,1.2+k*1.3,1.4,k%2?sd:new THREE.Color(sd).multiplyScalar(1.12));
  box('water',0,0,-6.2,30,7.4,5.6,new THREE.Color(ET_WATER));box('paving',0,7.7,-3.6,30,.12,1.6,P('paving'));}});

/* the spillway face: a dam's breach faced as a colossal ancestor's face in stone, eyes closed, the spillway through its
   mouth into a basin. The water runs (the record's `spill`: the lip, its width and the fall, run by 91d-et-water.js) */
defBuilding({key:'et_spillway',name:'Spillway face',seed:7706,cls:'feature',kind:'spillway',w:24,d:20,h:22,budget:40000,front:{x:0,z:8,yaw:0},
 tags:{types:['infrastructure']},
 note:'a dam wall faced with a colossal stone face, eyes closed, the spillway running from its mouth into a basin',
 build(o){const sd=P('stoneD'),HF=14,MY=6.6;
  for(let k=0;k<4;k++)box('stone',0,0,-4-k*1.6,24-k*1.2,16+k*1.4,1.6,sd);
  box('water',0,0,-9.5,22,20.5,4,new THREE.Color(ET_WATER));
  etHead(0,1.2,-2.6,HF,{metal:'stone',headdress:'none'});
  box('plain',0,MY,3.1,2.6,.9,.6,new THREE.Color(0x08090a));                               /* the mouth's throat */
  box('stone',0,0,4.5,16,1.0,7,sd);box('water',0,.2,4.5,15,.75,6.2,new THREE.Color(ET_WATER));
  if(CURREC&&!PLACE_DRY){const W=(x,y,z)=>{const v=new THREE.Vector3(x,y,z).applyMatrix4(CM);return [+v.x.toFixed(3),+v.y.toFixed(3),+v.z.toFixed(3)];};
   CURREC.spill={lip:W(0,MY,3.5),foot:W(0,.95,4.8),width:2.2};}}});

/* the canal landing: a flight of steps down the quay to the water, mooring posts, a bargemen's kiosk (river bargemen and
   quay hands) */
defBuilding({key:'et_canal_landing',name:'Canal landing',seed:7707,w:12,d:12,h:5,budget:20000,front:{x:0,z:6,yaw:0},
 tags:{types:['infrastructure'],wealth:'poor',style:'common',job:'trading'},
 note:'steps down the quay to the water, mooring posts, a kiosk for the bargemen and a moored barge',
 build(o){const sd=P('stoneD');box('stone',0,0,-3,12,ET_QUAY,6,sd);box('paving',0,ET_QUAY-.02,-3,12,.05,6,P('paving'));
  box('water',0,0,3,12,.55,6,new THREE.Color(ET_WATER));for(let k=0;k<4;k++)box('stone',-3,0,.3+k*.35,3,ET_QUAY-.25*(k+1),.35,sd);
  for(const x of [1,4])cyl('bronze',x,ET_QUAY,-.4,.1,.5,P('bronze'),8);
  pushM(TF(3,ET_QUAY,-4));etTrade({w:3,d:2.4,G:.1,roof:'pent',mask:'lead'});popM();
  box('timber',2,.2,3.4,8,.6,2.4,P('timber'));box('timber',2,.8,3.4,7.6,.1,2.2,P('timberL'));}});

/* the ferry landing: a timber stage on piles, the ferry at it, the toll booth (ferrymen) */
defBuilding({key:'et_ferry_landing',name:'Ferry landing',seed:7708,w:12,d:16,h:5,budget:20000,front:{x:0,z:8,yaw:0},
 tags:{types:['infrastructure'],wealth:'poor',style:'common',job:'trading'},
 note:'a timber stage on piles over the water, the flat ferry at it, the toll booth',
 build(o){box('water',0,0,3,12,.4,10,new THREE.Color(ET_WATER));
  for(const x of [-1.6,1.6])for(let i=0;i<4;i++)box('timber',x,0,-1+i*2.4,.25,1.3,.25,P('timber'));box('timber',0,1.1,2.6,4,.2,8,P('timberL'));
  box('timber',4.6,.1,4,3.6,.5,7,P('timber'));box('timber',4.6,.6,4,3.4,.08,6.8,P('timberL'));for(const z of [1,7])box('timber',4.6,.6,z,3.4,.9,.08,P('timber'));
  pushM(TF(-2.8,0,-4.5));etTrade({w:3,d:2.6,G:.2,roof:'gable',mask:'lead'});popM();}});

/* the fish landing: a jetty with the nets drying on their frames and the catch in trays (fishers) */
defBuilding({key:'et_fish_landing',name:'Fish landing',seed:7709,w:14,d:16,h:4,budget:20000,front:{x:0,z:8,yaw:0},
 tags:{types:['infrastructure'],wealth:'poor',style:'poor',job:'fishing'},
 note:'a jetty over the water, nets drying on frames, the catch in trays, two boats',
 build(o){box('water',0,0,3,14,.4,10,new THREE.Color(ET_WATER));box('earth',0,0,-5,14,.4,6,P('earth'));
  for(let i=0;i<5;i++){box('timber',-1,0,-1+i*2.2,.2,1.2,.2,P('timber'));box('timber',1,0,-1+i*2.2,.2,1.2,.2,P('timber'));}box('timber',0,1.0,3.4,2.8,.18,9,P('timberL'));
  for(const x of [-4.4,4.4]){box('timber',x,.1,4,1.6,.4,5,P('timber'));}
  FURNISH('job_net_frame',-4,.4,-5,0);FURNISH('job_net_frame',4,.4,-5,0);FURNISH('job_fish_tray',0,.4,-5.2,0);FURNISH('generic_fish',1.2,.4,-4,0);}});

/* Farport's quay: a stone quay with bollards, a crane over the berth, the coast guard's watch kiosk where the visitors
   are watched (coast guard; dockers and stevedores) */
defBuilding({key:'et_quay',name:'Quay',seed:7710,w:32,d:14,h:12,budget:40000,front:{x:0,z:7,yaw:0},
 tags:{types:['infrastructure'],wealth:'middle',style:'ministry',job:'trading'},
 note:"Farport's stone quay: bollards, a crane over the berth, the coast guard's watch kiosk, cargo on the stones",
 build(o){const sd=P('stoneD');box('stone',0,0,-2,32,2.2,10,sd);box('paving',0,2.18,-2,32,.07,10,P('paving'));box('water',0,0,5.2,32,1.2,4.4,new THREE.Color(ET_WATER));
  for(let x=-14;x<=14;x+=4)cyl('bronze',x,2.2,2.6,.16,.6,P('bronze'),8);
  pushM(TF(8,2.2,-1));box('timber',0,0,0,.6,9,.6,P('timber'));beam('timber',[0,8.6,0],[0,7.4,5.2],.4,P('timber'));box('iron',0,5.4,5,.04,2,.04,P('iron'));popM();
  pushM(TF(-11,2.2,-4));etTrade({plan:'hex',R:2.2,G:.15,mk:'brick',roof:'pyramid',mask:'lead',steel:true});popM();
  FURNISH('generic_crate',-4,2.2,-3,0);FURNISH('job_bales',-2,2.2,-4,0);FURNISH('generic_barrel',0,2.2,-3,0);FURNISH('generic_sack',2,2.2,-4.2,0);}});

/* the dockyard: a slipway with a hull in frame on it, the timber shed and the saw pit (shipwrights and boatbuilders) */
defBuilding({key:'et_dock',name:'Dockyard',seed:7711,cut:true,w:30,d:26,h:12,budget:70000,
 tags:{types:['industry'],wealth:'middle',style:'common',job:'carpentry'},
 note:'a slipway with a hull in frame on it, the timber shed and the saw pit',
 build(o){box('stone',4,0,0,7,.4,20,P('stoneD'));box('water',4,0,12.5,9,.4,5,new THREE.Color(ET_WATER));
  for(let i=0;i<12;i++){const z=-7.5+i*1.4,w=4.2*Math.sin(Math.PI*(i+.5)/12)+.6;
   pushM(TF(4,.5,z));ring('timber',0,1.4,0,w/2,.08,P('timber'),0,PI/2);popM();}
  box('timber',4,.5,0,.3,.4,17,P('timber'));
  pushM(TF(-8,0,-3));etTrade({w:8,d:12,roof:'gable',mk:'block',
   furn:[['job_plank_stack',-1.6,-3.5,0],['job_saw_bench',1.2,0,PI/2],['job_pole_rack',-3.5,2,PI/2],['generic_barrel',2.6,-4.6,0],['eternian_common_bench',2.6,4.8,PI]]});popM();}});

/* the lighthouse of Farport: a hexagonal pier bundle of pale brick on a rock, its lantern of bronze and alabaster on top
   (lighthouse keepers) */
defBuilding({key:'et_lighthouse',name:'Lighthouse',seed:7712,w:14,d:14,h:34,budget:50000,front:{x:0,z:7,yaw:0},
 tags:{types:['infrastructure'],wealth:'middle',style:'ministry',job:'fishing'},
 note:'a hexagonal tower of pale brick in stepped piers on a rock, a lantern of bronze and alabaster, the keeper at its foot',
 build(o){ellip('stone',0,0,0,6.5,1.4,6.5,P('stoneD'),0,10);
  prism('brick',etHex(3.6),1,22,P('brick'));for(const q of etHex(3.6))box('brick',q[0],1,q[1],1.0,23.4,1.0,new THREE.Color(P('brick')).multiplyScalar(.86));
  prism('stone',etHex(4.2),22,22.6,P('stoneD'));
  pushM(TF(0,22.6,0));etHexFaces(2.6*ET_HEX_AP,()=>{box('alabaster',0,0,0,2.4,3.2,.1,new THREE.Color(1,1,1));etTracery(0,0,.08,2.4,3.2,{head:'flat',mw:.4,th:.5});});
   for(const q of etHex(2.6))box('bronze',q[0],0,q[1],.25,3.3,.25,P('bronze'));box('glow',0,.6,0,1.2,1.8,1.2,new THREE.Color(0xffe6bc));
   etOgee(3.1,3.3,3,{mk:'scale',seg:6,a0:0,col:P('bronze'),finial:1.2});popM();
  pushM(TF(0,1,4.8));etWall(2.6,0,2.6,'brick',P('brick'),[{x:0,w:1.0,h:2.2,door:true,maskMetal:'lead'}],{t:.04});popM();}});

/* the factory quarter: the walled quarter of Farport its foreign traders are confined to, a gate under watch, two
   warehouses and a hall inside, nothing of theirs outside */
defBuilding({key:'et_factory_quarter',name:'Factory quarter',seed:7713,cut:true,w:42,d:32,h:16,budget:200000,
 tags:{types:['civic'],wealth:'middle',style:'ministry',job:'trading'},
 note:"Farport's walled quarter for the foreign traders: a block wall with one gate under watch, two hexagonal warehouses and a hall inside",
 build(o){const bl=P('block'),ls=P('limeShade');
  pushM(TF(0,0,15));etWall(40,0,4.2,'block',bl,[{x:0,w:3,h:3.4,door:true,mask:false,leaf:P('bronze')}],{t:.5});popM();
  box('block',0,0,-15,40,4.2,.5,bl);for(const s of [-1,1])box('block',s*19.75,0,0,.5,4.2,30,bl);
  for(const [x,z] of [[-20,15],[20,15],[-20,-15],[20,-15]]){box('block',x,0,z,2.4,6,2.4,bl);box('block',x,6,z,2.8,.3,2.8,ls);}
  for(const s of [-1,1])box('brick',s*2.6,0,15.6,1.6,6.4,1.6,P('brick'));box('brick',0,6.4,15.6,6.8,.8,1.6,P('brick'));etHead(0,7.2,15.7,1.4,{metal:'bronze'});
  for(const x of [-10,10]){pushM(TF(x,0,4));etTrade({plan:'hex',R:5,storeys:2,mk:'brick',upMk:'brick',roof:'pyramid',mask:false,
   furn:[['generic_crate',0,.6],['job_bales',2,.6],['generic_barrel',3,.6],['generic_sack',4,.6]]});popM();}
  pushM(TF(0,0,-9));etTrade({w:14,d:7,roof:'gable',mask:false,furn:[['eternian_common_table',-3,0,0],['eternian_common_bench',-3,1.2,PI],['eternian_common_register_desk',3,-2.9,0],['generic_tea_set',-3,0,0]]});popM();
  box('paving',0,0,4,8,.05,22,P('paving'));}});
