// prefix: tb
/* ================================================================= URBAN TABISTI — ROW 4A: SACRED SALT-CRYSTAL ALTAR & SANCTUARIES (10431..10434)
   10431. tb_temple_altar_grand  — Grand Urban Temple of the Salt-Crystal Altar (temple priests and servants; LORE.md 6.9)
   10432. tb_wayside_salt_shrine — Verdigris-Column Wayside Blue-Crystal & Salt Kiosk (shrine keepers)
   10433. tb_necropolis_qubba    — Shah-i-Zinda Glazed-Terracotta Necropolis Qubba (priests and undertakers)
   10434. tb_monk_chapterhouse   — Ustun-Cloistered Order of Historians Chapterhouse (monks and lay brothers) */

/* 31. Grand Urban Temple of the Salt-Crystal Altar (Plates A1-A4, B3 & B5; LORE.md 6.9) */
defBuilding({
 key:'tb_temple_altar_grand',
 name:'Grand Urban Temple of the Salt-Crystal Altar',
 seed:10431,w:32,d:28,h:22.4,budget:140000,cut:true,
 front:{x:0,z:12.8,yaw:0},
 tags:{style:'urban',types:['religious','civic'],role:'grand-temple',job:'worship',landmark:true},
 build(){
  const y1=.64,h1=4.6,yRoof=y1+h1;
  tbPorticoPlinth(28.0,22.8,y1,{stepW:4.8,stepRun:1.45});

  /* Monumental Shah-i-Zinda embossed turquoise/cobalt pishtaq portal + twin corner El Capricho glazed wind-minarets! */
  tbPishtaqPortal(0,y1,10.2,0,8.2,7.6,{openW:3.8,openH:4.6,dep:1.8,door:false});
  tbWindTower(-11.2,9.8,1.85,y1,18.2,{pedH:3.6,block:true});
  tbWindTower(11.2,9.8,1.85,y1,18.2,{pedH:3.6,block:true});
  for(const s of [-1,1]){
   tbWall(s<0?-9.2:4.3,10.6,s<0?-4.3:9.2,10.6,y1,3.6,{register:'hazarbaf'});
   tbClaustraScreen(s*13.2,-1.0,s*13.2,8.0,y1,3.4,{});
  }

  /* Sky-open sacred breezy court centered on the Stepped White-Alabaster Altar, Fire-Bowl & Glowing Blue Crystal Ring! */
  svNoWalk(()=>{
   box('alabaster',0,y1+.01,3.8,6.2,.28,6.2,P('alabaster'));
   box('kashi',0,y1+.29,3.8,4.8,.26,4.8,P('kashi'));
   box('alabaster',0,y1+.55,3.8,3.4,.28,3.4,P('alabaster'));
   cyl('gilt',0,y1+.83,3.8,.86,.34,P('gilt'),12);
   cyl('glow',0,y1+1.17,3.8,.64,.08,P('flame'),12);
   for(let k=0;k<8;k++){
    const a=k/8*TAU,rx=Math.cos(a)*2.05,rz=3.8+Math.sin(a)*2.05;
    cyl('alabaster',rx,y1+.3,rz,.24,.24,P('alabaster'),8);
    cyl('crystal',rx,y1+.54,rz,.18,1.25+(k%2)*.28,P('crystal'),6,.04);
   }
  });
  tbWallBlock(0,y1,3.8,5.8,1.6,5.8,0);

  /* Shaded ustun & abyss-lac kundal cloister veranda [z = -2.8..0.2] + Grand Inner Sanctuary [-12.8..12.8, -10.8..-2.8] */
  tbUstunAyvan(0,-1.3,24.6,2.8,y1,h1,{n:8,skipMid:2.0,verdigris:true,ganchBack:true,ceilMk:'lacquer'});
  tbWallRing(-12.8,-10.8,12.8,-2.8,y1,h1,{
   register:'hazarbaf',
   holes:{
    s:[
     {at:-6.8,w:1.65,h:2.4,door:true,name:'temple-west-sanctuary'},
     {at:0,w:2.2,h:2.8,door:true,name:'temple-holy-sanctuary'},
     {at:6.8,w:1.65,h:2.4,door:true,name:'temple-east-sanctuary'}
    ],
    n:[{at:-6.4,w:1.45,h:1.6,y:1.1},{at:0,w:1.6,h:1.7,y:1.1},{at:6.4,w:1.45,h:1.6,y:1.1}]
   }
  });
  tbZsolnayRoof(0,yRoof,-6.8,26.2,8.6,{mode:'hip',over:.76,spire:true,lanternR:2.1,lanternH:5.4});

  tbTarget(-5.2,y1,4.2,'temple-altar-ambulatory',false);
  tbTarget(0,y1,-1.3,'temple-verdigris-cloister',true);
  tbTarget(0,y1,-6.8,'temple-inner-sanctuary',true);

  tbFurnList([
   ['tb_crystal_altar_brazier',-6.4,y1,-6.8,0],
   ['tb_crystal_altar_brazier',6.4,y1,-6.8,0],
   ['tb_ganch_screen_bench',-3.4,y1,-8.6,0],
   ['tb_ganch_screen_bench',3.4,y1,-8.6,0],
   ['tb_brass_lantern_stand',-4.6,y1,7.8,0],
   ['tb_brass_lantern_stand',4.6,y1,7.8,0],
   ['tb_shadirvan_fountain',8.2,y1,4.2,0]
  ]);
 }
});

