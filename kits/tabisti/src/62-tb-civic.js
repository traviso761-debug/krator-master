// prefix: tb
/* ================================================================= URBAN TABISTI — ROW 4B: PATRICIAN CIVIC STATE & TAFALAST PALACE (10435..10439)
   10435. tb_palace_ahedman   — Tafalast di Ahedman Urban Ruler Palace (palace and canton staffs; Plates A1-A5 & B1-B5)
   10436. tb_syndic_guildhall — Zsolnay Chamber of the Potash, Lac & Caravan Syndics (guild officers and clerks)
   10437. tb_madrasa_library  — Four-Ayvan Trencadis-Dome College & Scroll Library (teachers and scholars)
   10438. tb_bimaristan_clinic— Evaporative Garden Bimaristan & Bath-Lens Infirmary (healers and nurses)
   10439. tb_embassy_compound — Raichle-Loggia Treaty & Foreign Factor Embassy (envoys and embassy staff) */

/* 35. Tafalast di Ahedman — The Urban Ruler's Palace (Plates A1-A5 & B1-B5) */
defBuilding({
 key:'tb_palace_ahedman',
 name:'Tafalast di Ahedman Urban Ruler Palace',
 seed:10435,w:32,d:28,h:22.8,budget:140000,cut:true,
 front:{x:0,z:12.8,yaw:0},
 tags:{style:'urban',wealth:'rich',types:['civic','dwelling-single'],role:'palace',landmark:true},
 build(){
  const y1=.66,h1=4.2,y2=y1+h1,h2=3.6,yRoof=y2+h2;
  tbPorticoPlinth(28.0,22.8,y1,{stepW:4.8,stepRun:1.45});

  /* Shah-i-Zinda state gate + twin corner El Capricho glazed solar wind-minarets + flowing shadirvan canal! */
  tbPishtaqPortal(0,y1,10.2,0,7.8,7.0,{openW:3.6,openH:4.3,dep:1.7,door:false});
  tbWindTower(-11.4,9.6,1.9,y1,17.8,{hollow:true,pedH:4.0,doorName:'palace-west-tower'});
  tbWindTower(11.4,9.6,1.9,y1,17.8,{hollow:true,pedH:4.0,doorName:'palace-east-tower'});
  tbShadirvanPool(0,5.2,9.2,2.8,y1+.32,.5,{river:{name:'tafalast-canal',axis:'x',speed:.36}});
  tbBanner(-5.2,y1,10.8,5.6,{pal:'flag'});
  tbBanner(5.2,y1,10.8,5.6,{pal:'silkSaffron'});

  /* Plate A5 imbricated verdigris-and-gilt throne portico [z = -1.8..1.6] + 2-storey Tafalast Audience Wing [-12.8..12.8, -10.8..-1.8] */
  tbUstunAyvan(0,-.1,24.8,3.2,y1,h1,{n:8,skipMid:2.0,verdigris:true,ganchBack:true,ceilMk:'lacquer'});
  tbWallRing(-12.8,-10.8,12.8,-1.8,y1,h1,{
   register:'hazarbaf',
   holes:{
    s:[
     {at:-7.2,w:1.7,h:2.4,door:true,name:'palace-chancery-door'},
     {at:0,w:2.3,h:2.85,door:true,name:'palace-diwan-door'},
     {at:7.2,w:1.7,h:2.4,door:true,name:'palace-treasury-door'}
    ],
    n:[{at:-7.0,w:1.45,h:1.5,y:1.05},{at:0,w:1.6,h:1.55,y:1.05},{at:7.0,w:1.45,h:1.5,y:1.05}]
   }
  });

  const st=tbInteriorStair(9.2,-6.3,y1,y2,-PI/2,{w:1.3});
  tbFloorSlab(0,y2,-6.3,25.0,8.6,{mk:'floor',th:.18,hole:st});
  tbKundalCeiling(-4.6,y2-.28,-6.3,14.8,8.0,{mk:'lacquer'});

  /* Upper Secessionist state apartments with verdigris bay-oriels & steep Zsolnay roof + B4 trencadis cupola! */
  tbWallRing(-12.6,-10.6,12.6,-2.0,y2,h2,{
   register:'secession',
   holes:{
    s:[{at:-7.6,w:1.75,h:1.65,y:.88,proj:.46},{at:0,w:1.95,h:1.7,y:.88,proj:.48},{at:7.6,w:1.75,h:1.65,y:.88,proj:.46}],
    n:[{at:-6.4,w:1.5,h:1.5,y:.95},{at:6.4,w:1.5,h:1.5,y:.95}]
   }
  });
  tbZsolnayRoof(0,yRoof,-6.3,25.6,9.0,{mode:'hip',over:.78,dormer:true,lantern:true,lanternR:2.15,lanternH:4.6});

  tbTarget(-6.4,y1,5.2,'tafalast-water-court',false);
  tbTarget(-11.4,y1,9.6,'tafalast-west-mirador',true);
  tbTarget(11.4,y1,9.6,'tafalast-east-mirador',true);
  tbTarget(-4.6,y1,-6.3,'tafalast-abyss-lac-diwan',true);
  tbTarget(-4.6,y2,-6.3,'tafalast-state-apartments',true);

  tbFurnList([
   ['tb_kundal_divan',-4.6,y1,-8.4,0],
   ['tb_tea_samovar_low',-4.6,y1,-6.2,0],
   ['tb_syndic_ledger_desk',-9.2,y1,-6.4,0],
   ['tb_crystal_altar_brazier',.4,y1,-7.6,0],
   ['tb_kundal_divan',-6.8,y2,-7.6,0],
   ['tb_ustun_daybed',-2.2,y2,-7.8,0],
   ['tb_brass_lantern_stand',-5.8,y1,5.2,0],
   ['tb_brass_lantern_stand',5.8,y1,5.2,0]
  ]);
 }
});

