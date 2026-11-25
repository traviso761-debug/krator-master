// prefix: tb
/* ================================================================= URBAN TABISTI — ROW 2: BAZAAR, GUILD CRAFTS & SIGNATURE WORKS (10412..10421)
   10412. tb_souq_arcade        — Vaulted Trencadis-Lantern Bazaar Arcade (market traders, shopkeepers)
   10413. tb_kashi_kiln         — Alkaline-Teal Kashi & Zsolnay Fritware Kiln Yard (pottery, smiths/craftsmen, industrial)
   10414. tb_lac_refinery       — Liikofi Open-Columned Abyss-Lac & Rubber Refinery (industrial, alchemy)
   10415. tb_incense_distillery — Rosewater, Incense & Abyssal Botanical Still-House (brewers)
   10416. tb_ganch_mason_yard   — Gypsum Ganch Carving Loggia & Hazarbaf Brickyard (quarrymen and masons)
   10417. tb_bronze_foundry     — Verdigris-Bronze & Gilt Casting Foundry (smiths and craftsmen)
   10418. tb_potash_evaporator  — Brine-Pan Afan & Potash Crystallization Pavilion (miners, salt)
   10419. tb_weaver_dyehouse    — Silk & Indigo/Teal Dye-Vat Court & Drying Gallery (weavers and dyers)
   10420. tb_tannery_airy       — Open-Arch Lakeshore Hide & Reed-Mat Curing Shed (tanners)
   10421. tb_bakery_tannur      — Glazed-Flue Brick Tannur Bakery & Shaded Counter (bakers) */

/* 12. Vaulted Trencadis-Lantern Bazaar Arcade */
defBuilding({
 key:'tb_souq_arcade',
 name:'Vaulted Trencadis-Lantern Bazaar Arcade',
 seed:10412,w:26,d:20,h:16.2,budget:112000,cut:true,
 front:{x:0,z:9.0,yaw:0},
 tags:{style:'urban',types:['market','shop'],role:'souq',job:'trading',market:true},
 build(){
  const y1=.48,h1=4.2,yRoof=y1+h1;
  tbPorticoPlinth(22.2,15.4,y1,{stepW:4.2,stepRun:1.2});

  /* Shah-i-Zinda south & north bazaar portals + catenary silk sun-awnings */
  tbPishtaqPortal(0,y1,6.8,0,6.8,5.6,{openW:3.4,openH:3.8,dep:1.5,door:false});
  tbSunVelarium(-8.5,7.4,-3.8,7.4,y1+3.6,1.8,{pal:'silk'});
  tbSunVelarium(3.8,7.4,8.5,7.4,y1+3.6,1.8,{pal:'silkRose'});

  /* Flanking arcaded bazaar merchant vaults [-10.6..-2.8] & [2.8..10.6] with central cross-ventilated passage! */
  for(const s of [-1,1]){
   const xA=s<0?-10.6:2.8,xB=s<0?-2.8:10.6,cx=(xA+xB)/2;
   tbWallRing(xA,-6.8,xB,6.2,y1,h1,{
    register:'hazarbaf',
    holes:{
     s:[{at:cx,w:1.65,h:2.35,door:true,name:'souq-front-'+(s<0?'w':'e')}],
     e:s<0?[{at:0,w:1.65,h:2.35,door:true,name:'souq-aisle-w'}]:[{at:0,w:1.35,h:1.4,y:1.0}],
     w:s>0?[{at:0,w:1.65,h:2.35,door:true,name:'souq-aisle-e'}]:[{at:0,w:1.35,h:1.4,y:1.0}],
     n:[{at:cx,w:1.35,h:1.4,y:1.0}]
    }
   });
  }
  /* Continuous Zsolnay bazaar roof spanning both wings + central breeze aisle with twin B4 trencadis wind-scoop lanterns! */
  tbZsolnayRoof(0,yRoof,-.3,21.8,13.6,{mode:'hip',over:.72,lantern:true,lanternR:1.95,lanternH:4.2});

  tbTarget(0,y1,0,'souq-central-breezeway',true);
  tbTarget(-6.7,y1,-.3,'souq-west-stall-vault',true);
  tbTarget(6.7,y1,-.3,'souq-east-stall-vault',true);

  tbFurnList([
   ['tb_syndic_ledger_desk',-6.7,y1,-2.8,0],
   ['tb_kashi_tile_rack',-6.7,y1,2.6,PI],
   ['tb_bonded_bale_stack',6.7,y1,-2.8,0],
   ['tb_trencadis_table',6.7,y1,2.2,0],
   ['tb_brass_lantern_stand',-1.8,y1,3.2,0],
   ['tb_brass_lantern_stand',1.8,y1,-3.2,0]
  ]);
 }
});

