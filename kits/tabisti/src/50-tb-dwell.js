// prefix: tb
/* ================================================================= URBAN TABISTI — ROW 1: ALL URBAN DWELLINGS (10401..10411)
   Covers all 6 residential matrix cells (poor | middle | rich) x (dwelling-single | dwelling-multi) plus household service:
   10401. tb_breeze_cot         — poor,   dwelling-single: Single-Storey Claustra Breeze Cottage
   10402. tb_loggia_row         — poor,   dwelling-single: Two-Storey Artisan Recessed-Loggia Row House
   10403. tb_tenement_court     — poor,   dwelling-multi:  Shared-Court Ustun Gallery Tenement
   10404. tb_servant_quarters   — poor,   dwelling-multi:  Colonnaded Household Service & Breeze-Kitchen Wing
   10405. tb_tahawst_mid        — middle, dwelling-single: Courtyard Tahawst with Shadirvan & Ustun Ayvan
   10406. tb_capricho_villa     — middle, dwelling-single: El Capricho Banded-Brick & Wind-Tower Villa
   10407. tb_oriel_townhouse    — middle, dwelling-single: Secessionist Verdigris-Oriel Merchant Townhouse
   10408. tb_shop_house         — middle, dwelling-multi:  Arcaded Souq Shophouse & Claustra Sleeping Loft
   10409. tb_lac_merchant_bayt  — rich,   dwelling-single: Liikofi Abyss-Lac & Escata-Spire Patrician Bayt
   10410. tb_secession_palazzo  — rich,   dwelling-multi:  Raichle Double-Loggia Multi-Partner Palazzo
   10411. tb_mirador_estate     — rich,   dwelling-single: Verdigris-Column & Solar-Mirador Lakefront Villa */

/* 1. Single-Storey Claustra Breeze Cottage (poor, dwelling-single) */
defBuilding({
 key:'tb_breeze_cot',
 name:'Single-Storey Claustra Breeze Cottage',
 seed:10401,w:14,d:16,h:10.5,budget:65000,cut:true,
 front:{x:0,z:7.1,yaw:0},
 tags:{style:'urban',wealth:'poor',types:['dwelling-single'],role:'cottage'},
 build(){
  const y1=.46,h1=3.5,yRoof=y1+h1;
  tbPorticoPlinth(10.8,11.6,y1,{stepW:2.4,stepRun:1.1});

  /* Shaded front ustun breeze-porch [z = 2.6..5.4] + perforated brick claustra cheek */
  tbUstunAyvan(0,4.0,10.2,2.6,y1,h1,{n:4,skipMid:1.4,ganchBack:false});
  tbClaustraScreen(-5.1,2.7,-5.1,5.3,y1,1.35,{block:false});

  /* Main buff/rose banded brick cottage room [-5.1..5.1, -5.4..2.6] */
  tbWallRing(-5.1,-5.4,5.1,2.6,y1,h1,{
   register:'banded',
   holes:{
    s:[{at:0,w:1.45,h:2.2,door:true,name:'cot-front-door'},{at:3.0,w:1.15,h:1.25,y:1.0}],
    n:[{at:0,w:1.2,h:1.25,y:1.0}],
    e:[{at:-1.4,w:1.2,h:1.25,y:1.0}],
    w:[{at:-1.4,w:1.2,h:1.25,y:1.0}]
   }
  });
  tbZsolnayRoof(0,yRoof,-1.4,10.6,8.4,{mk:'escata',mode:'hip',over:.62,spire:true,lanternR:1.15,lanternH:2.8});

  tbTarget(0,y1,4.0,'cot-breeze-porch',true);
  tbTarget(0,y1,-1.4,'cot-living-room',true);

  tbFurnList([
   ['tb_ustun_daybed',-2.8,y1,-3.4,0],
   ['tb_tea_samovar_low',1.8,y1,-1.8,0],
   ['tb_ganch_screen_bench',1.8,y1,-3.6,0],
   ['tb_zeer_cold_rack',3.4,y1,.8,PI],
   ['tb_brass_lantern_stand',-3.4,y1,4.0,0]
  ]);
 }
});

