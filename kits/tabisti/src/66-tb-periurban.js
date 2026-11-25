// prefix: tb
/* ================================================================= URBAN TABISTI — ROW 5B: PERI-URBAN GROVES, PADDIES & KRAALS (10445..10450)
   10445. tb_orchard_estate      — Walled Date, Fig & Lac-Tree Orchard Press House (orchardmen)
   10446. tb_saltrice_manor      — Lakeside Salt-Rice Paddy & Wet-Bed Farmstead (farmhands, chinampa growers)
   10447. tb_buffalo_byre        — Claustra-Ventilated Water-Buffalo Dairy & Duck Court (dairymen, swineherds/duck keepers)
   10448. tb_beetle_lizard_kraal — Dense-Air Carapace-Beetle & Pack-Lizard Kraal (beetle herders)
   10449. tb_cellar_fungus       — Evaporative-Cooled Brick Dark-Vault Fungus House (mushroom growers)
   10450. tb_fish_curing_pier    — Glazed-Roof Salt-Fish Curing & Smoking Pier (fishers) */

/* 45. Walled Date, Fig & Lac-Tree Orchard Press House */
defBuilding({
 key:'tb_orchard_estate',
 name:'Walled Date Fig and Lac-Tree Orchard Press House',
 seed:10445,w:22,d:20,h:14.8,budget:88000,cut:true,
 front:{x:0,z:9.0,yaw:0},
 tags:{style:'urban',types:['farm'],role:'orchard',job:'farming'},
 build(){
  const y1=.48,h1=3.7,yRoof=y1+h1;
  tbPorticoPlinth(18.4,15.4,y1,{stepW:3.0,stepRun:1.2});

  /* Irrigated orchard grove court [z = 2.0..7.2] with raised lac/date tree planters + shadirvan rill! */
  tbShadirvanPool(0,4.8,4.6,2.2,y1+.26,.4,{river:{name:'orchard-rill',axis:'x',speed:.26}});
  svNoWalk(()=>{
   for(const sx of [-6.4,6.4]){
    box('rosebrick',sx,y1+.01,4.8,2.2,.42,2.2,P('rosebrick'));
    box('earth',sx,y1+.43,4.8,1.9,.08,1.9,P('earth'));
    cyl('ustun',sx,y1+.5,4.8,.18,2.4,P('ustun'),8,.12);
    sph('foliage',sx,y1+3.2,4.8,1.25,P('foliage'),1,10);
   }
  });
  tbClaustraScreen(-8.8,7.3,-2.4,7.3,y1,2.2,{});
  tbClaustraScreen(2.4,7.3,8.8,7.3,y1,2.2,{});

  tbUstunAyvan(0,1.4,16.8,2.4,y1,h1,{n:6,skipMid:1.6,ganchBack:true});
  tbWallRing(-8.6,-6.8,8.6,.2,y1,h1,{
   register:'banded',
   holes:{
    s:[{at:-4.4,w:1.5,h:2.25,door:true,name:'orchard-press-door'},{at:1.8,w:1.65,h:2.3,door:true,name:'orchard-house-door'}],
    n:[{at:-4.2,w:1.3,h:1.35,y:1.0},{at:3.6,w:1.3,h:1.35,y:1.0}]
   }
  });
  tbZsolnayRoof(0,yRoof,-3.3,17.6,7.4,{mk:'escata',mode:'hip',over:.68,spire:true,lanternR:1.45,lanternH:3.5});

  tbTarget(-3.6,y1,4.8,'orchard-irrigated-court',false);
  tbTarget(0,y1,1.4,'orchard-pressing-ayvan',true);
  tbTarget(0,y1,-3.3,'orchard-storeroom',true);

  tbFurnList([
   ['tb_lac_curing_vat',-5.2,y1,-3.6,0],
   ['tb_zeer_cold_rack',-.8,y1,-4.4,0],
   ['tb_ustun_daybed',4.8,y1,-4.2,0],
   ['tb_tea_samovar_low',3.2,y1,1.4,0],
   ['tb_bonded_bale_stack',-4.8,y1,1.4,0]
  ]);
 }
});

