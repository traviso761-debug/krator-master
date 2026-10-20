// prefix: et
// ================================================================= THE CENSUS TRADES (PLAN.md section 4, P6): the common town's
// shops and works, every one on etTrade (64-et-trade-kit.js). The shop trades come in two plans: the street's rectangle
// (v 0) and the hexagon (v 1), the Sanctum's six-fold plan in the common town (the owner, 2026-10-20); the market hall,
// the granary, the warehouse, the healer and the tea house are hexagonal outright.

/* a def's two plans: v 1 the hexagon */
const etHexV=o=>(o.v|0)===1;

/* the bakehouse: a block shop with its oven and flue, bread on the counter (the census's bakers) */
defBuilding({key:'et_bakehouse',name:'Bakehouse',seed:7410,cut:true,w:11,d:11,h:10,budget:70000,
 tags:{types:['shop'],wealth:'middle',style:'common',job:'milling'},
 note:'a block shop with a brick oven and its flue, bread on the counter; v 1 hexagonal',
 build(o){etHexV(o)?etTrade({plan:'hex',R:4.4,shop:true,roof:'pyramid',chimney:[0,-2.4],
   furn:[['eternian_poor_hearth',4,.4],['generic_bread_basket',5,.5],['generic_sack',3,.5],['generic_meal_ark',0,.5],['eternian_common_table',2,.6]]}):
  etTrade({w:9,d:7,storeys:1,shop:true,roof:'gable',chimney:[3,-2.4],sign:[-1,3.5],
   furn:[['eternian_poor_hearth',3,-2.9,0],['generic_bread_basket',-1,2.6,0],['generic_sack',-3.5,-2.8,0],['generic_meal_ark',.5,-2.8,0],['eternian_common_table',-1,0,0]]});}});

/* the butcher: a cool tiled shop, the cuts hung on a rail over the block (the census's butchers) */
defBuilding({key:'et_butcher',name:'Butcher',seed:7411,cut:true,w:10,d:9,h:8,budget:60000,
 tags:{types:['shop'],wealth:'middle',style:'common',job:'trading'},
 note:'a tiled shop, the cuts hung on a rail over the block, a cold store behind',
 build(o){etTrade({w:8,d:6,shop:true,roof:'pent',sign:[-1,3],
  furn:[['generic_cured_meat',-1,-2.4,0],['generic_hanging_larder',2.6,-2.5,0],['eternian_common_table',-1,0,0],['generic_crate',3,1.8,0],['generic_storage_jar',-3.3,-2.5,0]],
  extra:F=>{box('iron',-1,F.G+2.4,-1.2,4.4,.05,.05,P('iron'));for(let i=0;i<5;i++)box('terracotta',-2.8+i*.9,F.G+1.7,-1.2,.25,.6,.18,new THREE.Color(0x8a3a2c));}});}});

/* the weaver: the loom shed where the circuit-maze brocade is woven; the dyed hanks over the yard (weavers and dyers) */
defBuilding({key:'et_weaver',name:'Weaver',seed:7412,cut:true,w:12,d:12,h:10,budget:80000,
 tags:{types:['industry'],wealth:'middle',style:'common',job:'weaving'},
 note:'the loom shed with its north lights where the circuit-maze brocade is woven, dyed hanks drying over the yard; v 1 hexagonal',
 build(o){const hanks=x=>{for(let i=0;i<7;i++)box('lime',x-1.8+i*.6,1.2,-5,.4,1.2,.05,new THREE.Color([0x3f8a5a,0x141416,0xd8b24a,0x8fb8a0][i%4]));box('timber',x,2.4,-5,4.6,.08,.08,P('timber'));for(const s of [-1,1])box('timber',x+s*2.3,0,-5,.1,2.5,.1,P('timber'));};
  etHexV(o)?etTrade({plan:'hex',R:4.8,roof:'ogee',roofMk:'tile',furn:[['eternian_common_table',4,.6],['job_bales',3,.5],['eternian_common_bench',5,.45],['generic_sewing',2,.6],['eternian_common_chest',0,.5]],extra:F=>hanks(0)}):
  etTrade({w:10,d:7,roof:'gable',steel:true,furn:[['eternian_common_table',-2.5,-.5,0],['eternian_common_table',2,-.5,0],['job_bales',-3.6,-2.6,0],['generic_sewing',2,-.5,0],['eternian_common_bench',0,2.85,PI]],extra:F=>hanks(0)});}});