/* 13. Alkaline-Teal Kashi & Zsolnay Fritware Kiln Yard */
defBuilding({
 key:'tb_kashi_kiln',
 name:'Alkaline-Teal Kashi and Zsolnay Fritware Kiln Yard',
 seed:10413,w:24,d:20,h:17.2,budget:102000,cut:true,
 front:{x:-2.2,z:9.0,yaw:0},
 tags:{style:'urban',types:['industry','shop'],role:'kiln-yard',job:'pottery'},
 build(){
  const y1=.48,h1=3.8,yRoof=y1+h1;
  tbPorticoPlinth(20.2,15.4,y1,{stepX:-2.2,stepW:3.2,stepRun:1.2});

  /* Twin glazed-crown bottle-kiln updraft towers on the east yard (5.8, -3.2) & (5.8, 3.2)! */
  tbWindTower(5.8,-3.2,1.65,y1,13.2,{pedH:2.8,block:true});
  tbWindTower(5.8,3.2,1.5,y1,11.8,{pedH:2.6,block:true});
  tbClaustraScreen(2.2,7.2,9.4,7.2,y1,2.4,{});

  /* Glaze-mixing & tile-molding hall [-9.6..2.0, -6.8..3.2] + open ustun drying veranda [z = 3.2..6.8] */
  tbUstunAyvan(-3.8,5.0,11.4,3.4,y1,h1,{n:4,ganchBack:false});
  tbWallRing(-9.6,-6.8,2.0,3.2,y1,h1,{
   register:'banded',
   holes:{
    s:[{at:-3.8,w:1.75,h:2.35,door:true,name:'kiln-hall-door'}],
    e:[{at:-1.8,w:1.5,h:2.25,door:true,name:'kiln-yard-door'}],
    n:[{at:-6.4,w:1.3,h:1.35,y:1.0},{at:-1.2,w:1.3,h:1.35,y:1.0}],
    w:[{at:-1.8,w:1.3,h:1.35,y:1.0}]
   }
  });
  tbZsolnayRoof(-3.8,yRoof,-1.8,12.0,10.4,{mode:'hip',over:.68,lantern:true,lanternR:1.4,lanternH:3.1});

  tbTarget(2.8,y1,0,'kiln-firing-court',false);
  tbTarget(-3.8,y1,5.0,'kiln-drying-ayvan',true);
  tbTarget(-3.8,y1,-1.8,'kiln-glaze-workshop',true);

  tbFurnList([
   ['tb_kashi_tile_rack',-6.8,y1,-4.2,0],
   ['tb_kashi_tile_rack',-3.2,y1,-4.2,0],
   ['tb_potash_pan_trough',-6.4,y1,.4,0],
   ['tb_kashi_tile_rack',-5.8,y1,5.0,0],
   ['tb_syndic_ledger_desk',-.6,y1,1.0,PI]
  ]);
 }
});