/* 32. Verdigris-Column Wayside Blue-Crystal & Salt Kiosk (Plate A5 & B4) */
defBuilding({
 key:'tb_wayside_salt_shrine',
 name:'Verdigris-Column Wayside Salt-Crystal Kiosk',
 seed:10432,w:14,d:14,h:14.8,budget:68000,cut:false,
 front:{x:0,z:6.1,yaw:0},
 tags:{style:'urban',types:['religious'],role:'shrine',job:'worship'},
 build(){
  const y1=.56,h1=4.0,yRoof=y1+h1;
  tbPorticoPlinth(9.8,9.8,y1,{stepW:2.8,stepRun:1.25});

  /* Open 360-degree 8-column Plate A5 verdigris-and-gilt kiosk sheltering a sacred crystal brazier! */
  tbBio().openLoggias++;
  for(const sx of [-3.6,3.6])for(const sz of [-3.6,3.6]){
   tbVerdigrisColumn(sx,y1,sz,h1-.38,{r:.18});
  }
  for(const [mx,mz] of [[0,3.8],[0,-3.8],[3.8,0],[-3.8,0]]){
   if(mz>3.0)continue;
   tbUstunColumn(mx,y1,mz,h1-.38,{r:.15});
  }
  svNoWalk(()=>{
   box('kashi',0,y1+h1-.38,0,8.2,.22,8.2,P('kashi'));
   box('rosebrick',0,y1+h1-.16,0,8.5,.16,8.5,P('rosebrick'));
  });
  tbZsolnayRoof(0,yRoof,0,8.4,8.4,{mode:'hip',over:.62,lantern:true,lanternR:1.65,lanternH:4.2});

  tbTarget(0,y1,2.2,'wayside-shrine-deck',true);

  tbFurnList([
   ['tb_crystal_altar_brazier',0,y1,0,0],
   ['tb_ganch_screen_bench',-2.6,y1,-1.8,PI/2],
   ['tb_ganch_screen_bench',2.6,y1,-1.8,-PI/2],
   ['tb_brass_lantern_stand',-2.4,y1,2.4,0],
   ['tb_brass_lantern_stand',2.4,y1,2.4,0]
  ]);
 }
});