/* 2. Two-Storey Artisan Recessed-Loggia Row House (poor, dwelling-single) */
defBuilding({
 key:'tb_loggia_row',
 name:'Two-Storey Artisan Recessed-Loggia Row House',
 seed:10402,w:14,d:18,h:14.2,budget:76000,cut:true,
 front:{x:0,z:8.0,yaw:0},
 tags:{style:'urban',wealth:'poor',types:['dwelling-single'],role:'rowhouse'},
 build(){
  const y1=.48,h1=3.55,y2=y1+h1,h2=3.25,yRoof=y2+h2;
  tbPorticoPlinth(10.6,13.4,y1,{stepW:2.6,stepRun:1.15});

  /* Recessed B2 ground entry loggia [z = 3.8..6.2] */
  tbRecessedLoggia(0,y1,5.0,0,4.2,h1,2.2,{});
  for(const sx of [-3.9,3.9]){
   tbWall(sx<0?-5.0:2.8,6.1,sx<0?-2.8:5.0,6.1,y1,h1,{register:'secession'});
  }

  /* Ground workshop/living room [-5.0..5.0, -6.2..3.8] */
  tbWallRing(-5.0,-6.2,5.0,3.8,y1,h1,{
   register:'secession',
   holes:{
    s:[{at:0,w:1.5,h:2.25,door:true,name:'row-front-door'}],
    n:[{at:-2.2,w:1.2,h:1.3,y:1.0},{at:2.2,w:1.2,h:1.3,y:1.0}],
    e:[{at:-1.2,w:1.2,h:1.3,y:1.0}]
   }
  });

  const st=tbInteriorStair(3.1,-3.6,y1,y2,0,{w:1.12});
  tbFloorSlab(0,y2,0,10.2,12.4,{mk:'floor',th:.18,hole:st});
  tbKundalCeiling(-1.2,y2-.28,-1.2,7.2,9.2,{mk:'kundal'});
  tbParapet(-4.8,6.05,4.8,6.05,y2,{kind:'iron'});

  /* Upper sleeping room [-4.8..4.8, -6.0..3.6] + open front ustun breeze-balcony [z = 3.6..6.2] */
  tbUstunAyvan(0,4.9,9.6,2.4,y2,h2,{n:4,ganchBack:true,eaveCap:true});
  tbWallRing(-4.8,-6.0,4.8,3.6,y2,h2,{
   register:'banded',
   holes:{
    s:[{at:0,w:1.45,h:2.2,door:true,name:'row-balcony-door'},{at:-2.8,w:1.25,h:1.35,y:.95}],
    n:[{at:0,w:1.35,h:1.35,y:.95}]
   }
  });
  tbZsolnayRoof(0,yRoof,-1.2,10.0,10.0,{mode:'gable',gableAxis:'z',over:.64});

  tbTarget(0,y1,5.0,'row-entry-loggia',true);
  tbTarget(-1.2,y1,-1.2,'row-ground-room',true);
  tbTarget(-1.2,y2,-1.2,'row-upper-bedroom',true);
  tbTarget(0,y2,4.9,'row-upper-ayvan',true);

  tbFurnList([
   ['tb_trencadis_table',-1.6,y1,-1.4,0],
   ['tb_ganch_screen_bench',-1.6,y1,-3.4,0],
   ['tb_zeer_cold_rack',-3.2,y1,1.8,0],
   ['tb_ustun_daybed',-2.4,y2,-3.6,0],
   ['tb_tea_samovar_low',-1.2,y2,4.8,0]
  ]);
 }
});

/* 3. Shared-Court Ustun Gallery Tenement (poor, dwelling-multi) */
defBuilding({
 key:'tb_tenement_court',
 name:'Shared-Court Ustun Gallery Tenement',
 seed:10403,w:22,d:20,h:15.8,budget:98000,cut:true,
 front:{x:0,z:9.0,yaw:0},
 tags:{style:'urban',wealth:'poor',types:['dwelling-multi'],role:'tenement'},
 build(){
  const y1=.5,h1=3.6,y2=y1+h1,h2=3.3,yRoof=y2+h2;
  tbPorticoPlinth(18.4,15.6,y1,{stepW:3.0,stepRun:1.2});

  /* Open ground street breezeway portal + shared evaporative courtyard [z = 1.8..7.2] */
  tbRecessedLoggia(0,y1,6.4,0,3.8,h1,2.0,{});
  for(const s of [-1,1]){
   tbClaustraScreen(s<0?-8.8:2.4,7.3,s<0?-2.4:8.8,7.3,y1,2.45,{});
  }
  tbShadirvanPool(-4.8,4.6,3.4,2.4,y1+.28,.42,{jet:true});

  /* Ground shaded ustun gallery [z = 0.2..2.4] + 3 apartment suites [-8.8..8.8, -7.4..0.2] */
  tbUstunAyvan(0,1.3,17.2,2.2,y1,h1,{n:6,skipMid:1.6,ganchBack:true});
  tbWallRing(-8.8,-7.4,8.8,.2,y1,h1,{
   register:'banded',
   holes:{
    s:[
     {at:-5.4,w:1.4,h:2.2,door:true,name:'tenement-apt-1'},
     {at:0,w:1.5,h:2.25,door:true,name:'tenement-apt-2'},
     {at:5.4,w:1.4,h:2.2,door:true,name:'tenement-apt-3'}
    ],
    n:[{at:-5.2,w:1.25,h:1.3,y:1.0},{at:0,w:1.25,h:1.3,y:1.0},{at:5.2,w:1.25,h:1.3,y:1.0}]
   }
  });

  const st=tbInteriorStair(5.8,-3.6,y1,y2,-PI/2,{w:1.18});
  tbFloorSlab(0,y2,-2.5,17.8,9.8,{mk:'floor',th:.18,hole:st});
  tbKundalCeiling(-4.2,y2-.28,-3.6,8.0,7.0,{mk:'kundal'});
  tbParapet(-8.6,2.25,8.6,2.25,y2,{kind:'iron'});

  /* Upper gallery [z = 0.2..2.4] + upper apartment block [-8.6..8.6, -7.2..0.2] */
  tbUstunAyvan(0,1.3,17.0,2.2,y2,h2,{n:6,eaveCap:true});
  tbWallRing(-8.6,-7.2,8.6,.2,y2,h2,{
   register:'secession',
   holes:{
    s:[
     {at:-5.2,w:1.35,h:2.15,door:true,name:'tenement-up-1'},
     {at:0,w:1.4,h:2.15,door:true,name:'tenement-up-2'},
     {at:5.2,w:1.35,h:1.35,y:.95}
    ],
    n:[{at:-4.8,w:1.35,h:1.35,y:.95},{at:4.8,w:1.35,h:1.35,y:.95}]
   }
  });
  tbZsolnayRoof(0,yRoof,-3.5,17.6,7.8,{mode:'hip',over:.68,lantern:true,lanternR:1.65,lanternH:3.5});

  tbTarget(2.8,y1,4.6,'tenement-breeze-court',false);
  tbTarget(-4.2,y1,-3.6,'tenement-ground-suites',true);
  tbTarget(-4.2,y2,-3.6,'tenement-upper-suites',true);

  tbFurnList([
   ['tb_ustun_daybed',-6.2,y1,-4.8,0],
   ['tb_trencadis_table',-2.4,y1,-3.8,0],
   ['tb_zeer_cold_rack',-2.4,y1,-6.0,0],
   ['tb_ustun_daybed',-5.8,y2,-4.8,0],
   ['tb_tea_samovar_low',-2.4,y2,-3.8,0],
   ['tb_brass_lantern_stand',2.8,y1,4.8,0]
  ]);
 }
});