/* 36. Zsolnay Chamber of the Potash, Lac & Caravan Syndics (Plate B1) */
defBuilding({
 key:'tb_syndic_guildhall',
 name:'Zsolnay Chamber of the Potash Lac and Caravan Syndics',
 seed:10436,w:24,d:20,h:17.8,budget:108000,cut:true,
 front:{x:0,z:9.0,yaw:0},
 tags:{style:'urban',types:['civic','market'],role:'guildhall',job:'scribing'},
 build(){
  const y1=.54,h1=3.9,y2=y1+h1,h2=3.45,yRoof=y2+h2;
  tbPorticoPlinth(20.2,15.6,y1,{stepW:3.6,stepRun:1.25});

  /* Lechner Secessionist recessed loggia + corner brick belvedere piers (Plate B1)! */
  tbRecessedLoggia(0,y1,5.6,0,5.6,h1,2.4,{});
  for(const sx of [-6.4,6.4]){
   tbWall(sx<0?-9.6:3.4,6.7,sx<0?-3.4:9.6,6.7,y1,h1,{register:'secession'});
  }

  tbWallRing(-9.6,-7.0,9.6,4.4,y1,h1,{
   register:'secession',
   holes:{
    s:[{at:0,w:1.95,h:2.45,door:true,name:'syndic-main-door'},{at:-6.2,w:1.4,h:1.4,y:1.0},{at:6.2,w:1.4,h:1.4,y:1.0}],
    n:[{at:-4.8,w:1.4,h:1.4,y:1.0},{at:4.8,w:1.4,h:1.4,y:1.0}],
    e:[{at:-1.2,w:1.4,h:1.4,y:1.0}],
    w:[{at:-1.2,w:1.4,h:1.4,y:1.0}]
   }
  });

  const st=tbInteriorStair(6.8,-4.2,y1,y2,0,{w:1.22});
  tbFloorSlab(0,y2,-1.3,18.8,11.0,{mk:'floor',th:.18,hole:st});
  tbKundalCeiling(-1.6,y2-.28,-1.3,15.0,10.2,{mk:'lacquer'});

  tbWallRing(-9.4,-6.8,9.4,4.2,y2,h2,{
   register:'secession',
   holes:{
    s:[{at:-5.8,w:1.65,h:1.55,y:.9,proj:.44},{at:0,w:1.75,h:1.6,y:.9,proj:.46},{at:5.8,w:1.65,h:1.55,y:.9,proj:.44}],
    n:[{at:-4.6,w:1.45,h:1.45,y:.95},{at:4.6,w:1.45,h:1.45,y:.95}]
   }
  });
  tbZsolnayRoof(0,yRoof,-1.3,19.4,11.4,{mode:'hip',over:.74,dormer:true,spire:true,lanternR:1.7,lanternH:4.2});
  tbBanner(-8.4,y1,7.2,5.0,{pal:'flag'});
  tbBanner(8.4,y1,7.2,5.0,{pal:'silk'});

  tbTarget(0,y1,5.6,'syndic-breeze-loggia',true);
  tbTarget(-1.6,y1,-1.3,'syndic-assay-chamber',true);
  tbTarget(-1.6,y2,-1.3,'syndic-council-gallery',true);

  tbFurnList([
   ['tb_syndic_ledger_desk',-5.2,y1,-2.6,0],
   ['tb_syndic_ledger_desk',.6,y1,-2.6,0],
   ['tb_kashi_tile_rack',-6.8,y1,1.6,PI],
   ['tb_kundal_divan',-4.8,y2,-3.2,0],
   ['tb_tea_samovar_low',-1.2,y2,-1.4,0],
   ['tb_brass_lantern_stand',0,y1,5.8,0]
  ]);
 }
});

