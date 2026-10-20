// prefix: et
// ================================================================= THE ETERNIAN WORKS (PLAN.md section 4, P6): the trades that are
// the State's own: fired brick and celadon tile, porcelain, paper and print (the paper state). The kiln and the tile
// works are hexagonal (the owner, 2026-10-20), courts of six ranges round their kilns. Together the census's industrial
// workers.

/* the kiln works: a hexagonal court of six brick sheds round three bottle kilns, the clay heaps and the stacks of fired
   brick in the court, a gate through the front shed */
defBuilding({key:'et_kiln',name:'Kiln works',seed:7401,cut:true,w:26,d:26,h:14,budget:120000,front:{x:0,z:12,yaw:0},
 tags:{types:['industry'],wealth:'middle',style:'common',job:'pottery'},
 note:'a hexagonal court of brick sheds round three bottle kilns, clay heaps and stacks of fired brick, a gate through the front shed',
 build(o){const br=P('brick'),brD=new THREE.Color(br).multiplyScalar(.86),RO=12,RI=8,G=.3,H=3.4,api=RI*ET_HEX_AP,apo=RO*ET_HEX_AP,dep=apo-api;
  prism('stone',etHex(RO+.3),0,G,P('stoneD'));prism('earth',etHex(RI),G-.02,G+.03,P('earth'));
  etHexFaces((api+apo)/2,(k)=>{const front=k===1,zi=-dep/2+ET_T/2,zo=dep/2-ET_T/2;
   pushM(TF(0,0,zi,PI));etWall(RI,G,H,'brick',br,front?[{x:0,w:2.4,h:2.8,gap:true}]:[{x:-1.5,w:2.4,h:2.6,gap:true},{x:1.8,w:1.0,h:1.2,y:1.0,dark:true,head:'flat'}],{frame:brD});popM();
   pushM(TF(0,0,zo));etWall(RO,G,H,'brick',br,front?[{x:0,w:2.4,h:2.8,gap:true}]:[{x:-2,w:.8,h:.9,y:1.6,dark:true,head:'flat',shut:false},{x:2,w:.8,h:.9,y:1.6,dark:true,head:'flat',shut:false}],{frame:brD});popM();
   for(const s of [-1,1])beam('brick',[s*RI/2,G+H/2,zi],[s*RO/2,G+H/2,zo],.3,br,false,undefined,H);
   etPent((RI+RO)/2+.6,dep,G+H+.05,G+H+.9,{mk:'tile',ribs:.3,ov:.4});
   if(front)etStepHead(0,G+3.0,dep/2+.05,2.6,{mk:'brick',col:brD});
   if(k===3)FURNISH('job_plank_stack',0,G,0,0);if(k===5)FURNISH('eternian_common_bench',0,G,-dep/2+.5,0);
   if(k===2)FURNISH('generic_crate',1,G,0,0);if(k===4)FURNISH('job_bales',0,G,.2,0);});
  for(const [a,r] of [[PI/2+.2,3.2],[PI/2+2.3,3.4],[PI/2-2.0,3.3]])etBottleKiln(Math.cos(a)*r,Math.sin(a)*r,1.8,11);
  for(const [x,z] of [[-3.4,4.6],[3.2,4.4]])ellip('earth',x,G,z,1.2,.7,1.0,new THREE.Color(0x8a6a4a),0,8);   /* the clay */
  for(let i=0;i<3;i++)box('brick',4.8,G+i*.5,-1.4+i*.1,1.6-i*.3,.5,1.0,br);}});

/* the tile works: the celadon works, a hexagon of drying ranges round a glazing hall, racks of green tile drying, the
   glaze vats, a muffle kiln in the yard behind */
defBuilding({key:'et_tile_works',name:'Tile works',seed:7402,cut:true,w:24,d:28,h:14,budget:110000,
 tags:{types:['industry'],wealth:'middle',style:'common',job:'pottery'},
 note:'the celadon works: a hexagonal glazing hall under celadon, racks of green tile drying round it, the glaze vats, a muffle kiln behind',
 build(o){etTrade({plan:'hex',R:5.2,storeys:1,sh:4,mk:'brick',roof:'ogee',roofMk:'celadon',steel:true,
   furn:[['eternian_common_table',4,.6],['eternian_common_chest',3,.5],['eternian_common_bench',5,.45],['generic_storage_jar',2,.6],['generic_crate',0,.6]],
   extra:F=>{for(let i=0;i<6;i++){const a=i*PI/3+PI/6,r=9.2;pushM(TF(Math.cos(a)*r,0,Math.sin(a)*r,PI/2-a));etDryRack(0,0,3.6,'celadon',etKeyCol('celadon'));popM();}
    for(const s of [-1,1])cyl('stone',s*2.2,0,7.2,.7,.9,P('stoneD'),12),cyl('water',s*2.2,.2,7.2,.6,.7,new THREE.Color(0x6a9a82),12);
    etBottleKiln(0,-9.5,1.6,9);}});}});