/* 4. Colonnaded Household Service & Breeze-Kitchen Wing (poor, dwelling-multi + household service) */
defBuilding({
 key:'tb_servant_quarters',
 name:'Colonnaded Household Service and Breeze-Kitchen Wing',
 seed:10404,w:18,d:16,h:12.6,budget:74000,cut:true,
 front:{x:0,z:7.1,yaw:0},
 tags:{style:'urban',wealth:'poor',types:['dwelling-multi'],role:'servants',job:'baking'},
 build(){
  const y1=.46,h1=3.6,yRoof=y1+h1;
  tbPorticoPlinth(14.6,11.6,y1,{stepW:2.8,stepRun:1.1});

  /* Full-width ustun service colonnade [z = 2.4..5.4] + east solar kitchen-flue wind-tower */
  tbUstunAyvan(-1.6,3.9,11.0,2.8,y1,h1,{n:4,ganchBack:true});
  tbWindTower(5.4,3.8,1.25,y1,7.6,{pedH:2.2,block:true});

  /* Service dormitories & breeze-kitchen [-6.8..3.8, -5.4..2.4] */
  tbWallRing(-6.8,-5.4,3.8,2.4,y1,h1,{
   register:'banded',
   holes:{
    s:[
     {at:-3.8,w:1.4,h:2.2,door:true,name:'servant-dorm-door'},
     {at:1.2,w:1.45,h:2.2,door:true,name:'servant-kitchen-door'}
    ],
    n:[{at:-3.6,w:1.25,h:1.3,y:1.0},{at:1.2,w:1.25,h:1.3,y:1.0}],
    w:[{at:-1.5,w:1.25,h:1.3,y:1.0}]
   }
  });
  tbClaustraScreen(3.9,-5.0,6.6,-5.0,y1,2.4,{});
  tbZsolnayRoof(-1.5,yRoof,-1.5,11.0,8.2,{mode:'hip',over:.64,lantern:true,lanternR:1.25,lanternH:2.8});

  tbTarget(-1.6,y1,3.9,'servant-veranda',true);
  tbTarget(-1.5,y1,-1.5,'servant-quarters-hall',true);

  tbFurnList([
   ['tb_tannur_oven',2.0,y1,-3.4,0],
   ['tb_zeer_cold_rack',2.0,y1,-.4,PI/2],
   ['tb_ustun_daybed',-4.6,y1,-3.4,0],
   ['tb_ustun_daybed',-4.6,y1,-.4,0],
   ['tb_trencadis_table',-1.4,y1,3.8,0]
  ]);
 }
});