/* the brewhouse: the mash tun and the vats under a vented roof, barrels in the yard (brewers) */
defBuilding({key:'et_brewhouse',name:'Brewhouse',seed:7413,cut:true,w:12,d:11,h:11,budget:80000,
 tags:{types:['industry'],wealth:'middle',style:'common',job:'brewing'},
 note:'the mash tun and vats under a vented roof, barrels stacked in the yard; v 1 hexagonal',
 build(o){const vats=r=>{for(const [x,z] of [[-r,-1],[r,-1]]){cyl('timber',x,.35,z,1.0,1.6,P('timber'),14);cyl('bronze',x,1.95,z,1.05,.12,P('bronze'),14);}};
  etHexV(o)?etTrade({plan:'hex',R:5,roof:'pyramid',chimney:[0,-2.6],furn:[['generic_barrel',4,.6],['generic_barrel',3,.6],['generic_ale',5,.5],['generic_sack',2,.5]],extra:F=>vats(1.4)}):
  etTrade({w:10,d:7,roof:'gable',chimney:[3.5,-2.4],furn:[['generic_barrel',-4,2.4,0],['generic_barrel',-3.2,2.4,0],['generic_ale',3.8,2.4,0],['generic_sack',.5,-2.8,0]],extra:F=>vats(2)});}});

/* the tannery: an open shed over the pits, the hides stretched on frames, downwind of the town (tanners) */
defBuilding({key:'et_tannery',name:'Tannery',seed:7414,w:14,d:12,h:6,budget:50000,front:{x:0,z:6,yaw:0},
 tags:{types:['industry'],wealth:'poor',style:'poor',job:'tanning'},
 note:'an open shed on posts over six pits, hides stretched on frames, a block store',
 build(o){box('earth',0,0,0,13,.1,11,P('earth'));
  for(let i=0;i<6;i++){const x=-4.5+(i%3)*4.5,z=(i<3?-2:2);etBasin(x,0,z,2.6,2.6,.4,null,i%2?0x5a4a2a:0x3a3a2a);}
  for(const x of [-6,0,6])for(const z of [-4,4])box('timber',x,0,z,.2,3.2,.2,P('timber'));
  pushM(TF(0,0,0));etPent(12.4,8.4,3.2,3.9,{mk:'reed',col:P('reed'),ov:.4});popM();
  for(let i=0;i<3;i++){const x=-4+i*4;box('timber',x,0,5.2,.1,2.2,.1,P('timber'));box('timber',x+1.4,0,5.2,.1,2.2,.1,P('timber'));box('lime',x+.7,.6,5.2,1.2,1.4,.04,new THREE.Color(0x9a7a5a));}
  pushM(TF(-5,0,-4.8));etTrade({w:3.4,d:2.2,G:.2,mk:'block',roof:'flat',mask:'lead',poor:true});popM();}});

/* the smithy: a brick forge with its hearth glowing, a tall flue, the anvil under an open side (smiths and craftsmen) */
defBuilding({key:'et_smithy',name:'Smithy',seed:7415,cut:true,w:11,d:10,h:10,budget:70000,
 tags:{types:['industry'],wealth:'middle',style:'common',job:'smithing'},
 note:'a brick forge, the hearth glowing under a tall flue, the anvil at the open front; v 1 hexagonal',
 build(o){const forge=(x,z)=>{box('brick',x,0,z,1.6,.9,1.2,P('brick'));box('glow',x,.9,z,.9,.06,.6,new THREE.Color(0xd9762c));box('iron',x+1.6,0,z+1.2,.5,.7,.3,P('iron'));};
  etHexV(o)?etTrade({plan:'hex',R:4.4,mk:'brick',shop:true,roof:'pyramid',chimney:[0,-2.4],furn:[['generic_crate',4,.5],['eternian_common_chest',3,.5],['eternian_common_bench',5,.45],['job_pole_rack',2,.5]],extra:F=>forge(0,-1.4)}):
  etTrade({w:8,d:7,mk:'brick',shop:true,roof:'gable',chimney:[2.6,-2.4],furn:[['generic_crate',-3.2,-2.6,0],['eternian_common_chest',.2,-2.9,0],['eternian_common_bench',-3.4,1.2,PI/2],['job_pole_rack',3.3,1,-PI/2]],extra:F=>forge(2.2,-1.5)});}});

