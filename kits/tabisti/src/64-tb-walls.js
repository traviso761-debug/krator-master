// prefix: tb
/* ================================================================= URBAN TABISTI — ROW 5A: VENTILATED CITY WALLS, GATES & GARRISON (10440..10444)
   10440. tb_wall_curtain   — Banded-Brick & Kashi-Frieze Shaded City Wall Curtain (soldiers, town guard)
   10441. tb_wall_bastion   — Corbelled-Brick & Trencadis-Cupola Artillery Bastion (soldiers, town guard, coast guard)
   10442. tb_wall_corner    — Fortified Corner Watch-Bastion with Escata Spire (soldiers, town guard)
   10443. tb_wall_gate      — Twin-Turreted Shah-i-Zinda & Zsolnay City Gatehouse (town guard, customs officers)
   10444. tb_barracks_court — Ustun-Arcaded Garrison & Solar Watch-Minaret Compound (soldiers, town guard) */

/* 40. Banded-Brick & Kashi-Frieze Shaded City Wall Curtain */
defBuilding({
 key:'tb_wall_curtain',
 name:'Banded-Brick and Kashi-Frieze Shaded City Wall Curtain',
 seed:10440,w:18,d:14,h:12.8,budget:68000,cut:false,
 front:{x:0,z:6.3,yaw:0},
 tags:{style:'urban',types:['military','infrastructure'],role:'wall-curtain'},
 build(){
  const y1=.48,hWall=4.2,yWalk=y1+hWall;
  tbPorticoPlinth(15.2,10.6,y1,{stepW:3.2,stepRun:1.15});

  /* Battered banded-brick curtain vault [-6.8..6.8, -3.6..1.8] with interior guardroom + gentle city-side stair to shaded sentry walk! */
  tbWallRing(-6.8,-3.6,6.8,1.8,y1,hWall,{
   register:'banded',t:.52,
   holes:{
    s:[{at:-3.6,w:1.7,h:2.3,door:true,name:'curtain-guardroom-door'}],
    n:[{at:-3.6,w:.85,h:1.25,y:1.4,flat:true},{at:0,w:.85,h:1.25,y:1.4,flat:true},{at:3.6,w:.85,h:1.25,y:1.4,flat:true}]
   }
  });
  tbStair(-.4,y1,2.9,5.0,yWalk,2.9,1.6,{mk:'ashlar',sideMk:'rosebrick'});
  tbFloorSlab(5.91,yWalk,2.81,1.78,1.98,{mk:'paving',th:.2});
  tbFloorSlab(0,yWalk,-1.0,14.0,5.6,{mk:'paving',th:.2});
  tbKundalCeiling(-2.0,yWalk-.3,-1.0,9.2,4.4,{mk:'kundal'});
  tbParapet(-6.8,-3.65,6.8,-3.65,yWalk,{kind:'brick',h:1.12});
  tbParapet(-6.8,1.75,4.5,1.75,yWalk,{kind:'iron'});
  tbParapet(5.0,3.78,6.85,3.78,yWalk,{kind:'iron'});
  tbParapet(6.85,1.75,6.85,3.78,yWalk,{kind:'iron'});

  /* Shaded ustun sentry canopy over rampart walk dispersing solar heat on watchmen! */
  tbUstunAyvan(0,-1.0,13.4,5.0,yWalk,3.2,{n:5});
  tbZsolnayRoof(0,yWalk+3.2,-1.0,13.8,5.4,{mode:'gable',gableAxis:'x',over:.55});

  tbTarget(-3.6,y1,-.9,'curtain-casemate-vault',true);
  tbTarget(0,yWalk,-1.0,'curtain-shaded-rampart',true);

  tbFurnList([
   ['tb_ganch_screen_bench',-5.0,y1,-2.0,0],
   ['tb_zeer_cold_rack',.8,y1,-2.0,0],
   ['tb_brass_lantern_stand',-4.8,yWalk,-1.0,0],
   ['tb_brass_lantern_stand',1.8,yWalk,-1.0,0]
  ]);
 }
});