/* 5. Courtyard Tahawst with Shadirvan & Ustun Ayvan (middle, dwelling-single) */
defBuilding({
 key:'tb_tahawst_mid',
 name:'Courtyard Tahawst with Shadirvan and Ustun Ayvan',
 seed:10405,w:22,d:22,h:15.6,budget:98000,cut:true,
 front:{x:0,z:9.8,yaw:0},
 tags:{style:'urban',wealth:'middle',types:['dwelling-single'],role:'tahawst'},
 build(){
  const y1=.52,h1=3.75,y2=y1+h1,h2=3.35,yRoof=y2+h2;
  tbPorticoPlinth(18.4,17.2,y1,{stepW:3.0,stepRun:1.25});

  /* Curvilinear B2 street portal + claustra courtyard walls [z = 1.6..8.2] */
  tbKashiDoor(0,y1,8.1,0,1.95,2.45,{pishtaq:true,name:'tahawst-gate'});
  for(const s of [-1,1]){
   tbWall(s<0?-8.8:1.4,8.1,s<0?-1.4:8.8,8.1,y1,2.6,{register:'secession'});
   tbClaustraScreen(s*8.8,1.8,s*8.8,7.9,y1,2.6,{});
  }
  tbShadirvanPool(-4.4,5.0,3.8,2.8,y1+.3,.46,{jet:true});

  /* Deep ustun veranda [z = -0.8..1.8] + 2-storey tahawst hall [-8.8..8.8, -8.2..-0.8] */
  tbUstunAyvan(0,.5,17.0,2.5,y1,h1,{n:6,skipMid:1.6,ganchBack:true});
  tbWallRing(-8.8,-8.2,8.8,-.8,y1,h1,{
   register:'hazarbaf',
   holes:{
    s:[
     {at:-4.8,w:1.45,h:2.25,door:true,name:'tahawst-west-door'},
     {at:0,w:1.75,h:2.35,door:true,name:'tahawst-hall-door'},
     {at:4.8,w:1.45,h:2.25,door:true,name:'tahawst-east-door'}
    ],
    n:[{at:-4.6,w:1.3,h:1.35,y:1.05},{at:4.6,w:1.3,h:1.35,y:1.05}]
   }
  });

  const st=tbInteriorStair(5.8,-4.5,y1,y2,-PI/2,{w:1.18});
  tbFloorSlab(0,y2,-4.5,17.2,7.2,{mk:'floor',th:.18,hole:st});
  tbKundalCeiling(-4.2,y2-.28,-4.5,8.0,6.6,{mk:'kundal'});

  tbWallRing(-8.6,-8.0,8.6,-1.0,y2,h2,{
   register:'secession',
   holes:{
    s:[{at:-5.0,w:1.45,h:1.45,y:.95},{at:0,w:1.6,h:1.5,y:.95},{at:5.0,w:1.45,h:1.45,y:.95}],
    n:[{at:-4.2,w:1.35,h:1.35,y:.95},{at:4.2,w:1.35,h:1.35,y:.95}]
   }
  });
  tbZsolnayRoof(0,yRoof,-4.5,17.6,7.6,{mk:'escata',mode:'hip',over:.7,dormer:true,lantern:true,lanternR:1.55,lanternH:3.4});

  tbTarget(2.6,y1,5.0,'tahawst-shadirvan-court',false);
  tbTarget(0,y1,.5,'tahawst-ustun-ayvan',true);
  tbTarget(-4.2,y1,-4.5,'tahawst-reception-hall',true);
  tbTarget(-4.2,y2,-4.5,'tahawst-upper-suite',true);

  tbFurnList([
   ['tb_kundal_divan',-4.2,y1,-6.0,0],
   ['tb_tea_samovar_low',-4.2,y1,-3.8,0],
   ['tb_ganch_screen_bench',-7.0,y1,-4.5,PI/2],
   ['tb_ustun_daybed',-5.4,y2,-5.8,0],
   ['tb_syndic_ledger_desk',-2.2,y2,-6.0,0],
   ['tb_brass_lantern_stand',2.8,y1,5.2,0]
  ]);
 }
});

/* 6. El Capricho Banded-Brick & Wind-Tower Villa (middle, dwelling-single — Plate B5) */
defBuilding({
 key:'tb_capricho_villa',
 name:'El Capricho Banded-Brick and Wind-Tower Villa',
 seed:10406,w:22,d:20,h:18.8,budget:104000,cut:true,
 front:{x:-2.2,z:9.0,yaw:0},
 tags:{style:'urban',wealth:'middle',types:['dwelling-single'],role:'villa'},
 build(){
  const y1=.54,h1=3.8,y2=y1+h1,h2=3.3,yRoof=y2+h2;
  tbPorticoPlinth(18.2,15.4,y1,{stepX:-2.2,stepW:3.0,stepRun:1.25});

  /* Signature Plate B5 SW 4-column breezy portico (-5.4, 4.4) + SE cylindrical glazed solar wind-tower (5.8, 4.4)! */
  tbCornerPortico(-5.4,4.4,5.6,4.8,y1,h1,{verdigris:false});
  tbWindTower(5.8,4.4,1.85,y1,14.8,{hollow:true,pedH:3.8,doorName:'capricho-tower-door'});

  /* Banded buff/rose brick & kashi relief-tile villa body [-8.4..3.6, -7.0..1.8] */
  tbWallRing(-8.4,-7.0,3.6,1.8,y1,h1,{
   register:'banded',
   holes:{
    s:[{at:-4.8,w:1.65,h:2.3,door:true,name:'capricho-main-door'},{at:.4,w:1.35,h:1.35,y:1.0}],
    e:[{at:-2.6,w:1.4,h:2.2,door:true,name:'capricho-east-door'}],
    n:[{at:-4.8,w:1.3,h:1.35,y:1.0},{at:.4,w:1.3,h:1.35,y:1.0}],
    w:[{at:-2.6,w:1.3,h:1.35,y:1.0}]
   }
  });

  const st=tbInteriorStair(.8,-2.6,y1,y2,-PI/2,{w:1.15});
  tbFloorSlab(-2.4,y2,-2.6,11.8,8.6,{mk:'floor',th:.18,hole:st});
  tbKundalCeiling(-5.8,y2-.28,-2.6,4.4,8.0,{mk:'kundal'});

  tbWallRing(-8.2,-6.8,3.4,1.6,y2,h2,{
   register:'banded',
   holes:{
    s:[{at:-5.2,w:1.45,h:1.45,y:.95},{at:-.6,w:1.45,h:1.45,y:.95}],
    n:[{at:-2.6,w:1.4,h:1.4,y:.95}],
    w:[{at:-2.6,w:1.4,h:1.4,y:.95}]
   }
  });
  tbZsolnayRoof(-2.4,yRoof,-2.6,12.0,9.0,{mode:'hip',over:.68,dormer:true});

  tbTarget(-5.4,y1,4.4,'capricho-breeze-portico',true);
  tbTarget(5.8,y1,4.4,'capricho-tower-vestibule',true);
  tbTarget(-5.8,y1,-2.6,'capricho-parlour',true);
  tbTarget(-5.8,y2,-2.6,'capricho-upper-chamber',true);

  tbFurnList([
   ['tb_trencadis_table',-5.4,y1,4.4,0],
   ['tb_kundal_divan',-5.8,y1,-4.8,0],
   ['tb_tea_samovar_low',-5.8,y1,-.6,PI],
   ['tb_ustun_daybed',-5.8,y2,-5.0,0],
   ['tb_ganch_screen_bench',-5.8,y2,-.4,PI],
   ['tb_brass_lantern_stand',2.2,y1,4.8,0]
  ]);
 }
});