/* 46. Lakeside Salt-Rice Paddy & Wet-Bed Farmstead */
defBuilding({
 key:'tb_saltrice_manor',
 name:'Lakeside Salt-Rice Paddy and Wet-Bed Farmstead',
 seed:10446,w:24,d:20,h:14.6,budget:88000,cut:true,
 front:{x:0,z:9.0,yaw:0},
 tags:{style:'urban',types:['farm'],role:'chinampa',job:'farming'},
 build(){
  const y1=.52,h1=3.7,yRoof=y1+h1;
  tbPorticoPlinth(20.4,15.4,y1,{stepW:3.2,stepRun:1.2});

  /* Twin flooded chinampa / salt-rice terrace beds in forecourt wired to core/water! */
  tbShadirvanPool(-5.4,4.4,6.2,3.4,y1+.24,.36,{river:{name:'saltrice-bed-w',axis:'x',speed:.2}});
  tbShadirvanPool(5.4,4.4,6.2,3.4,y1+.24,.36,{river:{name:'saltrice-bed-e',axis:'x',speed:.2}});

  tbUstunAyvan(0,1.2,18.8,2.4,y1,h1,{n:7,skipMid:1.8,ganchBack:false});
  tbWallRing(-9.4,-6.8,9.4,0,y1,h1,{
   register:'banded',
   holes:{
    s:[{at:-4.8,w:1.55,h:2.25,door:true,name:'paddy-granary-door'},{at:0,w:1.7,h:2.3,door:true,name:'paddy-manor-door'},{at:4.8,w:1.55,h:2.25,door:true,name:'paddy-tool-door'}],
    n:[{at:-4.6,w:1.35,h:1.35,y:1.0},{at:4.6,w:1.35,h:1.35,y:1.0}]
   }
  });
  tbZsolnayRoof(0,yRoof,-3.4,19.2,7.2,{mode:'hip',over:.68,lantern:true,lanternR:1.5,lanternH:3.3});

  tbTarget(0,y1,4.4,'saltrice-sluice-walk',false);
  tbTarget(0,y1,1.2,'saltrice-drying-veranda',true);
  tbTarget(0,y1,-3.4,'saltrice-granary-hall',true);

  tbFurnList([
   ['tb_bonded_bale_stack',-6.2,y1,-3.8,0],
   ['tb_zeer_cold_rack',-1.8,y1,-4.4,0],
   ['tb_ustun_daybed',4.8,y1,-4.2,0],
   ['tb_trencadis_table',0,y1,1.2,0],
   ['tb_potash_pan_trough',6.0,y1,-1.6,PI]
  ]);
 }
});

/* 47. Claustra-Ventilated Water-Buffalo Dairy & Duck Court */
defBuilding({
 key:'tb_buffalo_byre',
 name:'Claustra-Ventilated Water-Buffalo Dairy and Duck Court',
 seed:10447,w:22,d:20,h:14.2,budget:84000,cut:true,
 front:{x:0,z:9.0,yaw:0},
 tags:{style:'urban',types:['farm'],role:'dairy-byre',job:'dairy'},
 build(){
  const y1=.48,h1=3.85,yRoof=y1+h1;
  tbPorticoPlinth(18.4,15.4,y1,{stepW:3.2,stepRun:1.2});

  /* Wallowing & marsh-duck cooling pool + perforated brick claustra enclosure! */
  tbShadirvanPool(-4.6,4.4,5.2,3.2,y1+.24,.42,{});
  tbClaustraScreen(-8.8,7.3,-2.2,7.3,y1,2.1,{});
  tbClaustraScreen(2.2,7.3,8.8,7.3,y1,2.1,{});

  tbUstunAyvan(0,1.2,17.0,2.4,y1,h1,{n:6,skipMid:1.8});
  tbWallRing(-8.6,-6.8,8.6,0,y1,h1,{
   register:'banded',
   holes:{
    s:[{at:-4.4,w:1.9,h:2.5,door:true,name:'byre-stall-door'},{at:3.2,w:1.6,h:2.3,door:true,name:'byre-dairy-door'}],
    n:[{at:-4.2,w:1.4,h:1.35,y:1.1},{at:3.2,w:1.4,h:1.35,y:1.1}]
   }
  });
  tbClaustraScreen(-8.6,-5.2,-8.6,-1.4,y1+1.0,1.8,{block:false});
  tbZsolnayRoof(0,yRoof,-3.4,17.6,7.2,{mode:'hip',over:.68,lantern:true,lanternR:1.5,lanternH:3.2});

  tbTarget(3.6,y1,4.4,'byre-duck-yard',false);
  tbTarget(0,y1,1.2,'byre-shaded-veranda',true);
  tbTarget(0,y1,-3.4,'byre-dairy-churn-room',true);

  tbFurnList([
   ['tb_potash_pan_trough',-5.2,y1,-3.8,0],
   ['tb_zeer_cold_rack',2.2,y1,-4.4,0],
   ['tb_zeer_cold_rack',5.6,y1,-4.4,0],
   ['tb_bonded_bale_stack',-1.4,y1,-4.0,0],
   ['tb_trencadis_table',3.6,y1,1.2,0]
  ]);
 }
});