/* the shophouse: the shop below, the family above, the sign out on its bracket (shopkeepers and assistants) */
defBuilding({key:'et_shophouse',name:'Shophouse',seed:7416,cut:true,w:10,d:10,h:10,budget:70000,
 tags:{types:['shop','dwelling-single'],wealth:'middle',style:'common',job:'trading'},
 note:'a shop below and the family above, the counter on the street, the sign on its bracket; v 1 hexagonal',
 build(o){etHexV(o)?etTrade({plan:'hex',R:4.4,storeys:2,shop:true,roof:'pyramid',
   furn:[['generic_crate',4,.5],['eternian_common_register_desk',3,.5],['generic_sack',5,.5],['eternian_common_bed',4,.4,1],['eternian_common_mask_shelf',2,.3,1]]}):
  etTrade({w:8,d:7,storeys:2,shop:true,roof:'flat',crown:true,crownMask:'terracotta',sign:[-1,3.5],
   furn:[['generic_crate',-3,-2.6,0],['eternian_common_register_desk',1.6,-3,0],['generic_sack',2.8,1.6,0],['eternian_common_bed',2,-2.3,0,1],['eternian_common_mask_shelf',-2.4,-3.2,0,1]]});}});

/* the tea house: a hexagonal pavilion of lime and celadon on the canal, its terrace on the water (innkeepers and servers) */
defBuilding({key:'et_tea_house',name:'Tea house',seed:7417,cut:true,w:14,d:14,h:9,budget:70000,
 tags:{types:['tavern'],wealth:'middle',style:'common',job:'trading'},
 note:'a hexagonal pavilion of lime under celadon, a timber terrace over the water, the tea served at low tables',
 build(o){box('water',0,0,4.5,13,.3,4.5,new THREE.Color(ET_WATER));
  etTrade({plan:'hex',R:4.6,mk:'lime',roof:'ogee',roofMk:'celadon',
   furn:[['eternian_common_table',0,1.4],['eternian_common_table',4,1.4],['eternian_common_bench',3,.45],['generic_tea_set',2,.6],['eternian_poor_hearth',5,.4]],
   extra:F=>{box('timber',0,.6,5.4,10,.2,3.2,P('timberL'));for(const x of [-4.6,0,4.6])box('timber',x,0,6.8,.2,.6,.2,P('timber'));
    box('timber',0,1.4,6.95,10,.06,.08,P('timber'));for(let i=0;i<3;i++)box('lime',-3+i*3,.8,5.6,.8,.4,.8,P('timber'));}});}});

/* the inn: the caravan court where the Inner Wall's caravans end, stalls round a yard, the rooms over the gate
   (innkeepers and grooms) */