/* 7. Secessionist Verdigris-Oriel Merchant Townhouse (middle, dwelling-single — Plates B1 & B2) */
defBuilding({
 key:'tb_oriel_townhouse',
 name:'Secessionist Verdigris-Oriel Merchant Townhouse',
 seed:10407,w:18,d:20,h:16.4,budget:92000,cut:true,
 front:{x:0,z:9.0,yaw:0},
 tags:{style:'urban',wealth:'middle',types:['dwelling-single'],role:'townhouse'},
 build(){
  const y1=.5,h1=3.75,y2=y1+h1,h2=3.45,yRoof=y2+h2;
  tbPorticoPlinth(14.2,15.4,y1,{stepW:2.8,stepRun:1.2});

  /* Recessed B2 ground loggia arch [z = 4.6..7.0] */
  tbRecessedLoggia(0,y1,5.8,0,4.6,h1,2.2,{});
  for(const sx of [-5.2,5.2]){
   tbWall(sx<0?-6.8:2.8,6.9,sx<0?-2.8:6.8,6.9,y1,h1,{register:'secession'});
  }

  tbWallRing(-6.8,-7.0,6.8,4.6,y1,h1,{
   register:'secession',
   holes:{
    s:[{at:0,w:1.65,h:2.3,door:true,name:'oriel-front-door'},{at:-4.2,w:1.3,h:1.35,y:1.0},{at:4.2,w:1.3,h:1.35,y:1.0}],
    n:[{at:-3.2,w:1.3,h:1.35,y:1.0},{at:3.2,w:1.3,h:1.35,y:1.0}],
    e:[{at:-1.2,w:1.3,h:1.35,y:1.0}],
    w:[{at:-1.2,w:1.3,h:1.35,y:1.0}]
   }
  });

  const st=tbInteriorStair(4.2,-4.2,y1,y2,0,{w:1.18});
  tbFloorSlab(0,y2,-1.2,13.4,11.4,{mk:'floor',th:.18,hole:st});
  tbKundalCeiling(-1.4,y2-.28,-1.2,10.0,10.8,{mk:'kundal'});

  /* Upper Secessionist facade with twin prominent verdigris bay-oriels & Zsolnay dormer roof! */
  tbWallRing(-6.6,-6.8,6.6,4.4,y2,h2,{
   register:'secession',
   holes:{
    s:[{at:-3.6,w:1.65,h:1.6,y:.85,proj:.44},{at:0,w:1.35,h:1.45,y:.95,flat:true},{at:3.6,w:1.65,h:1.6,y:.85,proj:.44}],
    n:[{at:-3.0,w:1.4,h:1.4,y:.95},{at:3.0,w:1.4,h:1.4,y:.95}],
    e:[{at:-1.2,w:1.45,h:1.45,y:.95}],
    w:[{at:-1.2,w:1.45,h:1.45,y:.95}]
   }
  });
  tbZsolnayRoof(0,yRoof,-1.2,13.6,11.6,{mode:'hip',over:.72,dormer:true,spire:true,lanternR:1.45,lanternH:3.5});

  tbTarget(0,y1,5.8,'oriel-entry-loggia',true);
  tbTarget(-1.4,y1,-1.2,'oriel-ground-salon',true);
  tbTarget(-1.4,y2,-1.2,'oriel-upper-parlour',true);

  tbFurnList([
   ['tb_kundal_divan',-2.6,y1,-2.8,0],
   ['tb_tea_samovar_low',-2.6,y1,-.8,0],
   ['tb_syndic_ledger_desk',2.2,y1,.8,PI],
   ['tb_ustun_daybed',-3.6,y2,-3.8,0],
   ['tb_ganch_screen_bench',.4,y2,1.6,PI],
   ['tb_brass_lantern_stand',0,y1,5.8,0]
  ]);
 }
});