/* the porcelain works: a long brick shed with the wheels, a muffle kiln and the finished ware on its shelves */
defBuilding({key:'et_porcelain',name:'Porcelain works',seed:7403,cut:true,w:16,d:10,h:12,budget:80000,
 tags:{types:['industry'],wealth:'middle',style:'common',job:'pottery'},
 note:'a brick shed of wheels and shelves of white ware, a muffle kiln at its end',
 build(o){etTrade({w:11,d:7,storeys:1,sh:3.6,mk:'brick',roof:'gable',roofMk:'tile',steel:true,doorX:-2,
   furn:[['eternian_common_table',-1,-.8,0],['eternian_common_table',2.5,-.8,0],['generic_pantry_shelf',-4.4,-3.05,0],['generic_crate',4.2,2.4,0],['eternian_common_bench',1,2.9,PI]],
   extra:F=>{pushM(TF(-1.5,0,0));etBottleKiln(7.4,0,1.4,8);popM();}});}});

/* the paper mill on a canal: the vat house, the drying loft over it with its louvres, a waterwheel on the race */
defBuilding({key:'et_paper_mill',name:'Paper mill',seed:7404,cut:true,w:16,d:13,h:12,budget:90000,
 tags:{types:['industry'],wealth:'middle',style:'common',job:'milling'},
 note:'the vat house and the louvred drying loft over it, a waterwheel on the race',
 build(o){etTrade({w:12,d:8,storeys:2,mk:'block',upMk:'lime',roof:'gable',roofMk:'tile',
   furn:[['generic_storage_jar',-4,-2.6,0],['generic_storage_jar',-3,-2.6,0],['eternian_common_table',1.5,-1,0],['job_bales',3.8,2.2,0],['eternian_common_bench',0,2.9,PI,1],['generic_crate',3.5,-2.6,0,1]],
   extra:F=>{for(let i=0;i<5;i++)box('timber',-4.4+i*2.2,F.G+F.sh+.3,4.06,1.6,F.sh-.6,.08,P('timberL'));   /* the drying loft's louvres */
    box('water',8.2,0,0,2.6,.5,12,new THREE.Color(ET_WATER));box('stone',8.2,0,0,3.2,.3,12.4,P('stoneD'));
    pushM(TF(8.2,1.9,1.0,PI/2));ring('timber',0,0,0,1.8,.12,P('timber'),0,PI/2);for(let i=0;i<10;i++){const a=i*TAU/10;box('timber',Math.sin(a)*1.6,Math.cos(a)*1.6-.3,0,.12,.6,.9,P('timber'),0,0,-a);}popM();}});}});

/* the block printer's shophouse: the shop on the street with its racks of type, the press behind, the printed sheets
   hung to dry over the yard */
defBuilding({key:'et_printer',name:'Printer',seed:7405,cut:true,w:11,d:11,h:10,budget:70000,
 tags:{types:['shop'],wealth:'middle',style:'common',job:'trading'},
 note:'a shophouse with racks of type and a press behind, printed sheets drying over the yard',
 build(o){etTrade({w:8,d:7,storeys:2,shop:true,roof:'flat',crown:true,crownMask:'terracotta',sign:[-1,3.5],
   furn:[['eternian_common_archive_shelf',-2.4,-3.05,0],['eternian_common_register_desk',1.8,-3.0,0],['eternian_common_table',.8,0,0],['generic_writing_supplies',.8,0,0],['eternian_common_bed',2,-2.3,0,1],['eternian_common_chest',-1,-3.0,0,1]],
   extra:F=>{for(let i=0;i<3;i++){box('iron',-3+i*3,0,-4.6,.08,2.4,.08,P('iron'));}box('iron',0,2.3,-4.6,6.2,.04,.04,P('iron'));
    for(let i=0;i<9;i++)box('lime',-2.8+i*.7,1.6,-4.6,.5,.7,.01,new THREE.Color(0xf0e8d6));}});}});