defBuilding({key:'et_inn',name:'Caravan inn',seed:7418,cut:true,w:22,d:20,h:15,budget:120000,
 tags:{types:['inn'],wealth:'middle',style:'common',job:'trading'},
 note:'a caravan court: stalls round a yard, the hall and the rooms over the gate, the trough and the well; v 1 hexagonal',
 build(o){const hx=etHexV(o);
  if(hx){etTrade({plan:'hex',R:6.4,storeys:2,roof:'ogee',roofMk:'tile',furn:[['eternian_common_table',4,1.5],['eternian_common_bench',3,.45],['generic_ale',5,.5],['eternian_common_bed',2,.6,1],['eternian_common_bed',0,.6,1],['eternian_poor_hearth',4,.4,1]]});
   for(let i=0;i<6;i++){const a=i*PI/3+PI/6;if(i===1)continue;pushM(TF(Math.cos(a)*9,0,Math.sin(a)*9,PI/2-a));box('timber',0,0,0,4.5,.05,2.4,P('earth'));etPent(4.6,2.4,2.6,3.0,{mk:'reed',col:P('reed'),ov:.2});for(const x of [-2.2,2.2])box('timber',x,0,1.1,.15,2.6,.15,P('timber'));popM();}}
  else{pushM(TF(0,0,-5.5));etTrade({w:16,d:7,storeys:2,roof:'gable',roofMk:'tile',furn:[['eternian_common_table',-3,0,0],['eternian_common_table',2,0,0],['eternian_common_bench',-3,1.2,PI],['generic_ale',6,-2.7,0],['eternian_common_bed',-5,-2.3,0,1],['eternian_common_bed',3,-2.3,0,1],['eternian_poor_hearth',6,-2.9,0]]});popM();
   for(const s of [-1,1]){pushM(TF(s*9,0,3,s*PI/2));box('earth',0,0,0,12,.05,3.4,P('earth'));etPent(12,3.4,2.8,3.3,{mk:'reed',col:P('reed'),ov:.2});for(let i=0;i<4;i++)box('timber',-4.5+i*3,0,1.6,.15,2.8,.15,P('timber'));popM();}
   box('block',0,0,9.6,20,2.4,.4,P('block'));box('earth',0,0,3,16,.03,12,P('earth'));
   cyl('stone',3,0,3,.9,.8,P('stoneD'),12);box('stone',-3,0,3,2.4,.6,.8,P('stoneD'));}}});

/* the healer: a hexagonal house of healing round its herb court, the beds in the wards (healers and nurses) */
defBuilding({key:'et_healer',name:'House of healing',seed:7419,cut:true,w:14,d:14,h:10,budget:80000,
 tags:{types:['civic'],wealth:'middle',style:'common',job:'trading'},
 note:'a hexagonal house of healing under grey tile, beds in its wards, medicines on the shelves, herbs drying',
 build(o){etTrade({plan:'hex',R:6,roof:'pyramid',steel:true,
  furn:[['eternian_common_bed',2,.4],['eternian_common_bed',3,.4],['eternian_common_bed',4,.4],['generic_medicine',5,.4],['generic_herb_bundles',0,.4],['eternian_common_table',5,1.6]],
  extra:F=>{for(let i=0;i<4;i++)box('reed',-1.2+i*.8,2.6,-.5,.3,.6,.3,new THREE.Color(0x6a8a4a));}});}});

/* the market hall: a great hexagon of lancets on a canal basin, the stalls inside under its celadon ogee (market traders) */
defBuilding({key:'et_market_hall',name:'Market hall',seed:7420,cut:true,w:26,d:26,h:22,budget:140000,
 tags:{types:['market'],wealth:'middle',style:'ministry',job:'trading'},
 note:'a hexagonal hall of pale brick and lancets under a celadon ogee, stalls inside, the basin at its foot',
 build(o){etTrade({plan:'hex',R:10,storeys:2,sh:4.5,mk:'brick',upMk:'brick',roof:'ogee',roofMk:'celadon',steel:true,
  furn:[['generic_veg_basket',0,2],['generic_produce',2,2.2],['generic_fish',3,2],['generic_bread_basket',4,2.2],['generic_crate',5,2],['generic_spice_box',0,3.4],['eternian_common_table',2,3.6],['eternian_common_table',4,3.6]],
  extra:F=>{etHexFaces(F.ap,(k)=>{etLancet(0,F.G+F.sh+.6,ET_T/2+.01,1.2,3.4,{light:'glass'});etMazeBand(0,F.G+F.H-.8,ET_T/2+.02,F.R-.6,.6);});
   box('water',0,0,F.ap+4.5,14,.3,5,new THREE.Color(ET_WATER));}});}});

/* the granary: a hexagonal brick store on a raised floor, the sacks on its boards, the miller's watermill hard by
   (granary keepers and millers) */