/* 37. Four-Ayvan Trencadis-Dome College & Scroll Library (Plate B4) */
defBuilding({
 key:'tb_madrasa_library',
 name:'Four-Ayvan Trencadis-Dome College and Scroll Library',
 seed:10437,w:24,d:22,h:17.2,budget:104000,cut:true,
 front:{x:0,z:9.8,yaw:0},
 tags:{style:'urban',types:['civic'],role:'school',job:'scribing'},
 build(){
  const y1=.54,h1=4.0,yRoof=y1+h1;
  tbPorticoPlinth(20.2,17.2,y1,{stepW:3.4,stepRun:1.25});

  tbPishtaqPortal(0,y1,7.6,0,6.6,5.8,{openW:3.0,openH:3.7,dep:1.5,door:false});
  for(const s of [-1,1]){
   tbWall(s<0?-9.6:3.5,8.0,s<0?-3.5:9.6,8.0,y1,2.8,{register:'hazarbaf'});
   tbClaustraScreen(s*9.6,1.8,s*9.6,7.8,y1,2.8,{});
  }
  tbShadirvanPool(-4.8,4.8,3.6,2.6,y1+.28,.44,{jet:true});

  /* Shaded scholar ayvan + vaulted scroll library [-9.6..9.6, -8.0..-0.6] crowned by B4 trencadis dome lantern! */
  tbUstunAyvan(0,.6,18.6,2.4,y1,h1,{n:7,skipMid:1.8,ganchBack:true,ceilMk:'kundal'});
  tbWallRing(-9.6,-8.0,9.6,-.6,y1,h1,{
   register:'hazarbaf',
   holes:{
    s:[
     {at:-5.2,w:1.5,h:2.25,door:true,name:'madrasa-west-lecture'},
     {at:0,w:1.85,h:2.4,door:true,name:'madrasa-library-door'},
     {at:5.2,w:1.5,h:2.25,door:true,name:'madrasa-east-lecture'}
    ],
    n:[{at:-5.0,w:1.4,h:1.45,y:1.0},{at:0,w:1.45,h:1.5,y:1.0},{at:5.0,w:1.4,h:1.45,y:1.0}]
   }
  });
  tbZsolnayRoof(0,yRoof,-4.3,19.8,8.0,{mode:'hip',over:.72,lantern:true,lanternR:2.0,lanternH:4.5});

  tbTarget(3.6,y1,4.8,'madrasa-scholar-court',false);
  tbTarget(0,y1,.6,'madrasa-lecture-ayvan',true);
  tbTarget(0,y1,-4.3,'madrasa-scroll-hall',true);

  tbFurnList([
   ['tb_syndic_ledger_desk',-5.2,y1,-4.8,0],
   ['tb_syndic_ledger_desk',0,y1,-4.8,0],
   ['tb_syndic_ledger_desk',5.2,y1,-4.8,0],
   ['tb_ganch_screen_bench',-4.2,y1,.6,0],
   ['tb_tea_samovar_low',4.2,y1,.6,0],
   ['tb_brass_lantern_stand',3.6,y1,5.0,0]
  ]);
 }
});

/* 38. Evaporative Garden Bimaristan & Bath-Lens Infirmary */
defBuilding({
 key:'tb_bimaristan_clinic',
 name:'Evaporative Garden Bimaristan and Bath-Lens Infirmary',
 seed:10438,w:24,d:20,h:15.8,budget:98000,cut:true,
 front:{x:0,z:9.0,yaw:0},
 tags:{style:'urban',types:['civic'],role:'hospital',job:'healing'},
 build(){
  const y1=.52,h1=3.9,yRoof=y1+h1;
  tbPorticoPlinth(20.2,15.6,y1,{stepW:3.4,stepRun:1.2});

  /* Evaporative cooling water-court [z = 2.4..7.2] + shaded convalescent ustun veranda! */
  tbShadirvanPool(0,5.0,6.4,2.8,y1+.28,.46,{river:{name:'bimaristan-rill',axis:'x',speed:.28}});
  tbUstunAyvan(0,1.8,18.8,2.4,y1,h1,{n:7,skipMid:1.8,ganchBack:true});

  tbWallRing(-9.6,-7.0,9.6,.6,y1,h1,{
   register:'secession',
   holes:{
    s:[
     {at:-5.2,w:1.55,h:2.3,door:true,name:'clinic-west-ward'},
     {at:0,w:1.8,h:2.4,door:true,name:'clinic-apothecary-door'},
     {at:5.2,w:1.55,h:2.3,door:true,name:'clinic-bath-ward'}
    ],
    n:[{at:-5.0,w:1.4,h:1.4,y:1.0},{at:0,w:1.4,h:1.4,y:1.0},{at:5.0,w:1.4,h:1.4,y:1.0}]
   }
  });
  /* Bath-lens glazed roof with trencadis ventilation cupola! */
  tbZsolnayRoof(0,yRoof,-3.2,19.8,8.2,{mk:'bathlens',mode:'hip',over:.7,lantern:true,lanternR:1.75,lanternH:3.8});

  tbTarget(-6.2,y1,5.0,'bimaristan-water-garden',false);
  tbTarget(0,y1,1.8,'bimaristan-convalescent-ayvan',true);
  tbTarget(0,y1,-3.2,'bimaristan-ward-hall',true);

  tbFurnList([
   ['tb_ustun_daybed',-6.2,y1,-4.4,0],
   ['tb_ustun_daybed',-2.2,y1,-4.4,0],
   ['tb_incense_alembic',2.6,y1,-4.4,0],
   ['tb_zeer_cold_rack',6.4,y1,-4.4,0],
   ['tb_ganch_screen_bench',-4.8,y1,1.8,0],
   ['tb_brass_lantern_stand',6.2,y1,5.0,0]
  ]);
 }
});