/* 41. Corbelled-Brick & Trencadis-Cupola Artillery Bastion (Plate B4) */
defBuilding({
 key:'tb_wall_bastion',
 name:'Corbelled-Brick and Trencadis-Cupola Watch Bastion',
 seed:10441,w:18,d:18,h:17.8,budget:82000,cut:true,
 front:{x:0,z:8.0,yaw:0},
 tags:{style:'urban',types:['military','infrastructure'],role:'bastion'},
 build(){
  const y1=.56,h1=4.2,y2=y1+h1,h2=3.5,yRoof=y2+h2;
  tbPorticoPlinth(14.0,14.0,y1,{stepW:3.0,stepRun:1.25});

  tbWallRing(-5.8,-5.8,5.8,4.6,y1,h1,{
   register:'banded',t:.52,
   holes:{
    s:[{at:0,w:1.8,h:2.4,door:true,name:'bastion-casemate-door'}],
    n:[{at:-2.8,w:.95,h:1.3,y:1.3,flat:true},{at:2.8,w:.95,h:1.3,y:1.3,flat:true}],
    e:[{at:-.6,w:.95,h:1.3,y:1.3,flat:true}],
    w:[{at:-.6,w:.95,h:1.3,y:1.3,flat:true}]
   }
  });

  const st=tbInteriorStair(3.4,-3.2,y1,y2,0,{w:1.2});
  tbFloorSlab(0,y2,-.6,11.4,10.2,{mk:'floor',th:.18,hole:st});
  tbKundalCeiling(-1.4,y2-.28,-.6,8.0,9.4,{mk:'kundal'});

  tbWallRing(-5.6,-5.6,5.6,4.4,y2,h2,{
   register:'hazarbaf',t:.46,
   holes:{
    s:[{at:-2.6,w:1.25,h:1.35,y:1.0,flat:true},{at:2.6,w:1.25,h:1.35,y:1.0,flat:true}],
    n:[{at:0,w:1.35,h:1.4,y:1.0,flat:true}],
    e:[{at:-.6,w:1.25,h:1.35,y:1.0,flat:true}],
    w:[{at:-.6,w:1.25,h:1.35,y:1.0,flat:true}]
   }
  });
  tbZsolnayRoof(0,yRoof,-.6,11.8,10.6,{mode:'hip',over:.68,lantern:true,lanternR:2.0,lanternH:4.8});

  tbTarget(-1.4,y1,-.6,'bastion-lower-casemate',true);
  tbTarget(-1.4,y2,-.6,'bastion-watch-battery',true);

  tbFurnList([
   ['tb_bonded_bale_stack',-3.2,y1,-3.2,0],
   ['tb_zeer_cold_rack',-3.4,y1,1.6,0],
   ['tb_syndic_ledger_desk',-2.2,y2,-2.6,0],
   ['tb_ganch_screen_bench',-2.2,y2,1.8,PI],
   ['tb_brass_lantern_stand',0,y1,5.6,0]
  ]);
 }
});

/* 42. Fortified Corner Watch-Bastion with Escata Spire (Plate B3) */
defBuilding({
 key:'tb_wall_corner',
 name:'Fortified Corner Watch-Bastion with Escata Spire',
 seed:10442,w:20,d:20,h:18.4,budget:86000,cut:true,
 front:{x:-2.2,z:8.8,yaw:0},
 tags:{style:'urban',types:['military','infrastructure'],role:'wall-corner'},
 build(){
  const y1=.56,h1=4.2,yRoof=y1+h1;
  tbPorticoPlinth(16.0,16.0,y1,{stepX:-2.2,stepW:3.0,stepRun:1.25});

  /* L-configured corner casemate [-6.8..3.2, -6.8..4.6] + NE corner cylindrical glazed watch-turret! */
  tbWindTower(4.8,-4.2,2.05,y1,14.8,{pedH:3.8,block:true});
  tbUstunAyvan(-1.8,5.8,9.6,2.4,y1,h1,{n:4,ganchBack:false});

  tbWallRing(-6.8,-6.8,3.2,4.6,y1,h1,{
   register:'banded',t:.5,
   holes:{
    s:[{at:-1.8,w:1.75,h:2.35,door:true,name:'corner-bastion-door'}],
    e:[{at:1.2,w:1.5,h:2.25,door:true,name:'corner-yard-door'}],
    n:[{at:-1.8,w:1.15,h:1.3,y:1.2,flat:true}],
    w:[{at:-1.0,w:1.15,h:1.3,y:1.2,flat:true}]
   }
  });
  tbZsolnayRoof(-1.8,yRoof,-1.1,10.6,12.0,{mode:'hip',over:.66,spire:true,lanternR:1.75,lanternH:4.8});

  tbTarget(-1.8,y1,5.8,'corner-sentry-porch',true);
  tbTarget(-1.8,y1,-1.1,'corner-guard-chamber',true);
  tbTarget(4.8,y1,2.2,'corner-apron',false);

  tbFurnList([
   ['tb_ustun_daybed',-4.4,y1,-4.2,0],
   ['tb_syndic_ledger_desk',.2,y1,-3.8,0],
   ['tb_zeer_cold_rack',-4.6,y1,1.6,0],
   ['tb_bonded_bale_stack',.4,y1,1.6,PI],
   ['tb_brass_lantern_stand',-1.8,y1,5.8,0]
  ]);
 }
});