/* 8. Arcaded Souq Shophouse & Claustra Sleeping Loft (middle, dwelling-multi + shop) */
defBuilding({
 key:'tb_shop_house',
 name:'Arcaded Souq Shophouse and Claustra Sleeping Loft',
 seed:10408,w:18,d:20,h:15.8,budget:92000,cut:true,
 front:{x:0,z:9.0,yaw:0},
 tags:{style:'urban',wealth:'middle',types:['dwelling-multi','shop'],role:'shophouse',job:'trading'},
 build(){
  const y1=.48,h1=3.7,y2=y1+h1,h2=3.3,yRoof=y2+h2;
  tbPorticoPlinth(14.6,15.6,y1,{stepW:3.2,stepRun:1.2});

  /* Wide ground bazaar arcade [z = 4.2..7.2] + silk sun-velarium */
  tbUstunAyvan(0,5.7,13.8,2.8,y1,h1,{n:5,skipMid:1.6,ganchBack:true});
  tbSunVelarium(-5.5,7.3,5.5,7.3,y1+h1-.2,1.6,{pal:'silkSaffron'});

  tbWallRing(-6.8,-7.0,6.8,4.2,y1,h1,{
   register:'banded',
   holes:{
    s:[
     {at:-2.8,w:1.6,h:2.3,door:true,name:'shop-west-door'},
     {at:2.8,w:1.6,h:2.3,door:true,name:'shop-east-door'}
    ],
    n:[{at:0,w:1.4,h:2.2,door:true,name:'shop-back-door'}],
    e:[{at:-1.4,w:1.25,h:1.3,y:1.0}],
    w:[{at:-1.4,w:1.25,h:1.3,y:1.0}]
   }
  });

  const st=tbInteriorStair(4.4,-4.4,y1,y2,0,{w:1.15});
  tbFloorSlab(0,y2,.1,13.8,14.2,{mk:'floor',th:.18,hole:st});
  tbKundalCeiling(-1.4,y2-.28,-1.4,10.2,10.6,{mk:'kundal'});
  tbParapet(-6.6,7.0,6.6,7.0,y2,{kind:'iron'});
  tbClaustraScreen(-6.6,4.3,-6.6,6.9,y2,2.2,{block:false});
  tbClaustraScreen(6.6,4.3,6.6,6.9,y2,2.2,{block:false});

  /* Upper family apartments + covered sleeping porch [z = 4.0..7.0] */
  tbUstunAyvan(0,5.5,13.4,2.8,y2,h2,{n:5,eaveCap:true});
  tbWallRing(-6.6,-6.8,6.6,4.0,y2,h2,{
   register:'hazarbaf',
   holes:{
    s:[{at:0,w:1.5,h:2.2,door:true,name:'shop-loft-door'},{at:-3.6,w:1.4,h:1.4,y:.95},{at:3.6,w:1.4,h:1.4,y:.95}],
    n:[{at:-2.8,w:1.35,h:1.35,y:.95},{at:2.8,w:1.35,h:1.35,y:.95}]
   }
  });
  tbZsolnayRoof(0,yRoof,-1.4,13.6,11.2,{mode:'hip',over:.68,lantern:true,lanternR:1.5,lanternH:3.3});

  tbTarget(0,y1,5.7,'shop-bazaar-arcade',true);
  tbTarget(-1.4,y1,-1.4,'shop-counting-room',true);
  tbTarget(-1.4,y2,-1.4,'shop-family-loft',true);
  tbTarget(0,y2,5.5,'shop-sleeping-porch',true);

  tbFurnList([
   ['tb_syndic_ledger_desk',-2.8,y1,-1.2,0],
   ['tb_bonded_bale_stack',2.2,y1,-3.8,0],
   ['tb_kashi_tile_rack',-4.8,y1,-4.6,0],
   ['tb_ustun_daybed',-3.4,y2,-3.8,0],
   ['tb_tea_samovar_low',0,y2,5.4,0],
   ['tb_trencadis_table',3.2,y1,5.6,0]
  ]);
 }
});