/* 39. Raichle-Loggia Treaty & Foreign Factor Embassy (Plate B2) */
defBuilding({
 key:'tb_embassy_compound',
 name:'Raichle-Loggia Treaty and Foreign Factor Embassy',
 seed:10439,w:24,d:22,h:17.4,budget:104000,cut:true,
 front:{x:0,z:9.8,yaw:0},
 tags:{style:'urban',wealth:'rich',types:['civic'],role:'embassy'},
 build(){
  const y1=.54,h1=3.9,y2=y1+h1,h2=3.35,yRoof=y2+h2;
  tbPorticoPlinth(20.2,17.2,y1,{stepW:3.4,stepRun:1.25});

  /* Diplomatic recessed reception loggia + twin silk treaty banners (for Yuni A'yan, Dasri & Izani factors) */
  tbRecessedLoggia(0,y1,6.2,0,5.4,h1,2.4,{});
  tbShadirvanPool(-6.2,5.8,3.2,2.4,y1+.28,.44,{jet:true});
  tbBanner(5.8,y1,6.6,5.2,{pal:'silk'});
  tbBanner(7.6,y1,6.6,5.2,{pal:'silkRose'});

  tbWallRing(-9.4,-8.0,9.4,5.0,y1,h1,{
   register:'secession',
   holes:{
    s:[{at:0,w:1.85,h:2.4,door:true,name:'embassy-chancery-door'},{at:5.6,w:1.4,h:1.4,y:1.0}],
    n:[{at:-4.6,w:1.4,h:1.4,y:1.0},{at:4.6,w:1.4,h:1.4,y:1.0}],
    e:[{at:-1.5,w:1.4,h:1.4,y:1.0}],
    w:[{at:-1.5,w:1.4,h:1.4,y:1.0}]
   }
  });

  const st=tbInteriorStair(6.6,-5.2,y1,y2,0,{w:1.2});
  tbFloorSlab(0,y2,-1.5,18.4,12.6,{mk:'floor',th:.18,hole:st});
  tbKundalCeiling(-1.6,y2-.28,-1.5,14.6,11.8,{mk:'lacquer'});

  tbWallRing(-9.2,-7.8,9.2,4.8,y2,h2,{
   register:'secession',
   holes:{
    s:[{at:-5.2,w:1.6,h:1.55,y:.9,proj:.44},{at:0,w:1.65,h:1.55,y:.9,proj:.44},{at:5.2,w:1.6,h:1.55,y:.9,proj:.44}],
    n:[{at:-4.4,w:1.4,h:1.4,y:.95},{at:4.4,w:1.4,h:1.4,y:.95}]
   }
  });
  tbZsolnayRoof(0,yRoof,-1.5,18.8,13.0,{mode:'hip',over:.72,dormer:true,spire:true,lanternR:1.6,lanternH:3.8});

  tbTarget(0,y1,6.2,'embassy-reception-loggia',true);
  tbTarget(-1.6,y1,-1.5,'embassy-treaty-hall',true);
  tbTarget(-1.6,y2,-1.5,'embassy-envoy-residences',true);

  tbFurnList([
   ['tb_kundal_divan',-4.6,y1,-3.2,0],
   ['tb_tea_samovar_low',-4.6,y1,-1.2,0],
   ['tb_syndic_ledger_desk',1.8,y1,-2.8,0],
   ['tb_ustun_daybed',-5.2,y2,-4.6,0],
   ['tb_kundal_divan',-.8,y2,-1.8,0],
   ['tb_brass_lantern_stand',0,y1,6.4,0]
  ]);
 }
});
