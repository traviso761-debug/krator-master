// prefix: et
// ================================================================= THE LAND (PLAN.md section 4, P6): the lowland's farms between
// the canals, the paddies and raised beds, the infusion and lacquer gardens, the mines and quarries of the uplands, the
// stock pens. The farmstead is hexagonal (the owner, 2026-10-20: the six-fold plan reaches the countryside).

/* a field of ridges or paddies, w x d at (x, z), its rows along x */
function etField(x,z,w,d,col,rows,wet){box('earth',x,0,z,w,.08,d,new THREE.Color(P('earth')).multiplyScalar(.9));
 if(wet)box('water',x,.06,z,w-.4,.08,d-.4,new THREE.Color(0x4a6a5a));
 for(let i=0;i<rows;i++)box('earth',x,.08,z-d/2+(i+.5)*d/rows,w-.4,.14,d/rows*.45,col);}

/* the farmstead: a hexagonal farmhouse and its byre round a yard, fields of grain and greens about it (farmhands) */
defBuilding({key:'et_farmstead',name:'Farmstead',seed:7430,cut:true,w:30,d:28,h:9,budget:90000,
 tags:{types:['farm'],wealth:'poor',style:'poor',job:'farming'},
 note:'a hexagonal farmhouse of silt brick under reed, the byre and the threshing floor, fields of grain and greens about it',
 build(o){pushM(TF(-3,0,-3));etTrade({plan:'hex',R:4.6,mk:'silt',upMk:'silt',roof:'pyramid',roofMk:'reed',poor:true,
   furn:[['eternian_poor_reed_mat',4,.6],['eternian_poor_hearth',3,.4],['eternian_poor_mask_board',2,.25],['eternian_poor_block_bench',5,.35],['generic_sack',0,.5]]});popM();
  pushM(TF(5.5,0,-3,-PI/2));etTrade({w:6,d:4,G:.15,mk:'silt',roof:'pent',roofMk:'reed',poor:true,mask:false});popM();
  cyl('earth',3,0,4,2.4,.15,new THREE.Color(0x9a8a6a),14);FURNISH('job_winnowing_mat',3,.15,4,0);FURNISH('job_sheaf_rack',-3,0,4.5,0);
  etField(0,10.5,26,6,new THREE.Color(0xc2a85a),8);etField(-10,-3,7,20,new THREE.Color(0x5a7a3a),10);}});

/* the paddy: raised beds and flooded paddies between the canals, a field shelter on stilts (the census's chinampa
   growers: the lowlands are wet) */
defBuilding({key:'et_paddy',name:'Paddies',seed:7431,w:28,d:24,h:5,budget:30000,front:{x:0,z:12,yaw:0},
 tags:{types:['farm'],wealth:'poor',style:'poor',job:'farming'},
 note:'flooded paddies and raised beds between canals, a field shelter on stilts',
 build(o){for(let i=0;i<3;i++)etField(-9+i*9,-5,8,10,new THREE.Color(0x6a9a3a),6,true);
  for(let i=0;i<3;i++)etField(-9+i*9,6.5,8,9,new THREE.Color(0x4a7a2a),5,false);
  box('water',0,0,1,28,.3,1.6,new THREE.Color(ET_WATER));box('water',-13.4,0,0,1.2,.3,24,new THREE.Color(ET_WATER));
  for(const [x,z] of [[11,1],[13,1],[11,3],[13,3]])box('timber',x,0,z,.15,1.6,.15,P('timber'));
  box('timber',12,1.6,2,2.6,.15,2.6,P('timberL'));pushM(TF(12,1.75,2));etGable(2.4,2.4,0,1.2,{mk:'reed',col:P('reed'),ov:.3,gables:false});popM();}});

/* the tea garden: rows of the lowland infusion bushes and the lacquer trees, a hexagonal drying house (orchardmen) */
defBuilding({key:'et_tea_garden',name:'Tea garden',seed:7432,cut:true,w:26,d:22,h:8,budget:60000,
 tags:{types:['farm'],wealth:'middle',style:'common',job:'farming'},
 note:'terraced rows of infusion bushes and lacquer trees, a hexagonal drying house with its trays',
 build(o){for(let r=0;r<6;r++)for(let i=0;i<9;i++){const x=-11+i*2.6,z=1+r*1.7;ellip('plain',x,0,z,.8,.7,.6,new THREE.Color(0x3e6a3a),0,8);}
  for(let i=0;i<5;i++){const x=-10+i*5;box('timber',x,0,-8.5,.25,2.2,.25,P('timber'));sph('plain',x,2.6,-8.5,1.3,new THREE.Color(0x4a6a32));}
  pushM(TF(5,0,-3.5));etTrade({plan:'hex',R:3.4,roof:'pyramid',roofMk:'tile',
   furn:[['eternian_common_table',4,.6],['generic_tea_set',3,.5],['generic_floor_basket',5,.5],['generic_basket',2,.5]]});popM();}});