/* 33. Shah-i-Zinda Glazed-Terracotta Necropolis Qubba (Plate A1 & B3) */
defBuilding({
 key:'tb_necropolis_qubba',
 name:'Shah-i-Zinda Embossed-Kashi Necropolis Qubba',
 seed:10433,w:18,d:18,h:18.2,budget:84000,cut:true,
 front:{x:0,z:8.0,yaw:0},
 tags:{style:'urban',types:['funerary','religious'],role:'mausoleum',job:'worship'},
 build(){
  const y1=.6,h1=4.4,yRoof=y1+h1;
  tbPorticoPlinth(13.6,13.6,y1,{stepW:3.0,stepRun:1.3});

  /* Embossed turquoise/cobalt pishtaq entry + hazarbaf mausoleum chamber + tall B3 Escata Spire! */
  tbPishtaqPortal(0,y1,5.2,0,6.2,5.6,{openW:2.6,openH:3.5,dep:1.4,door:true,doorName:'qubba-portal-door'});
  tbWallRing(-5.6,-5.8,5.6,4.4,y1,h1,{
   register:'hazarbaf',
   holes:{
    s:[{at:0,w:2.8,h:3.5,door:true,draw:false}],
    e:[{at:-.8,w:1.35,h:1.6,y:1.05,flat:true}],
    w:[{at:-.8,w:1.35,h:1.6,y:1.05,flat:true}],
    n:[{at:0,w:1.45,h:1.65,y:1.05,flat:true}]
   }
  });
  tbZsolnayRoof(0,yRoof,-.7,11.6,10.6,{mk:'cobalt',mode:'hip',over:.66,spire:true,lanternR:1.95,lanternH:5.4});

  tbTarget(0,y1,-.7,'qubba-cenotaph-chamber',true);

  tbFurnList([
   ['tb_crystal_altar_brazier',0,y1,-1.8,0],
   ['tb_ganch_screen_bench',-3.4,y1,-.8,PI/2],
   ['tb_ganch_screen_bench',3.4,y1,-.8,-PI/2],
   ['tb_brass_lantern_stand',-2.4,y1,2.2,0],
   ['tb_brass_lantern_stand',2.4,y1,2.2,0]
  ]);
 }
});

/* 34. Ustun-Cloistered Order of Historians Chapterhouse */
defBuilding({
 key:'tb_monk_chapterhouse',
 name:'Ustun-Cloistered Order Chapterhouse and Scriptorium',
 seed:10434,w:24,d:22,h:16.8,budget:104000,cut:true,
 front:{x:0,z:9.8,yaw:0},
 tags:{style:'urban',types:['religious','civic'],role:'monastery',job:'scribing'},
 build(){
  const y1=.54,h1=3.95,yRoof=y1+h1;
  tbPorticoPlinth(20.2,17.2,y1,{stepW:3.2,stepRun:1.25});

  /* Quiet cloistered garden court [z = 2.0..8.0] with central shadirvan fountain */
  tbKashiDoor(0,y1,8.0,0,1.9,2.45,{pishtaq:true,name:'chapter-gate'});
  for(const s of [-1,1]){
   tbWall(s<0?-9.6:1.4,8.0,s<0?-1.4:9.6,8.0,y1,2.7,{register:'secession'});
   tbClaustraScreen(s*9.6,2.0,s*9.6,7.8,y1,2.7,{});
  }
  tbShadirvanPool(0,5.0,3.8,2.8,y1+.28,.44,{jet:true});

  /* Shaded ustun cloister walk + scriptorium & dormitory hall [-9.6..9.6, -8.0..-0.6] */
  tbUstunAyvan(0,.7,18.6,2.6,y1,h1,{n:7,skipMid:1.8,ganchBack:true});
  tbWallRing(-9.6,-8.0,9.6,-.6,y1,h1,{
   register:'hazarbaf',
   holes:{
    s:[
     {at:-5.4,w:1.5,h:2.25,door:true,name:'chapter-dorm-door'},
     {at:0,w:1.8,h:2.4,door:true,name:'chapter-scriptorium-door'},
     {at:5.4,w:1.5,h:2.25,door:true,name:'chapter-library-door'}
    ],
    n:[{at:-5.2,w:1.35,h:1.45,y:1.0},{at:0,w:1.4,h:1.45,y:1.0},{at:5.2,w:1.35,h:1.45,y:1.0}]
   }
  });
  tbZsolnayRoof(0,yRoof,-4.3,19.8,8.0,{mode:'hip',over:.72,lantern:true,lanternR:1.75,lanternH:3.9});

  tbTarget(4.2,y1,5.0,'chapter-cloister-court',false);
  tbTarget(0,y1,.7,'chapter-ustun-walk',true);
  tbTarget(0,y1,-4.3,'chapter-scriptorium',true);

  tbFurnList([
   ['tb_syndic_ledger_desk',-5.2,y1,-4.8,0],
   ['tb_syndic_ledger_desk',0,y1,-4.8,0],
   ['tb_kashi_tile_rack',5.6,y1,-5.4,0],
   ['tb_ustun_daybed',-6.8,y1,-2.4,PI/2],
   ['tb_ganch_screen_bench',4.2,y1,.7,0],
   ['tb_brass_lantern_stand',-4.2,y1,5.0,0]
  ]);
 }
});