/* 9. Liikofi Abyss-Lac & Escata-Spire Patrician Bayt (rich, dwelling-single — Plates A2-A4 & B3) */
defBuilding({
 key:'tb_lac_merchant_bayt',
 name:'Liikofi Abyss-Lac and Escata-Spire Patrician Bayt',
 seed:10409,w:28,d:24,h:18.6,budget:122000,cut:true,
 front:{x:0,z:10.8,yaw:0},
 tags:{style:'urban',wealth:'rich',types:['dwelling-single'],role:'mansion'},
 build(){
  const y1=.58,h1=3.9,y2=y1+h1,h2=3.45,yRoof=y2+h2;
  tbPorticoPlinth(23.8,19.4,y1,{stepW:3.4,stepRun:1.35});

  /* Shah-i-Zinda street pishtaq + claustra forecourt [z = 2.0..9.2] + flowing shadirvan pool! */
  tbPishtaqPortal(0,y1,8.8,0,6.2,5.4,{openW:2.8,openH:3.4,dep:1.4,door:true,doorName:'bayt-pishtaq-gate'});
  for(const s of [-1,1]){
   tbWall(s<0?-11.4:3.2,9.0,s<0?-3.2:11.4,9.0,y1,2.8,{register:'hazarbaf'});
   tbClaustraScreen(s*11.4,2.2,s*11.4,8.8,y1,2.8,{});
  }
  tbShadirvanPool(4.6,5.4,4.8,3.2,y1+.32,.48,{river:{name:'bayt-shadirvan',axis:'x',speed:.32}});

  /* West abyss-lac archive pavilion [-11.2..-6.0, 2.6..8.2] crowned by Plate B3 Escata Spire! */
  tbWallRing(-11.2,2.6,-6.0,8.2,y1,3.5,{
   register:'hazarbaf',
   holes:{e:[{at:5.4,w:1.45,h:2.2,door:true,name:'bayt-archive-door'}]}
  });
  tbZsolnayRoof(-8.6,y1+3.5,5.4,5.6,6.0,{mode:'hip',over:.56,spire:true,lanternR:1.35,lanternH:4.2});

  /* Grand ustun & abyss-lac kundal veranda [z = -0.6..2.2] + 2-storey bayt hall [-11.2..11.2, -9.0..-0.6] */
  tbUstunAyvan(0,.8,21.6,2.8,y1,h1,{n:7,skipMid:1.8,ganchBack:true,ceilMk:'lacquer'});
  tbWallRing(-11.2,-9.0,11.2,-.6,y1,h1,{
   register:'hazarbaf',
   holes:{
    s:[
     {at:-6.2,w:1.5,h:2.25,door:true,name:'bayt-west-parlour'},
     {at:0,w:1.95,h:2.45,door:true,name:'bayt-great-hall'},
     {at:6.2,w:1.5,h:2.25,door:true,name:'bayt-east-study'}
    ],
    n:[{at:-5.8,w:1.35,h:1.35,y:1.05},{at:0,w:1.4,h:1.4,y:1.05},{at:5.8,w:1.35,h:1.35,y:1.05}]
   }
  });

  const st=tbInteriorStair(7.8,-4.8,y1,y2,-PI/2,{w:1.22});
  tbFloorSlab(0,y2,-4.8,21.8,8.0,{mk:'floor',th:.18,hole:st});
  tbKundalCeiling(-4.2,y2-.28,-4.8,12.2,7.4,{mk:'lacquer'});

  tbWallRing(-11.0,-8.8,11.0,-.8,y2,h2,{
   register:'secession',
   holes:{
    s:[{at:-6.4,w:1.6,h:1.55,y:.9},{at:0,w:1.75,h:1.6,y:.9},{at:6.4,w:1.6,h:1.55,y:.9}],
    n:[{at:-5.2,w:1.4,h:1.4,y:.95},{at:5.2,w:1.4,h:1.4,y:.95}]
   }
  });
  tbZsolnayRoof(0,yRoof,-4.8,22.4,8.4,{mode:'hip',over:.74,dormer:true,lantern:true,lanternR:1.8,lanternH:3.8});

  tbTarget(-1.6,y1,5.4,'bayt-forecourt',false);
  tbTarget(-8.6,y1,5.4,'bayt-lac-archive',true);
  tbTarget(-4.2,y1,-4.8,'bayt-kundal-hall',true);
  tbTarget(-4.2,y2,-4.8,'bayt-upper-apartments',true);

  tbFurnList([
   ['tb_syndic_ledger_desk',-8.6,y1,5.4,PI/2],
   ['tb_kundal_divan',-4.2,y1,-6.4,0],
   ['tb_tea_samovar_low',-4.2,y1,-4.2,0],
   ['tb_ganch_screen_bench',-8.2,y1,-4.8,PI/2],
   ['tb_ustun_daybed',-6.6,y2,-6.0,0],
   ['tb_kundal_divan',-2.4,y2,-4.8,0],
   ['tb_brass_lantern_stand',-1.6,y1,5.6,0]
  ]);
 }
});

/* 10. Raichle Double-Loggia Multi-Partner Palazzo (rich, dwelling-multi — Plate B2) */
defBuilding({
 key:'tb_secession_palazzo',
 name:'Raichle Double-Loggia Multi-Partner Palazzo',
 seed:10410,w:28,d:24,h:18.8,budget:125000,cut:true,
 front:{x:0,z:10.6,yaw:0},
 tags:{style:'urban',wealth:'rich',types:['dwelling-multi'],role:'palazzo'},
 build(){
  const y1=.58,h1=3.9,y2=y1+h1,h2=3.5,yRoof=y2+h2;
  tbPorticoPlinth(23.6,18.8,y1,{stepW:3.6,stepRun:1.35});

  /* Monumental Raichle double-height recessed center loggia arch (Plate B2) + flanking wings! */
  tbRecessedLoggia(0,y1,6.8,0,6.4,h1+h2,2.8,{});
  for(const sx of [-7.6,7.6]){
   tbWall(sx<0?-11.2:4.0,8.1,sx<0?-4.0:11.2,8.1,y1,h1,{
    register:'secession',
    holes:[{at:3.6,w:1.5,h:1.45,y:.95,proj:.42}]
   });
  }

  /* Three partner family suites [-11.2..11.2, -8.8..5.4] */
  tbWallRing(-11.2,-8.8,11.2,5.4,y1,h1,{
   register:'secession',
   holes:{
    s:[
     {at:-6.8,w:1.55,h:2.3,door:true,name:'palazzo-suite-w'},
     {at:0,w:1.95,h:2.45,door:true,name:'palazzo-central-foyer'},
     {at:6.8,w:1.55,h:2.3,door:true,name:'palazzo-suite-e'}
    ],
    n:[{at:-6.2,w:1.4,h:1.4,y:1.0},{at:0,w:1.45,h:1.45,y:1.0},{at:6.2,w:1.4,h:1.4,y:1.0}],
    e:[{at:-1.8,w:1.45,h:1.45,y:1.0}],
    w:[{at:-1.8,w:1.45,h:1.45,y:1.0}]
   }
  });

  const st=tbInteriorStair(8.2,-5.8,y1,y2,0,{w:1.24});
  tbFloorSlab(0,y2,-1.7,22.0,13.8,{mk:'floor',th:.18,hole:st});
  tbKundalCeiling(-1.6,y2-.28,-1.7,17.6,13.0,{mk:'lacquer'});

  tbWallRing(-11.0,-8.6,11.0,5.2,y2,h2,{
   register:'secession',
   holes:{
    s:[{at:-7.0,w:1.75,h:1.6,y:.88,proj:.45},{at:0,w:1.55,h:1.5,y:.95,flat:true},{at:7.0,w:1.75,h:1.6,y:.88,proj:.45}],
    n:[{at:-5.8,w:1.45,h:1.45,y:.95},{at:5.8,w:1.45,h:1.45,y:.95}],
    e:[{at:-1.8,w:1.5,h:1.5,y:.92}],
    w:[{at:-1.8,w:1.5,h:1.5,y:.92}]
   }
  });
  tbZsolnayRoof(0,yRoof,-1.7,22.4,14.2,{mode:'hip',over:.74,dormer:true,lantern:true,lanternR:1.95,lanternH:4.0});

  tbTarget(0,y1,6.8,'palazzo-recessed-loggia',true);
  tbTarget(-1.6,y1,-1.7,'palazzo-ground-apartments',true);
  tbTarget(-1.6,y2,-1.7,'palazzo-upper-apartments',true);

  tbFurnList([
   ['tb_kundal_divan',-5.8,y1,-3.2,0],
   ['tb_tea_samovar_low',-5.8,y1,-1.2,0],
   ['tb_syndic_ledger_desk',2.6,y1,-2.8,0],
   ['tb_ustun_daybed',-6.2,y2,-5.2,0],
   ['tb_ustun_daybed',1.2,y2,-5.2,0],
   ['tb_trencadis_table',-1.6,y2,1.6,0],
   ['tb_brass_lantern_stand',0,y1,7.2,0]
  ]);
 }
});