/* 14. Liikofi Open-Columned Abyss-Lac & Rubber Refinery */
defBuilding({
 key:'tb_lac_refinery',
 name:'Liikofi Open-Columned Abyss-Lac and Rubber Refinery',
 seed:10414,w:24,d:20,h:15.4,budget:98000,cut:true,
 front:{x:0,z:9.0,yaw:0},
 tags:{style:'urban',types:['industry'],role:'lac-refinery',job:'alchemy'},
 build(){
  const y1=.5,h1=4.0,yRoof=y1+h1;
  tbPorticoPlinth(20.2,15.4,y1,{stepW:3.2,stepRun:1.2});

  /* Open-sided 8-column ustun boiling & resin-straining pavilion [-9.6..0.4, -5.8..6.4] dispersing heat & fumes! */
  tbUstunAyvan(-4.6,3.4,9.8,5.8,y1,h1,{n:4,ceilMk:'lacquer'});
  tbUstunAyvan(-4.6,-2.6,9.8,5.8,y1,h1,{n:4,flip:true,ceilMk:'lacquer'});
  tbZsolnayRoof(-4.6,yRoof,.4,10.4,12.4,{mode:'hip',over:.68,lantern:true,lanternR:1.55,lanternH:3.6});

  /* Sealed brick & kashi lacquer curing & cask vault [1.2..9.6, -6.4..6.4] */
  tbWallRing(1.2,-6.4,9.6,6.4,y1,h1,{
   register:'hazarbaf',
   holes:{
    s:[{at:5.4,w:1.65,h:2.3,door:true,name:'lac-vault-front'}],
    w:[{at:0,w:1.6,h:2.3,door:true,name:'lac-vault-side'}],
    n:[{at:5.4,w:1.3,h:1.35,y:1.05}]
   }
  });
  tbClaustraScreen(9.6,-3.2,9.6,3.2,y1+.8,1.8,{block:false});
  tbZsolnayRoof(5.4,yRoof,0,8.8,13.2,{mode:'hip',over:.66,spire:true,lanternR:1.25,lanternH:3.2});

  tbTarget(-4.6,y1,.4,'lac-open-boiling-pavilion',true);
  tbTarget(5.4,y1,0,'lac-cask-curing-vault',true);

  tbFurnList([
   ['tb_lac_curing_vat',-6.4,y1,2.4,0],
   ['tb_lac_curing_vat',-2.8,y1,2.4,0],
   ['tb_lac_curing_vat',-4.6,y1,-2.4,0],
   ['tb_bonded_bale_stack',5.4,y1,-3.6,0],
   ['tb_syndic_ledger_desk',5.4,y1,2.8,PI]
  ]);
 }
});

/* 15. Rosewater, Incense & Abyssal Botanical Still-House */
defBuilding({
 key:'tb_incense_distillery',
 name:'Rosewater Incense and Botanical Still-House',
 seed:10415,w:20,d:18,h:15.6,budget:88000,cut:true,
 front:{x:0,z:8.0,yaw:0},
 tags:{style:'urban',types:['industry','shop'],role:'distillery',job:'brewing'},
 build(){
  const y1=.48,h1=3.9,yRoof=y1+h1;
  tbPorticoPlinth(16.2,13.6,y1,{stepW:3.0,stepRun:1.15});

  tbRecessedLoggia(0,y1,4.8,0,4.8,h1,2.2,{});
  tbShadirvanPool(-5.2,4.8,2.8,2.2,y1+.26,.4,{jet:true});

  tbWallRing(-7.6,-6.2,7.6,3.6,y1,h1,{
   register:'secession',
   holes:{
    s:[{at:0,w:1.7,h:2.35,door:true,name:'still-front-door'},{at:4.6,w:1.35,h:1.4,y:1.0}],
    n:[{at:-3.6,w:1.35,h:1.4,y:1.0},{at:3.6,w:1.35,h:1.4,y:1.0}],
    e:[{at:-1.2,w:1.35,h:1.4,y:1.0}],
    w:[{at:-1.2,w:1.35,h:1.4,y:1.0}]
   }
  });
  tbZsolnayRoof(0,yRoof,-1.3,15.6,10.2,{mode:'hip',over:.7,lantern:true,lanternR:1.75,lanternH:4.0});

  tbTarget(0,y1,4.8,'still-tasting-loggia',true);
  tbTarget(0,y1,-1.3,'still-alembic-hall',true);

  tbFurnList([
   ['tb_incense_alembic',-4.4,y1,-3.4,0],
   ['tb_incense_alembic',0,y1,-3.4,0],
   ['tb_zeer_cold_rack',4.4,y1,-3.4,0],
   ['tb_syndic_ledger_desk',3.8,y1,1.2,PI],
   ['tb_tea_samovar_low',-3.8,y1,1.2,0]
  ]);
 }
});