/* 43. Twin-Turreted Shah-i-Zinda & Zsolnay City Gatehouse (Plates A1, B1 & B5) */
defBuilding({
 key:'tb_wall_gate',
 name:'Twin-Turreted Shah-i-Zinda and Zsolnay City Gatehouse',
 seed:10443,w:28,d:20,h:19.8,budget:114000,cut:true,
 front:{x:0,z:9.0,yaw:0},
 tags:{style:'urban',types:['military','infrastructure','civic'],role:'city-gate',job:'customs'},
 build(){
  const y1=.52,h1=4.4,y2=y1+h1,h2=3.4,yRoof=y2+h2;
  tbPorticoPlinth(24.0,15.4,y1,{stepW:4.8,stepRun:1.25});

  /* Monumental Shah-i-Zinda glazed-arch gate portal + twin flanking El Capricho drum-turrets! */
  tbPishtaqPortal(0,y1,6.0,0,7.8,6.8,{openW:3.8,openH:4.3,dep:1.6,door:false});
  tbWindTower(-9.8,4.8,1.95,y1,15.8,{pedH:4.2,block:true});
  tbWindTower(9.8,4.8,1.95,y1,15.8,{pedH:4.2,block:true});

  /* West & East customs/guardhouse casemate wings [-8.0..-2.4] & [2.4..8.0] flanking the central vaulted roadway! */
  for(const s of [-1,1]){
   const xA=s<0?-8.0:2.4,xB=s<0?-2.4:8.0,cx=(xA+xB)/2;
   tbWallRing(xA,-6.4,xB,4.6,y1,h1,{
    register:'hazarbaf',t:.48,
    holes:{
     s:[{at:cx,w:1.55,h:2.3,door:true,name:'gate-guard-'+(s<0?'w':'e')}],
     e:s<0?[{at:-1.0,w:1.55,h:2.3,door:true,name:'gate-passage-w'}]:[{at:-1.0,w:1.1,h:1.3,y:1.2,flat:true}],
     w:s>0?[{at:-1.0,w:1.55,h:2.3,door:true,name:'gate-passage-e'}]:[{at:-1.0,w:1.1,h:1.3,y:1.2,flat:true}],
     n:[{at:cx,w:1.2,h:1.3,y:1.2,flat:true}]
    }
   });
  }

  const st=tbInteriorStair(5.2,-3.8,y1,y2,0,{w:1.18});
  tbFloorSlab(0,y2,-.9,16.2,10.8,{mk:'floor',th:.2,hole:st});
  tbKundalCeiling(0,y2-.28,-.9,4.4,10.2,{mk:'kundal'});
  tbKundalCeiling(-5.2,y2-.28,-.9,5.0,10.2,{mk:'kundal'});

  /* Upper portcullis & customs gallery spanning right over the gate passage! */
  tbWallRing(-8.0,-6.2,8.0,4.4,y2,h2,{
   register:'secession',
   holes:{
    s:[{at:-4.8,w:1.5,h:1.5,y:.92},{at:0,w:1.7,h:1.55,y:.92,proj:.44},{at:4.8,w:1.5,h:1.5,y:.92}],
    n:[{at:-4.6,w:1.4,h:1.4,y:.95},{at:0,w:1.5,h:1.45,y:.95},{at:4.6,w:1.4,h:1.4,y:.95}]
   }
  });
  tbZsolnayRoof(0,yRoof,-.9,16.6,11.2,{mode:'hip',over:.72,dormer:true,lantern:true,lanternR:1.8,lanternH:4.0});
  tbBanner(-4.2,y1,7.2,5.4,{pal:'flag'});
  tbBanner(4.2,y1,7.2,5.4,{pal:'flag'});

  tbTarget(0,y1,-.9,'gate-breezeway-passage',true);
  tbTarget(-5.2,y1,-.9,'gate-west-customs-room',true);
  tbTarget(5.2,y1,2.6,'gate-east-guard-room',true);
  tbTarget(-2.0,y2,-.9,'gate-portcullis-gallery',true);

  tbFurnList([
   ['tb_syndic_ledger_desk',-5.2,y1,-2.8,0],
   ['tb_bonded_bale_stack',-5.2,y1,1.6,PI],
   ['tb_ganch_screen_bench',5.2,y1,-5.2,0],
   ['tb_syndic_ledger_desk',-2.6,y2,-2.6,0],
   ['tb_zeer_cold_rack',1.8,y2,1.8,PI],
   ['tb_brass_lantern_stand',-1.6,y1,3.2,0],
   ['tb_brass_lantern_stand',1.6,y1,-4.2,0]
  ]);
 }
});