/* 11. Verdigris-Column & Solar-Mirador Lakefront Villa (rich, dwelling-single — Plates A5 & B5) */
defBuilding({
 key:'tb_mirador_estate',
 name:'Verdigris-Column and Solar-Mirador Lakefront Villa',
 seed:10411,w:28,d:24,h:19.6,budget:124000,cut:true,
 front:{x:-1.8,z:10.6,yaw:0},
 tags:{style:'urban',wealth:'rich',types:['dwelling-single'],role:'estate'},
 build(){
  const y1=.58,h1=3.95,y2=y1+h1,h2=3.4,yRoof=y2+h2;
  tbPorticoPlinth(23.6,18.8,y1,{stepX:-1.8,stepW:3.4,stepRun:1.35});

  /* Plate A5 imbricated verdigris-and-gilt grand front colonnade + sunken shadirvan water-garden + Plate B5 Mirador Wind-Tower! */
  tbUstunAyvan(-3.6,5.8,14.4,3.2,y1,h1,{n:5,verdigris:true,ganchBack:true,ceilMk:'lacquer'});
  tbWindTower(7.6,5.4,2.05,y1,16.2,{hollow:true,pedH:3.95,doorName:'mirador-tower-door'});
  tbShadirvanPool(7.6,.2,4.4,3.4,y1+.3,.48,{jet:true});

  /* Banded brick & kashi villa body [-11.0..4.0, -8.6..4.2] */
  tbWallRing(-11.0,-8.6,4.0,4.2,y1,h1,{
   register:'banded',
   holes:{
    s:[{at:-6.8,w:1.5,h:2.25,door:true,name:'mirador-west-door'},{at:-1.8,w:1.9,h:2.45,door:true,name:'mirador-hall-door'}],
    e:[{at:-2.2,w:1.45,h:2.25,door:true,name:'mirador-garden-door'}],
    n:[{at:-6.8,w:1.35,h:1.35,y:1.0},{at:-1.2,w:1.35,h:1.35,y:1.0}],
    w:[{at:-2.2,w:1.35,h:1.35,y:1.0}]
   }
  });

  const st=tbInteriorStair(1.4,-5.6,y1,y2,0,{w:1.2});
  tbFloorSlab(-3.5,y2,-2.2,14.6,12.4,{mk:'floor',th:.18,hole:st});
  tbKundalCeiling(-5.0,y2-.28,-2.2,11.0,11.6,{mk:'lacquer'});

  tbWallRing(-10.8,-8.4,3.8,4.0,y2,h2,{
   register:'hazarbaf',
   holes:{
    s:[{at:-7.0,w:1.6,h:1.55,y:.9},{at:-1.8,w:1.65,h:1.55,y:.9}],
    e:[{at:-2.2,w:1.5,h:1.5,y:.9}],
    n:[{at:-3.5,w:1.45,h:1.45,y:.95}]
   }
  });
  tbZsolnayRoof(-3.5,yRoof,-2.2,15.0,12.8,{mode:'hip',over:.72,spire:true,lanternR:1.55,lanternH:3.8});

  tbTarget(-3.6,y1,5.8,'mirador-verdigris-ayvan',true);
  tbTarget(7.6,y1,5.4,'mirador-tower-chamber',true);
  tbTarget(-5.0,y1,-2.2,'mirador-reception-salon',true);
  tbTarget(-5.0,y2,-2.2,'mirador-upper-belvedere',true);

  tbFurnList([
   ['tb_kundal_divan',-6.2,y1,-3.8,0],
   ['tb_tea_samovar_low',-6.2,y1,-1.8,0],
   ['tb_ganch_screen_bench',-1.4,y1,.8,PI],
   ['tb_ustun_daybed',-6.8,y2,-4.8,0],
   ['tb_syndic_ledger_desk',-2.2,y2,-1.2,0],
   ['tb_trencadis_table',-3.6,y1,5.8,0],
   ['tb_brass_lantern_stand',4.8,y1,5.8,0]
  ]);
 }
});