/* 16. Gypsum Ganch Carving Loggia & Hazarbaf Brickyard */
defBuilding({
 key:'tb_ganch_mason_yard',
 name:'Gypsum Ganch Carving Loggia and Hazarbaf Brickyard',
 seed:10416,w:22,d:18,h:14.2,budget:86000,cut:true,
 front:{x:0,z:8.0,yaw:0},
 tags:{style:'urban',types:['industry'],role:'mason-yard',job:'quarrying'},
 build(){
  const y1=.48,h1=3.75,yRoof=y1+h1;
  tbPorticoPlinth(18.4,13.6,y1,{stepW:3.2,stepRun:1.15});

  /* Wide dry ustun carving loggia [z = 1.6..5.8] with showcase sheltered ganch panels! */
  tbUstunAyvan(-2.4,3.7,12.6,4.0,y1,h1,{n:5,ganchBack:true});
  tbClaustraScreen(4.6,5.8,8.8,5.8,y1,2.3,{});
  tbWindTower(6.8,3.4,1.35,y1,9.8,{pedH:2.4,block:true});

  tbWallRing(-8.8,-6.2,4.0,1.6,y1,h1,{
   register:'hazarbaf',
   holes:{
    s:[{at:-2.4,w:1.7,h:2.3,door:true,name:'mason-hall-door'}],
    e:[{at:-2.2,w:1.5,h:2.25,door:true,name:'mason-yard-door'}],
    n:[{at:-5.2,w:1.3,h:1.35,y:1.0},{at:.6,w:1.3,h:1.35,y:1.0}]
   }
  });
  tbZsolnayRoof(-2.4,yRoof,-2.3,13.2,8.2,{mode:'hip',over:.66,lantern:true,lanternR:1.35,lanternH:3.0});

  tbTarget(-2.4,y1,3.7,'ganch-carving-loggia',true);
  tbTarget(-2.4,y1,-2.3,'gypsum-store-vault',true);
  tbTarget(6.4,y1,-1.8,'brick-calcining-yard',false);

  tbFurnList([
   ['tb_ganch_screen_bench',-5.2,y1,3.6,0],
   ['tb_kashi_tile_rack',-5.8,y1,-3.8,0],
   ['tb_potash_pan_trough',-.4,y1,-3.8,0],
   ['tb_bonded_bale_stack',6.4,y1,-3.2,0],
   ['tb_syndic_ledger_desk',.6,y1,3.6,0]
  ]);
 }
});