/* the mine: a headframe over the shaft, the winding house, the spoil heap and the ore bins (miners) */
defBuilding({key:'et_mine',name:'Mine',seed:7433,cut:true,w:22,d:18,h:16,budget:60000,
 tags:{types:['industry'],wealth:'poor',style:'common',job:'mining'},
 note:'a timber headframe over the shaft, the winding house of cast block, a spoil heap and the ore bins',
 build(o){box('stone',-4,0,0,3.4,.4,3.4,P('stoneD'));box('plain',-4,.05,0,2.6,.4,2.6,new THREE.Color(0x08090a));
  for(const sx of [-1,1])for(const sz of [-1,1])beam('timber',[-4+sx*1.6,0,sz*1.6],[-4+sx*.5,12,sz*.5],.3,P('timber'));
  box('timber',-4,12,0,1.6,.3,1.6,P('timber'));pushM(TF(-4,12.6,0,0,PI/2));ring('iron',0,0,0,.8,.08,P('iron'));popM();
  pushM(TF(4,0,-2));etTrade({w:6,d:5,roof:'pent',mask:'lead',chimney:[1.8,-1.6],
   furn:[['generic_crate',-1.8,-1.6,0],['eternian_common_bench',1,1.6,PI],['generic_lamp_oil',1.8,-1.6,0],['eternian_common_chest',-.2,-1.7,0]]});popM();
  ellip('earth',2,0,6.5,4.5,2.4,3,new THREE.Color(0x5a5048),0,10);
  for(let i=0;i<3;i++)box('timber',-8+i*1.6,0,6,1.4,1.2,1.4,P('timber'));}});

/* the quarry: a stepped cut into the hill, the blocks dressed on the floor, a crane (quarrymen and masons) */
defBuilding({key:'et_quarry',name:'Quarry',seed:7434,w:24,d:18,h:12,budget:40000,front:{x:0,z:9,yaw:0},
 tags:{types:['industry'],wealth:'poor',style:'common',job:'mining'},
 note:'a stepped cut of pale stone into the hill, dressed blocks on the floor, a timber crane and the masons shed',
 build(o){const st=new THREE.Color(0xc8bea8);for(let k=0;k<4;k++)box('stone',0,0,-5-k*1.1,22-k*2,2+k*2.4,2.2,st);
  for(let i=0;i<7;i++)box('stone',-7+i*2.2,0,2+(i%2),1.4,.9,.9,st);
  box('timber',6,0,-1,.4,8,.4,P('timber'));beam('timber',[6,7.6,-1],[6,6.4,4],.3,P('timber'));box('iron',6,4.6,3.8,.03,1.8,.03,P('iron'));
  pushM(TF(-8,0,5));box('timber',0,0,0,4,.1,3,P('earth'));for(const x of [-1.8,1.8])for(const z of [-1.3,1.3])box('timber',x,0,z,.15,2.4,.15,P('timber'));
   etPent(4,3,2.4,2.8,{mk:'reed',col:P('reed'),ov:.2});popM();}});

/* the stock pens: the byres and sties of block, the duck pond, the dairy (dairymen; swineherds and duck keepers) */
defBuilding({key:'et_stock_pens',name:'Stock pens',seed:7435,cut:true,w:22,d:18,h:7,budget:60000,
 tags:{types:['farm'],wealth:'poor',style:'poor',job:'herding'},
 note:'block byres and sties round a fenced yard, a duck pond, the dairy with its churns',
 build(o){for(const s of [-1,1]){pushM(TF(s*7,0,-4));etTrade({w:6,d:5,G:.15,mk:'block',roof:'pent',roofMk:'reed',poor:true,mask:false});popM();}
  pushM(TF(0,0,-4.5));etTrade({w:5,d:4,G:.2,roof:'gable',mask:'lead',
   furn:[['generic_churn',-1.5,-1.1,0],['generic_dairy',.2,-1.1,0],['generic_storage_jar',1.6,-1.1,0],['eternian_common_bench',0,1.3,PI]]});popM();
  for(let i=0;i<9;i++){box('timber',-9+i*2.25,0,7.5,.12,1.1,.12,P('timber'));}box('timber',0,.9,7.5,18,.08,.08,P('timber'));box('timber',0,.5,7.5,18,.08,.08,P('timber'));
  for(const s of [-1,1]){box('timber',s*9,0,2.5,.12,1.1,10,P('timber'));}
  ellip('water',5,0,3,2.6,.15,1.8,new THREE.Color(ET_WATER),0,12);box('earth',-2,.02,3,10,.04,8,P('earth'));}});