/* 48. Dense-Air Carapace-Beetle & Pack-Lizard Kraal */
defBuilding({
 key:'tb_beetle_lizard_kraal',
 name:'Dense-Air Carapace-Beetle and Pack-Lizard Kraal',
 seed:10448,w:24,d:20,h:15.2,budget:86000,cut:true,
 front:{x:0,z:9.0,yaw:0},
 tags:{style:'urban',types:['farm'],role:'beetle-kraal',job:'herding'},
 build(){
  const y1=.48,h1=4.0,yRoof=y1+h1;
  tbPorticoPlinth(20.4,15.4,y1,{stepW:3.6,stepRun:1.2});

  /* Heavy ashlar & claustra corral walls + shaded watering basin for harness beetles & lizards */
  tbShadirvanPool(5.2,4.4,4.8,2.8,y1+.26,.42,{});
  for(const s of [-1,1]){
   tbClaustraScreen(s<0?-9.4:2.4,7.2,s<0?-2.4:9.4,7.2,y1,2.2,{});
   tbClaustraScreen(s*9.4,1.2,s*9.4,7.0,y1,2.2,{});
  }

  tbWallRing(-9.4,-6.8,9.4,1.0,y1,h1,{
   register:'banded',
   holes:{
    s:[
     {at:-5.0,w:2.1,h:2.7,door:true,name:'kraal-west-pen'},
     {at:0,w:2.1,h:2.7,door:true,name:'kraal-center-pen'},
     {at:5.0,w:1.6,h:2.3,door:true,name:'kraal-tack-room'}
    ],
    n:[{at:-4.8,w:1.4,h:1.3,y:1.2},{at:4.8,w:1.4,h:1.3,y:1.2}]
   }
  });
  tbZsolnayRoof(0,yRoof,-2.9,19.4,8.2,{mode:'hip',over:.68,lantern:true,lanternR:1.65,lanternH:3.6});

  tbTarget(-3.6,y1,4.4,'kraal-paddock-court',false);
  tbTarget(0,y1,-2.9,'kraal-vaulted-stalls',true);

  tbFurnList([
   ['tb_potash_pan_trough',-5.6,y1,-3.8,0],
   ['tb_potash_pan_trough',-.4,y1,-3.8,0],
   ['tb_bonded_bale_stack',5.2,y1,-4.2,0],
   ['tb_syndic_ledger_desk',5.2,y1,-.8,PI],
   ['tb_brass_lantern_stand',-3.6,y1,4.4,0]
  ]);
 }
});