/* 17. Verdigris-Bronze & Gilt Casting Foundry */
defBuilding({
 key:'tb_bronze_foundry',
 name:'Verdigris-Bronze and Gilt Casting Foundry',
 seed:10417,w:22,d:18,h:16.8,budget:94000,cut:true,
 front:{x:-1.8,z:8.0,yaw:0},
 tags:{style:'urban',types:['industry','shop'],role:'foundry',job:'smithing'},
 build(){
  const y1=.5,h1=3.95,yRoof=y1+h1;
  tbPorticoPlinth(18.4,13.6,y1,{stepX:-1.8,stepW:3.0,stepRun:1.2});

  /* Plate A5 verdigris columns on front gallery + tall solar furnace-draft chimney tower! */
  tbUstunAyvan(-2.8,4.0,11.6,3.4,y1,h1,{n:4,verdigris:true,ganchBack:false});
  tbWindTower(6.2,2.8,1.7,y1,13.2,{pedH:2.8,block:true});

  tbWallRing(-8.8,-6.2,3.2,2.2,y1,h1,{
   register:'banded',
   holes:{
    s:[{at:-2.8,w:1.75,h:2.35,door:true,name:'foundry-front-door'}],
    e:[{at:-2.0,w:1.55,h:2.25,door:true,name:'foundry-yard-door'}],
    n:[{at:-5.6,w:1.35,h:1.35,y:1.0},{at:0,w:1.35,h:1.35,y:1.0}],
    w:[{at:-2.0,w:1.35,h:1.35,y:1.0}]
   }
  });
  tbClaustraScreen(3.4,-6.0,8.6,-6.0,y1,2.5,{});
  tbZsolnayRoof(-2.8,yRoof,-2.0,12.4,8.8,{mode:'hip',over:.68,lantern:true,lanternR:1.45,lanternH:3.3});

  tbTarget(-2.8,y1,4.0,'foundry-verdigris-portico',true);
  tbTarget(-2.8,y1,-2.0,'foundry-casting-floor',true);
  tbTarget(6.0,y1,-2.2,'foundry-patination-yard',false);

  tbFurnList([
   ['tb_lac_curing_vat',-5.8,y1,-3.4,0],
   ['tb_potash_pan_trough',-.4,y1,-3.6,0],
   ['tb_brass_lantern_stand',-5.6,y1,4.0,0],
   ['tb_brass_lantern_stand',0,y1,4.0,0],
   ['tb_syndic_ledger_desk',-5.2,y1,.4,0]
  ]);
 }
});

/* 18. Brine-Pan Afan & Potash Crystallization Pavilion */
defBuilding({
 key:'tb_potash_evaporator',
 name:'Brine-Pan Afan and Potash Crystallization Pavilion',
 seed:10418,w:24,d:20,h:14.4,budget:92000,cut:true,
 front:{x:0,z:9.0,yaw:0},
 tags:{style:'urban',types:['industry'],role:'potash-works',job:'salt'},
 build(){
  const y1=.48,h1=3.75,yRoof=y1+h1;
  tbPorticoPlinth(20.4,15.4,y1,{stepW:3.2,stepRun:1.2});

  /* Twin solar salt/potash brine evaporation pans (afan) in south yard wired to core/water! */
  tbShadirvanPool(-5.2,4.2,6.4,3.4,y1+.26,.38,{river:{name:'potash-pan-w',axis:'x',speed:.22}});
  tbShadirvanPool(5.2,4.2,6.4,3.4,y1+.26,.38,{river:{name:'potash-pan-e',axis:'x',speed:.22}});

  /* Rear claustra-ventilated potash crystallization & bagging vault [-9.4..9.4, -6.8..1.2] */
  tbWallRing(-9.4,-6.8,9.4,1.2,y1,h1,{
   register:'banded',
   holes:{
    s:[
     {at:-4.8,w:1.55,h:2.25,door:true,name:'potash-west-door'},
     {at:0,w:1.8,h:2.35,door:true,name:'potash-main-door'},
     {at:4.8,w:1.55,h:2.25,door:true,name:'potash-east-door'}
    ],
    n:[{at:-4.8,w:1.4,h:1.4,y:1.0},{at:4.8,w:1.4,h:1.4,y:1.0}]
   }
  });
  tbClaustraScreen(-9.4,-4.2,-9.4,-.8,y1+.8,1.8,{block:false});
  tbClaustraScreen(9.4,-4.2,9.4,-.8,y1+.8,1.8,{block:false});
  tbZsolnayRoof(0,yRoof,-2.8,19.2,8.4,{mode:'hip',over:.68,lantern:true,lanternR:1.6,lanternH:3.5});

  tbTarget(0,y1,4.2,'potash-brine-apron',false);
  tbTarget(0,y1,-2.8,'potash-crystallization-hall',true);

  tbFurnList([
   ['tb_potash_pan_trough',-5.6,y1,-3.8,0],
   ['tb_potash_pan_trough',0,y1,-3.8,0],
   ['tb_bonded_bale_stack',5.6,y1,-3.8,0],
   ['tb_syndic_ledger_desk',3.2,y1,-.6,PI],
   ['tb_zeer_cold_rack',-4.2,y1,-.6,PI]
  ]);
 }
});