defBuilding({key:'et_granary',name:'Granary',seed:7421,cut:true,w:15,d:15,h:14,budget:80000,
 tags:{types:['farm'],wealth:'middle',style:'common',job:'milling'},
 note:'a hexagonal brick granary on a raised floor under a grey-tiled cap, sacks within; a watermill on the race beside',
 build(o){etTrade({plan:'hex',R:5,storeys:2,sh:3.6,G:1.2,mk:'brick',upMk:'brick',roof:'pyramid',mask:'lead',
  furn:[['generic_sack',2,.5],['generic_sack',3,.5],['job_bales',4,.6],['generic_floor_basket',5,.5],['generic_sack',2,.5,1],['generic_sack',4,.5,1]],
  extra:F=>{for(let i=0;i<3;i++)box('stone',0,i*.4,F.ap+.8+i*.35,1.6,.4,.4,P('stoneD'));
   box('water',7.2,0,0,1.6,.4,10,new THREE.Color(ET_WATER));pushM(TF(6.2,1.6,0,PI/2));ring('timber',0,0,0,1.5,.1,P('timber'),0,PI/2);popM();}});}});

/* the warehouse: a hexagonal store of pale brick with round windows (arch-34) on its canal, the crane on its quay
   (porters and warehousemen) */
defBuilding({key:'et_warehouse',name:'Warehouse',seed:7422,cut:true,w:20,d:22,h:18,budget:110000,
 tags:{types:['industry'],wealth:'middle',style:'common',job:'warehousing'},
 note:'a hexagonal warehouse of pale brick, three storeys with round windows, a hoist over its loading door, the crane on its quay',
 build(o){etTrade({plan:'hex',R:7.5,storeys:3,sh:3.6,mk:'brick',upMk:'brick',roof:'pyramid',mask:'lead',
  furn:[['generic_crate',0,.6],['generic_crate',2,.6],['job_bales',3,.6],['generic_barrel',4,.6],['generic_sack',5,.6],['generic_crate',3,.6,1],['job_bales',0,.6,2]],
  extra:F=>{etHexFaces(F.ap,(k)=>{for(let s=1;s<3;s++)etOculus(0,F.G+s*F.sh+1.6,ET_T/2+.02,.7,{col:new THREE.Color(P('brick')).multiplyScalar(.8),mk:'brick'});});
   pushM(TF(0,0,F.ap));box('timber',0,F.G+F.H-.6,1.2,.2,.2,2.4,P('timber'));box('iron',0,F.G+F.H-2.4,2.3,.03,1.8,.03,P('iron'));popM();
   box('stone',0,0,F.ap+3.4,14,.9,4,P('stoneD'));box('water',0,0,F.ap+7.2,15,.3,3.6,new THREE.Color(ET_WATER));
   pushM(TF(5,.9,F.ap+3.6));box('timber',0,0,0,.4,5,.4,P('timber'));beam('timber',[0,4.8,0],[0,4.2,3],.25,P('timber'));popM();}});}});

/* the mushroom cellar: a half-sunk vault of cast block, its beds of dark-grown fungus by lamplight (mushroom growers:
   a works, not a climate) */
defBuilding({key:'et_mushroom_cellar',name:'Mushroom cellar',seed:7423,cut:true,w:11,d:9,h:5,budget:50000,
 tags:{types:['farm'],wealth:'poor',style:'poor',job:'farming'},
 note:'a half-sunk vault of cast block, beds of dark-grown fungus by lamplight, a stair down',
 build(o){box('earth',0,0,0,10.4,1.4,8.4,P('earth'));
  etTrade({w:9,d:7,G:.1,mk:'block',roof:'flat',mask:'lead',poor:true,sh:3,
   furn:[['generic_mushrooms',-2.6,-2.6,0],['generic_mushrooms',0,-2.6,0],['generic_floor_basket',2.6,-2.6,0],['eternian_poor_block_bench',2.5,2.6,PI],['generic_lamp_oil',-3.4,2.4,0]],
   extra:F=>{for(const z of [-1.2,.6])box('earth',0,F.G,z,6.4,.5,.9,new THREE.Color(0x3a2e24));}});}});