/* 49. Evaporative-Cooled Brick Dark-Vault Fungus House */
defBuilding({
 key:'tb_cellar_fungus',
 name:'Evaporative-Cooled Brick Dark-Vault Fungus House',
 seed:10449,w:18,d:18,h:15.8,budget:80000,cut:true,
 front:{x:-1.6,z:8.0,yaw:0},
 tags:{style:'urban',types:['farm','industry'],role:'mushroom-vault',job:'fungiculture'},
 build(){
  const y1=.52,h1=3.75,yRoof=y1+h1;
  tbPorticoPlinth(14.4,13.6,y1,{stepX:-1.6,stepW:2.8,stepRun:1.2});

  /* Windowless thick double-brick dark-grown mushroom vault + solar draft exhaust tower + evaporative intake basin! */
  tbWindTower(4.8,3.4,1.5,y1,12.2,{pedH:2.5,block:true});
  tbShadirvanPool(-4.6,4.4,3.4,2.2,y1+.26,.42,{});

  tbWallRing(-6.8,-6.2,2.8,2.4,y1,h1,{
   register:'hazarbaf',t:.52,
   holes:{
    s:[{at:-1.8,w:1.6,h:2.25,door:true,name:'fungus-vault-door'}],
    e:[{at:-1.8,w:1.45,h:2.2,door:true,name:'fungus-packing-door'}]
   }
  });
  tbZsolnayRoof(-2.0,yRoof,-1.9,10.2,9.0,{mode:'hip',over:.66,lantern:true,lanternR:1.3,lanternH:2.9});

  tbTarget(1.2,y1,4.4,'fungus-cooling-forecourt',false);
  tbTarget(-2.0,y1,-1.9,'fungus-dark-vault',true);

  tbFurnList([
   ['tb_potash_pan_trough',-4.6,y1,-4.0,0],
   ['tb_potash_pan_trough',-.2,y1,-4.0,0],
   ['tb_potash_pan_trough',-4.6,y1,-.8,0],
   ['tb_zeer_cold_rack',.4,y1,-.6,PI],
   ['tb_bonded_bale_stack',4.4,y1,-.8,0]
  ]);
 }
});

/* 50. Glazed-Roof Salt-Fish Curing & Smoking Pier */
defBuilding({
 key:'tb_fish_curing_pier',
 name:'Glazed-Roof Salt-Fish Curing and Smoking Pier',
 seed:10450,w:22,d:20,h:15.4,budget:86000,cut:true,
 front:{x:-2.2,z:9.0,yaw:0},
 tags:{style:'urban',types:['farm','infrastructure'],role:'fish-pier',job:'fishing'},
 build(){
  const y1=.52,h1=3.8,yRoof=y1+h1;
  tbPorticoPlinth(18.4,15.4,y1,{stepX:-2.2,stepW:3.0,stepRun:1.2});

  /* North salt-lake boat slip [z = -7.2..-3.6] + smoking flue tower (5.8, 3.2)! */
  tbShadirvanPool(0,-5.4,17.2,3.4,y1+.22,.62,{river:{name:'fish-pier-slip',axis:'x',speed:.35}});
  tbWindTower(5.8,3.2,1.45,y1,11.6,{pedH:2.4,block:true});

  /* Breezy ustun drying porch [z = 2.8..6.2] + salt-curing shed [-8.6..3.2, -3.2..2.8] */
  tbUstunAyvan(-2.7,4.5,11.4,3.2,y1,h1,{n:4,ganchBack:false});
  tbWallRing(-8.6,-3.2,3.2,2.8,y1,h1,{
   register:'banded',
   holes:{
    s:[{at:-2.7,w:1.7,h:2.3,door:true,name:'fish-pier-front-door'}],
    n:[{at:-2.7,w:1.65,h:2.25,door:true,name:'fish-pier-slip-door'}],
    e:[{at:0,w:1.45,h:2.2,door:true,name:'fish-pier-smoke-door'}]
   }
  });
  tbZsolnayRoof(-2.7,yRoof,-.2,12.2,6.4,{mk:'escata',mode:'gable',gableAxis:'x',over:.66});

  tbTarget(-2.7,y1,4.5,'fish-drying-porch',true);
  tbTarget(-2.7,y1,-.2,'fish-salt-curing-shed',true);

  tbFurnList([
   ['tb_potash_pan_trough',-5.8,y1,-.8,0],
   ['tb_potash_pan_trough',-.4,y1,-.8,0],
   ['tb_zeer_cold_rack',-6.2,y1,4.5,0],
   ['tb_trencadis_table',.2,y1,4.5,0],
   ['tb_bonded_bale_stack',5.6,y1,-.6,0]
  ]);
 }
});