/* 19. Silk & Indigo-Teal Dye-Vat Court & Drying Gallery */
defBuilding({
 key:'tb_weaver_dyehouse',
 name:'Silk and Alkaline-Teal Dye-Vat Court and Drying Gallery',
 seed:10419,w:22,d:20,h:15.8,budget:96000,cut:true,
 front:{x:0,z:9.0,yaw:0},
 tags:{style:'urban',types:['industry','shop'],role:'dyehouse',job:'weaving'},
 build(){
  const y1=.48,h1=3.7,y2=y1+h1,h2=3.2,yRoof=y2+h2;
  tbPorticoPlinth(18.4,15.4,y1,{stepW:3.0,stepRun:1.2});

  /* Forecourt dye-rinsing pool + fluttering dyed silk banners! */
  tbShadirvanPool(-4.8,4.8,4.2,2.8,y1+.28,.44,{});
  tbBanner(5.2,y1,5.6,4.8,{pal:'silk'});
  tbBanner(7.0,y1,5.6,4.8,{pal:'silkRose'});
  tbSunVelarium(-6.0,5.2,2.0,5.2,y1+3.5,2.2,{pal:'silkSaffron'});

  /* Loom hall [-8.6..8.6, -6.8..1.8] + open upper breeze-drying ustun gallery! */
  tbWallRing(-8.6,-6.8,8.6,1.8,y1,h1,{
   register:'hazarbaf',
   holes:{
    s:[{at:0,w:1.75,h:2.35,door:true,name:'dyehouse-door'},{at:5.0,w:1.4,h:1.4,y:1.0}],
    n:[{at:-4.4,w:1.35,h:1.35,y:1.0},{at:4.4,w:1.35,h:1.35,y:1.0}]
   }
  });

  const st=tbInteriorStair(5.8,-2.5,y1,y2,-PI/2,{w:1.18});
  tbFloorSlab(0,y2,-2.5,17.0,8.4,{mk:'floor',th:.18,hole:st});
  tbKundalCeiling(-4.2,y2-.28,-2.5,8.0,7.8,{mk:'kundal'});
  tbParapet(-8.4,1.65,8.4,1.65,y2,{kind:'iron'});
  tbParapet(-8.4,-6.65,8.4,-6.65,y2,{kind:'iron'});

  /* Open-sided upper cloth-drying ustun pavilion! */
  tbUstunAyvan(0,-.8,16.8,3.2,y2,h2,{n:6});
  tbUstunAyvan(0,-4.3,16.8,3.2,y2,h2,{n:6,flip:true});
  tbZsolnayRoof(0,yRoof,-2.5,17.4,8.8,{mode:'hip',over:.7,lantern:true,lanternR:1.5,lanternH:3.3});

  tbTarget(1.8,y1,4.8,'dyehouse-vat-court',false);
  tbTarget(-1.4,y1,-2.5,'dyehouse-loom-hall',true);
  tbTarget(-1.4,y2,-2.5,'dyehouse-breeze-drying-loft',true);

  tbFurnList([
   ['tb_lac_curing_vat',4.2,y1,3.8,0],
   ['tb_bonded_bale_stack',-5.2,y1,-3.8,0],
   ['tb_syndic_ledger_desk',-1.2,y1,-3.8,0],
   ['tb_ganch_screen_bench',-4.2,y2,-2.5,0],
   ['tb_trencadis_table',-1.4,y2,-2.5,0]
  ]);
 }
});