/* 44. Ustun-Arcaded Garrison & Solar Watch-Minaret Compound */
defBuilding({
 key:'tb_barracks_court',
 name:'Ustun-Arcaded Garrison and Watch-Minaret Compound',
 seed:10444,w:26,d:22,h:18.8,budget:110000,cut:true,
 front:{x:-1.6,z:9.8,yaw:0},
 tags:{style:'urban',types:['military','civic'],role:'barracks'},
 build(){
  const y1=.54,h1=3.8,y2=y1+h1,h2=3.3,yRoof=y2+h2;
  tbPorticoPlinth(22.2,17.2,y1,{stepX:-1.6,stepW:3.6,stepRun:1.25});

  /* SE Watch-Minaret + breezy muster court [z = 2.0..8.0] + shadirvan cistern! */
  tbWindTower(8.4,5.6,1.85,y1,15.4,{hollow:true,pedH:3.8,doorName:'barracks-tower-door'});
  tbShadirvanPool(-6.4,5.2,3.8,2.6,y1+.28,.46,{jet:true});
  tbClaustraScreen(-10.4,8.0,-4.2,8.0,y1,2.6,{});

  tbUstunAyvan(-1.4,.8,18.2,2.4,y1,h1,{n:6,skipMid:1.8,ganchBack:true});
  tbWallRing(-10.6,-8.0,7.8,-.4,y1,h1,{
   register:'banded',
   holes:{
    s:[
     {at:-6.4,w:1.55,h:2.3,door:true,name:'barracks-west-dorm'},
     {at:-1.4,w:1.8,h:2.4,door:true,name:'barracks-mess-door'},
     {at:3.6,w:1.55,h:2.3,door:true,name:'barracks-armoury-door'}
    ],
    n:[{at:-6.0,w:1.35,h:1.35,y:1.0},{at:-1.4,w:1.35,h:1.35,y:1.0},{at:3.4,w:1.35,h:1.35,y:1.0}]
   }
  });

  const st=tbInteriorStair(4.8,-4.2,y1,y2,-PI/2,{w:1.2});
  tbFloorSlab(-1.4,y2,-4.2,18.0,7.4,{mk:'floor',th:.18,hole:st});
  tbKundalCeiling(-5.4,y2-.28,-4.2,9.2,6.8,{mk:'kundal'});

  tbWallRing(-10.4,-7.8,7.6,-.6,y2,h2,{
   register:'hazarbaf',
   holes:{
    s:[{at:-6.4,w:1.45,h:1.45,y:.95},{at:-1.4,w:1.55,h:1.5,y:.95},{at:3.6,w:1.45,h:1.45,y:.95}],
    n:[{at:-5.2,w:1.4,h:1.4,y:.95},{at:2.6,w:1.4,h:1.4,y:.95}]
   }
  });
  tbZsolnayRoof(-1.4,yRoof,-4.2,18.6,7.8,{mode:'hip',over:.7,lantern:true,lanternR:1.65,lanternH:3.6});

  tbTarget(-1.6,y1,5.2,'barracks-muster-court',false);
  tbTarget(8.4,y1,5.6,'barracks-watch-minaret',true);
  tbTarget(-5.4,y1,-4.2,'barracks-mess-armoury',true);
  tbTarget(-5.4,y2,-4.2,'barracks-upper-bunks',true);

  tbFurnList([
   ['tb_trencadis_table',-5.2,y1,-4.2,0],
   ['tb_ganch_screen_bench',-5.2,y1,-6.0,0],
   ['tb_bonded_bale_stack',-8.2,y1,-5.4,0],
   ['tb_ustun_daybed',-7.6,y2,-5.6,0],
   ['tb_ustun_daybed',-4.2,y2,-5.6,0],
   ['tb_brass_lantern_stand',2.4,y1,5.2,0]
  ]);
 }
});