/* 20. Open-Arch Lakeshore Hide & Reed-Mat Curing Shed */
defBuilding({
 key:'tb_tannery_airy',
 name:'Open-Arch Lakeshore Hide and Reed-Mat Curing Shed',
 seed:10420,w:20,d:18,h:16.2,budget:84000,cut:true,
 front:{x:-1.8,z:8.0,yaw:0},
 tags:{style:'urban',types:['industry'],role:'tannery',job:'tanning'},
 build(){
  const y1=.48,h1=3.8,yRoof=y1+h1;
  tbPorticoPlinth(16.4,13.6,y1,{stepX:-1.8,stepW:3.0,stepRun:1.15});

  /* Tall El Capricho draft chimney exhausting tanning-pit air high above street level + soaking trough! */
  tbWindTower(5.4,3.4,1.55,y1,12.6,{pedH:2.5,block:true});
  tbShadirvanPool(-4.4,4.2,4.4,2.4,y1+.26,.42,{});

  tbWallRing(-7.8,-6.2,3.4,1.6,y1,h1,{
   register:'banded',
   holes:{
    s:[{at:-2.2,w:1.7,h:2.3,door:true,name:'tannery-door'}],
    e:[{at:-2.2,w:1.5,h:2.25,door:true,name:'tannery-side-door'}],
    n:[{at:-4.8,w:1.35,h:1.35,y:1.0},{at:.4,w:1.35,h:1.35,y:1.0}]
   }
  });
  tbClaustraScreen(-7.8,-4.2,-7.8,-.4,y1+.8,1.8,{block:false});
  tbZsolnayRoof(-2.2,yRoof,-2.3,11.6,8.2,{mode:'hip',over:.66,lantern:true,lanternR:1.3,lanternH:3.0});

  tbTarget(1.2,y1,4.2,'tannery-soaking-yard',false);
  tbTarget(-2.2,y1,-2.3,'tannery-curing-hall',true);

  tbFurnList([
   ['tb_lac_curing_vat',-5.2,y1,-3.4,0],
   ['tb_potash_pan_trough',-.4,y1,-3.6,0],
   ['tb_bonded_bale_stack',-5.0,y1,-.2,0],
   ['tb_zeer_cold_rack',.8,y1,-.2,PI]
  ]);
 }
});

/* 21. Glazed-Flue Brick Tannur Bakery & Shaded Counter */
defBuilding({
 key:'tb_bakery_tannur',
 name:'Glazed-Flue Brick Tannur Bakery and Shaded Counter',
 seed:10421,w:18,d:18,h:15.4,budget:82000,cut:true,
 front:{x:-1.6,z:8.0,yaw:0},
 tags:{style:'urban',types:['shop','industry'],role:'bakery',job:'baking'},
 build(){
  const y1=.48,h1=3.75,yRoof=y1+h1;
  tbPorticoPlinth(14.4,13.6,y1,{stepX:-1.6,stepW:2.8,stepRun:1.15});

  /* Shaded front ustun bread-selling veranda + external glazed oven heat-flue tower! */
  tbUstunAyvan(-2.2,4.2,9.4,3.2,y1,h1,{n:4,ganchBack:true});
  tbWindTower(4.8,3.6,1.45,y1,11.8,{pedH:2.4,block:true});

  tbWallRing(-6.8,-6.2,2.8,2.6,y1,h1,{
   register:'secession',
   holes:{
    s:[{at:-2.0,w:1.65,h:2.3,door:true,name:'bakery-front-door'}],
    e:[{at:-1.8,w:1.45,h:2.2,door:true,name:'bakery-oven-door'}],
    n:[{at:-4.2,w:1.3,h:1.35,y:1.0},{at:.2,w:1.3,h:1.35,y:1.0}],
    w:[{at:-1.8,w:1.3,h:1.35,y:1.0}]
   }
  });
  tbZsolnayRoof(-2.0,yRoof,-1.8,10.0,9.2,{mk:'escata',mode:'gable',gableAxis:'z',over:.66});

  tbTarget(-2.2,y1,4.2,'bakery-bread-counter',true);
  tbTarget(-2.0,y1,-1.8,'bakery-tannur-room',true);

  tbFurnList([
   ['tb_tannur_oven',-4.4,y1,-3.8,0],
   ['tb_tannur_oven',-.2,y1,-3.8,0],
   ['tb_trencadis_table',-2.2,y1,4.2,0],
   ['tb_zeer_cold_rack',-4.6,y1,.4,0],
   ['tb_bonded_bale_stack',.4,y1,.4,PI]
  ]);
 }
});
