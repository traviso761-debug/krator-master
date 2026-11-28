// prefix: tb
/* ================================================================= URBAN TABISTI — ROW 3: PROVISIONING, CARAVANSERAI, MILLS & SALT-LAKE PORT (10422..10430)
   10422. tb_butcher_icehouse   — Evaporative-Cooled Brick & Zeer-Jar Meat Market (butchers)
   10423. tb_tea_tavern         — Two-Tier Ustun Ayvan Tea & Breeze Tavern (innkeepers and servers)
   10424. tb_caravanserai_urban — Shah-i-Zinda Portal & Longcrawler Courtyard Caravanserai (innkeepers/grooms, bug handlers)
   10425. tb_windmill_grist     — Glazed-Tile Cylindrical Lake-Breeze Tower Windmill & Silo (granary keepers and millers)
   10426. tb_bonded_warehouse   — Raised-Pier Cross-Ventilated Zsolnay Bonded Warehouse (porters and warehousemen)
   10427. tb_power_steamhouse   — Municipal Naphtha Waterworks Boiler & Glazed Flue House (power-house stokers and engineers)
   10428. tb_boatyard_urban     — Ustun-Truss Salt-Lake Galley & Reed-Barge Slipway (shipwrights and boatbuilders)
   10429. tb_lake_quay_customs  — Stepped Ashlar Salt-Lake Quay, Bronze Crane & Customs Loggia (dockers, bargemen, customs, ferrymen)
   10430. tb_beacon_tower       — El Capricho & Trencadis Salt-Lake Navigation Pharos (lighthouse keepers, coast guard) */

/* 22. Evaporative-Cooled Brick & Zeer-Jar Meat Market */
defBuilding({
 key:'tb_butcher_icehouse',
 name:'Evaporative-Cooled Brick and Zeer-Jar Meat Market',
 seed:10422,w:18,d:18,h:15.2,budget:84000,cut:true,
 front:{x:0,z:8.0,yaw:0},
 tags:{style:'urban',types:['shop','market'],role:'butcher-icehouse',job:'butchery'},
 build(){
  const y1=.52,h1=3.85,yRoof=y1+h1;
  tbPorticoPlinth(14.4,13.6,y1,{stepW:2.8,stepRun:1.2});

  /* Shaded front recessed loggia + evaporative cooling trough */
  tbRecessedLoggia(0,y1,4.8,0,4.6,h1,2.2,{});
  tbShadirvanPool(-4.8,4.8,2.6,2.0,y1+.26,.4,{});

  /* Thick double-brick cold vault [-6.8..6.8, -6.2..3.6] with claustra eave vents + trencadis wind-scoop lantern */
  tbWallRing(-6.8,-6.2,6.8,3.6,y1,h1,{
   register:'hazarbaf',t:.48,
   holes:{
    s:[{at:0,w:1.65,h:2.3,door:true,name:'butcher-front-door'}],
    n:[{at:-3.2,w:1.2,h:1.2,y:1.2},{at:3.2,w:1.2,h:1.2,y:1.2}]
   }
  });
  tbZsolnayRoof(0,yRoof,-1.3,14.2,10.2,{mode:'hip',over:.68,lantern:true,lanternR:1.6,lanternH:3.6});

  tbTarget(0,y1,4.8,'butcher-shaded-loggia',true);
  tbTarget(0,y1,-1.3,'butcher-zeer-cold-vault',true);

  tbFurnList([
   ['tb_zeer_cold_rack',-4.2,y1,-3.8,0],
   ['tb_zeer_cold_rack',0,y1,-3.8,0],
   ['tb_zeer_cold_rack',4.2,y1,-3.8,0],
   ['tb_trencadis_table',-3.2,y1,.8,0],
   ['tb_syndic_ledger_desk',3.2,y1,.8,PI]
  ]);
 }
});

/* 23. Two-Tier Ustun Ayvan Tea & Breeze Tavern */
defBuilding({
 key:'tb_tea_tavern',
 name:'Two-Tier Ustun Ayvan Tea and Breeze Tavern',
 seed:10423,w:22,d:20,h:16.4,budget:98000,cut:true,
 front:{x:0,z:9.0,yaw:0},
 tags:{style:'urban',types:['tavern','inn'],role:'tea-house',job:'brewing'},
 build(){
  const y1=.5,h1=3.8,y2=y1+h1,h2=3.4,yRoof=y2+h2;
  tbPorticoPlinth(18.4,15.6,y1,{stepW:3.2,stepRun:1.2});

  /* Deep ground ustun tea veranda [z = 3.6..7.0] + shadirvan fountain */
  tbUstunAyvan(-1.8,5.3,13.6,3.2,y1,h1,{n:5,ganchBack:true,ceilMk:'lacquer'});
  tbShadirvanPool(6.8,5.2,2.8,2.6,y1+.28,.44,{jet:true});

  tbWallRing(-8.6,-7.0,8.6,3.6,y1,h1,{
   register:'secession',
   holes:{
    s:[{at:-4.2,w:1.6,h:2.3,door:true,name:'tavern-west-door'},{at:1.2,w:1.75,h:2.35,door:true,name:'tavern-main-door'}],
    n:[{at:-4.4,w:1.35,h:1.35,y:1.0},{at:4.4,w:1.35,h:1.35,y:1.0}],
    e:[{at:-1.6,w:1.35,h:1.35,y:1.0}]
   }
  });

  const st=tbInteriorStair(5.4,-3.8,y1,y2,0,{w:1.2});
  tbFloorSlab(0,y2,-.2,17.0,13.8,{mk:'floor',th:.18,hole:st});
  tbKundalCeiling(-1.4,y2-.28,-1.7,12.8,10.0,{mk:'lacquer'});
  tbParapet(-8.4,6.6,4.8,6.6,y2,{kind:'iron'});

  /* Upper breeze-ayvan overlooking the street [z = 3.6..6.6] + guest parlour [-8.4..8.4, -6.8..3.6] */
  tbUstunAyvan(-1.8,5.1,13.2,2.8,y2,h2,{n:5,eaveCap:true,ceilMk:'lacquer'});
  tbWallRing(-8.4,-6.8,8.4,3.6,y2,h2,{
   register:'hazarbaf',
   holes:{
    s:[{at:-1.8,w:1.55,h:2.2,door:true,name:'tavern-balcony-door'},{at:4.6,w:1.5,h:1.5,y:.92}],
    n:[{at:-4.0,w:1.4,h:1.4,y:.95},{at:4.0,w:1.4,h:1.4,y:.95}]
   }
  });
  tbZsolnayRoof(0,yRoof,-1.6,17.4,10.8,{mk:'escata',mode:'hip',over:.7,dormer:true,spire:true,lanternR:1.55,lanternH:3.6});

  tbTarget(-1.8,y1,5.3,'tavern-ground-ayvan',true);
  tbTarget(-1.4,y1,-1.7,'tavern-samovar-hall',true);
  tbTarget(-1.4,y2,-1.7,'tavern-upper-parlour',true);
  tbTarget(-1.8,y2,5.1,'tavern-upper-ayvan',true);

  tbFurnList([
   ['tb_tea_samovar_low',-4.2,y1,5.2,0],
   ['tb_kundal_divan',-4.2,y1,-3.8,0],
   ['tb_tea_samovar_low',-4.2,y1,-1.8,0],
   ['tb_tannur_oven',2.0,y1,-4.4,0],
   ['tb_kundal_divan',-3.8,y2,-3.6,0],
   ['tb_tea_samovar_low',-1.8,y2,5.1,0],
   ['tb_brass_lantern_stand',4.4,y1,5.2,0]
  ]);
 }
});

/* 24. Shah-i-Zinda Portal & Longcrawler Courtyard Caravanserai (Plate A1) */
defBuilding({
 key:'tb_caravanserai_urban',
 name:'Shah-i-Zinda Portal and Longcrawler Caravanserai',
 seed:10424,w:30,d:26,h:18.4,budget:132000,cut:true,
 front:{x:0,z:11.8,yaw:0},
 tags:{style:'urban',types:['inn','market','infrastructure'],role:'caravanserai',job:'trading'},
 build(){
  const y1=.52,h1=4.1,y2=y1+h1,h2=3.3,yRoof=y2+h2;
  tbPorticoPlinth(26.0,21.2,y1,{stepW:4.2,stepRun:1.3});

  /* Grand Plate A1 Shah-i-Zinda embossed kashi pishtaq portal + central shadirvan watering court! */
  tbPishtaqPortal(0,y1,9.6,0,7.4,6.4,{openW:3.6,openH:4.1,dep:1.7,door:false});
  for(const s of [-1,1]){
   tbWall(s<0?-12.4:3.9,9.8,s<0?-3.9:12.4,9.8,y1,3.2,{register:'hazarbaf'});
   tbClaustraScreen(s*12.4,1.8,s*12.4,9.6,y1,3.2,{});
  }
  tbShadirvanPool(0,5.2,5.2,3.4,y1+.3,.48,{jet:true});
  tbBanner(-5.2,y1,10.2,5.2,{pal:'flag'});
  tbBanner(5.2,y1,10.2,5.2,{pal:'silkSaffron'});

  /* Rear 2-storey khan: high-clearance vaulted Longcrawler & pack-lizard ground stables + upper merchant rooms! */
  tbUstunAyvan(0,.4,23.8,2.6,y1,h1,{n:8,skipMid:2.0,ganchBack:true});
  tbWallRing(-12.4,-9.8,12.4,-.8,y1,h1,{
   register:'banded',
   holes:{
    s:[
     {at:-7.4,w:2.2,h:2.8,door:true,name:'khan-west-stable'},
     {at:0,w:2.2,h:2.8,door:true,name:'khan-central-hall'},
     {at:7.4,w:2.2,h:2.8,door:true,name:'khan-east-stable'}
    ],
    n:[{at:-7.2,w:1.4,h:1.4,y:1.1},{at:0,w:1.4,h:1.4,y:1.1},{at:7.2,w:1.4,h:1.4,y:1.1}]
   }
  });

  const st=tbInteriorStair(8.8,-5.3,y1,y2,-PI/2,{w:1.25});
  tbFloorSlab(0,y2,-5.3,24.2,8.6,{mk:'floor',th:.18,hole:st});
  tbKundalCeiling(-4.6,y2-.28,-5.3,14.2,8.0,{mk:'kundal'});

  tbWallRing(-12.2,-9.6,12.2,-1.0,y2,h2,{
   register:'hazarbaf',
   holes:{
    s:[{at:-7.6,w:1.5,h:1.45,y:.95},{at:-2.6,w:1.5,h:1.45,y:.95},{at:2.6,w:1.5,h:1.45,y:.95},{at:7.6,w:1.5,h:1.45,y:.95}],
    n:[{at:-6.0,w:1.4,h:1.4,y:.95},{at:6.0,w:1.4,h:1.4,y:.95}]
   }
  });
  tbZsolnayRoof(0,yRoof,-5.3,24.8,9.0,{mode:'hip',over:.74,lantern:true,lanternR:1.95,lanternH:4.1});

  tbTarget(4.8,y1,5.2,'khan-watering-court',false);
  tbTarget(-4.6,y1,-5.3,'khan-vaulted-hall',true);
  tbTarget(-4.6,y2,-5.3,'khan-merchant-chambers',true);

  tbFurnList([
   ['tb_bonded_bale_stack',-8.2,y1,-6.4,0],
   ['tb_bonded_bale_stack',1.2,y1,-7.2,0],
   ['tb_syndic_ledger_desk',-3.6,y1,-5.2,0],
   ['tb_ustun_daybed',-8.2,y2,-6.6,0],
   ['tb_ustun_daybed',-3.2,y2,-6.6,0],
   ['tb_kundal_divan',-3.2,y2,-3.8,PI],
   ['tb_brass_lantern_stand',-4.2,y1,5.2,0],
   ['tb_brass_lantern_stand',4.2,y1,5.2,0]
  ]);
 }
});

/* 25. Glazed-Tile Cylindrical Lake-Breeze Tower Windmill & Silo */
defBuilding({
 key:'tb_windmill_grist',
 name:'Glazed-Tile Lake-Breeze Tower Windmill and Silo',
 seed:10425,w:20,d:18,h:19.4,budget:92000,cut:true,
 front:{x:-2.4,z:8.0,yaw:0},
 tags:{style:'urban',types:['industry','infrastructure'],role:'windmill',job:'milling'},
 build(){
  const y1=.52,h1=3.8,yRoof=y1+h1;
  tbPorticoPlinth(16.4,13.6,y1,{stepX:-2.4,stepW:3.0,stepRun:1.2});

  /* Cylindrical glazed-teal tower-mill on east plinth (4.2, 0.4) with 6 dense-air canvas lake-breeze sails! */
  tbWindTower(4.2,.4,2.45,y1,14.8,{hollow:true,pedH:3.8,doorName:'mill-tower-door'});
  svNoWalk(()=>{
   const axX=4.2,axY=y1+10.2,axZ=2.6;
   WX(axX,axY,axZ,PI/2,0,0,()=>{
    cyl('ustun',0,-.6,0,.18,1.5,P('ustun'),10);
    sph('gilt',0,.95,0,.22,P('gilt'),1,8);
   });
   for(let i=0;i<6;i++){
    const a=i/6*TAU+.26,cx=Math.cos(a),sy=Math.sin(a);
    beam('ustun',[axX,axY,axZ+.65],[axX+cx*4.2,axY+sy*4.2,axZ+.65],.075,P('ustun'));
    WX(axX+cx*2.5,axY+sy*2.5,axZ+.72,0,0,a,()=>{
     box('canvas',0,.26,0,2.6,.46,.03,P('canvas'));
    });
   }
  });

  /* Claustra-ventilated brick grain silo & flour-bagging hall [-7.8..1.0, -6.0..5.2] */
  tbWallRing(-7.8,-6.0,1.0,5.2,y1,h1,{
   register:'banded',
   holes:{
    s:[{at:-3.4,w:1.7,h:2.3,door:true,name:'mill-granary-door'}],
    n:[{at:-3.4,w:1.35,h:1.35,y:1.0}],
    w:[{at:-.4,w:1.35,h:1.35,y:1.0}]
   }
  });
  tbClaustraScreen(-7.8,-3.6,-7.8,2.8,y1+2.2,1.2,{block:false});
  tbZsolnayRoof(-3.4,yRoof,-.4,9.2,11.6,{mode:'hip',over:.64,lantern:true,lanternR:1.25,lanternH:2.9});

  tbTarget(4.2,y1,.4,'windmill-grinding-base',true);
  tbTarget(-3.4,y1,-.4,'ventilated-grain-silo',true);

  tbFurnList([
   ['tb_bonded_bale_stack',-5.4,y1,-3.4,0],
   ['tb_bonded_bale_stack',-1.6,y1,-3.4,0],
   ['tb_zeer_cold_rack',-5.6,y1,2.2,0],
   ['tb_syndic_ledger_desk',-1.6,y1,2.2,PI],
   ['tb_potash_pan_trough',4.2,y1,-.4,0]
  ]);
 }
});

/* 26. Raised-Pier Cross-Ventilated Zsolnay Bonded Warehouse */
defBuilding({
 key:'tb_bonded_warehouse',
 name:'Raised-Pier Cross-Ventilated Zsolnay Bonded Warehouse',
 seed:10426,w:24,d:18,h:15.4,budget:90000,cut:true,
 front:{x:0,z:8.0,yaw:0},
 tags:{style:'urban',types:['infrastructure','industry'],role:'warehouse',job:'warehousing'},
 build(){
  const y1=.68,h1=4.2,yRoof=y1+h1;
  tbPorticoPlinth(20.4,13.6,y1,{stepW:3.6,stepRun:1.4});

  /* Covered loading dock veranda [z = 3.6..6.4] */
  tbUstunAyvan(0,5.0,19.4,2.6,y1,h1,{n:7,skipMid:1.8,ganchBack:false});

  tbWallRing(-9.8,-6.2,9.8,3.6,y1,h1,{
   register:'banded',
   holes:{
    s:[
     {at:-5.2,w:1.9,h:2.55,door:true,name:'warehouse-west-bay'},
     {at:0,w:2.1,h:2.65,door:true,name:'warehouse-center-bay'},
     {at:5.2,w:1.9,h:2.55,door:true,name:'warehouse-east-bay'}
    ],
    n:[{at:-5.2,w:1.4,h:1.3,y:1.2},{at:0,w:1.4,h:1.3,y:1.2},{at:5.2,w:1.4,h:1.3,y:1.2}]
   }
  });
  tbZsolnayRoof(0,yRoof,-1.3,20.0,10.2,{mode:'hip',over:.7,lantern:true,lanternR:1.7,lanternH:3.6});

  tbTarget(0,y1,5.0,'warehouse-loading-veranda',true);
  tbTarget(0,y1,-1.3,'warehouse-bonded-vault',true);

  tbFurnList([
   ['tb_bonded_bale_stack',-6.8,y1,-3.6,0],
   ['tb_bonded_bale_stack',-2.4,y1,-3.6,0],
   ['tb_bonded_bale_stack',2.4,y1,-3.6,0],
   ['tb_bonded_bale_stack',6.8,y1,-3.6,0],
   ['tb_kashi_tile_rack',-6.8,y1,.8,PI],
   ['tb_syndic_ledger_desk',6.4,y1,1.0,PI]
  ]);
 }
});

/* 27. Municipal Naphtha Waterworks Boiler & Glazed Flue House */
defBuilding({
 key:'tb_power_steamhouse',
 name:'Municipal Naphtha Waterworks Pump and Flue House',
 seed:10427,w:22,d:18,h:18.6,budget:92000,cut:true,
 front:{x:-2.2,z:8.0,yaw:0},
 tags:{style:'urban',types:['infrastructure','industry'],role:'waterworks',job:'oil'},
 build(){
  const y1=.54,h1=4.1,yRoof=y1+h1;
  tbPorticoPlinth(18.4,13.6,y1,{stepX:-2.2,stepW:3.0,stepRun:1.25});

  /* Licensed Geomancer/municipal naphtha pump-boiler feeding city shadirvan fountains (domestic houses stay non-electric!) */
  tbWindTower(5.8,2.2,1.9,y1,15.2,{pedH:3.0,block:true});
  tbShadirvanPool(5.8,-3.6,4.2,3.0,y1+.3,.5,{river:{name:'waterworks-aqueduct',axis:'x',speed:.48}});

  tbWallRing(-8.8,-6.0,2.8,5.4,y1,h1,{
   register:'banded',
   holes:{
    s:[{at:-3.0,w:1.85,h:2.5,door:true,name:'steamhouse-door'}],
    e:[{at:0,w:1.55,h:2.3,door:true,name:'steamhouse-yard-door'}],
    n:[{at:-5.4,w:1.4,h:1.45,y:1.0},{at:-.6,w:1.4,h:1.45,y:1.0}],
    w:[{at:0,w:1.4,h:1.45,y:1.0}]
   }
  });
  tbZsolnayRoof(-3.0,yRoof,-.3,12.0,11.8,{mode:'hip',over:.68,lantern:true,lanternR:1.45,lanternH:3.2});

  /* Interior bronze/iron asarbu pressure manifold */
  svNoWalk(()=>{
   cyl('bronze',-5.6,y1+.02,-2.6,.68,2.4,P('bronze'),12);
   cyl('iron',-5.6,y1+2.42,-2.6,.52,.6,P('iron'),12);
   beam('verdigris',[-5.6,y1+1.8,-2.6],[-1.2,y1+1.8,-2.6],.12,P('verdigris'));
  });

  tbTarget(-2.2,y1,-0.3,'waterworks-boiler-hall',true);
  tbTarget(5.8,y1,5.2,'waterworks-flue-apron',false);

  tbFurnList([
   ['tb_lac_curing_vat',-1.6,y1,-3.2,0],
   ['tb_potash_pan_trough',-5.6,y1,2.2,0],
   ['tb_syndic_ledger_desk',-.8,y1,2.4,PI],
   ['tb_bonded_bale_stack',-6.2,y1,0,PI/2],
   ['tb_brass_lantern_stand',1.6,y1,5.2,0]
  ]);
 }
});

/* 28. Ustun-Truss Salt-Lake Galley & Reed-Barge Slipway */
defBuilding({
 key:'tb_boatyard_urban',
 name:'Ustun-Truss Salt-Lake Galley and Barge Slipway',
 seed:10428,w:24,d:22,h:15.8,budget:96000,cut:true,
 front:{x:-4.6,z:9.8,yaw:0},
 tags:{style:'urban',types:['industry','infrastructure'],role:'boatyard',job:'shipwrighting'},
 build(){
  const y1=.52,h1=4.3,yRoof=y1+h1;
  tbPorticoPlinth(20.4,17.2,y1,{stepX:-4.6,stepW:3.2,stepRun:1.25});

  /* Flooding salt-lake launch slip on east side [x = 2.6..9.4, z = -7.8..7.8] wired to core/water! */
  tbShadirvanPool(6.0,0,6.6,14.8,y1+.24,.65,{river:{name:'boatyard-slip',axis:'z',speed:.35}});

  /* Timber hull frame on slipway stocks (svNoWalk) */
  svNoWalk(()=>{
   beam('ustun',[6.0,y1+.35,-4.8],[6.0,y1+.55,4.8],.18,P('ustun'));
   for(let i=-3;i<=3;i++){
    const zz=i*1.3,rw=1.55-Math.abs(i)*.18;
    beam('cedar',[6.0-rw,y1+1.25,zz],[6.0,y1+.45,zz],.09,P('cedar'));
    beam('cedar',[6.0+rw,y1+1.25,zz],[6.0,y1+.45,zz],.09,P('cedar'));
   }
  });

  /* Covered shipwright hall & rope/lacquer caulking loft [-9.8..1.8, -7.8..7.4] */
  tbUstunAyvan(-4.0,5.8,11.2,3.0,y1,h1,{n:4,ganchBack:false});
  tbWallRing(-9.8,-7.8,1.8,4.2,y1,h1,{
   register:'banded',
   holes:{
    s:[{at:-4.0,w:1.85,h:2.45,door:true,name:'boatyard-front-door'}],
    e:[{at:-1.8,w:2.0,h:2.55,door:true,name:'boatyard-slip-door'}],
    n:[{at:-4.0,w:1.4,h:1.4,y:1.0}],
    w:[{at:-1.8,w:1.4,h:1.4,y:1.0}]
   }
  });
  tbZsolnayRoof(-4.0,yRoof,-1.8,12.0,12.4,{mode:'gable',gableAxis:'z',over:.7});

  tbTarget(-4.0,y1,5.8,'boatyard-fore-veranda',true);
  tbTarget(-4.0,y1,-1.8,'boatyard-wright-hall',true);

  tbFurnList([
   ['tb_lac_curing_vat',-6.8,y1,-4.8,0],
   ['tb_bonded_bale_stack',-1.4,y1,-4.8,0],
   ['tb_kashi_tile_rack',-7.2,y1,.6,PI/2],
   ['tb_syndic_ledger_desk',-1.4,y1,1.2,PI],
   ['tb_trencadis_table',-4.0,y1,5.8,0]
  ]);
 }
});

/* 29. Stepped Ashlar Salt-Lake Quay, Bronze Crane & Customs Loggia */
defBuilding({
 key:'tb_lake_quay_customs',
 name:'Stepped Ashlar Salt-Lake Quay and Customs Loggia',
 seed:10429,w:26,d:22,h:16.2,budget:104000,cut:true,
 front:{x:0,z:9.8,yaw:0},
 tags:{style:'urban',types:['infrastructure','civic'],role:'customs-quay',job:'customs'},
 build(){
  const y1=.54,h1=4.0,yRoof=y1+h1;
  tbPorticoPlinth(22.2,17.2,y1,{stepW:3.6,stepRun:1.25});

  /* North salt-lake berth channel [z = -8.2..-4.2] + revolving cast-bronze cargo derrick crane! */
  tbShadirvanPool(0,-6.2,20.8,3.8,y1+.22,.68,{river:{name:'lake-quay-berth',axis:'x',speed:.42}});
  svNoWalk(()=>{
   cyl('ashlar',8.2,y1+.01,-3.2,.68,.38,P('ashlar'),10);
   cyl('bronze',8.2,y1+.39,-3.2,.24,4.2,P('bronze'),10);
   beam('ustun',[8.2,y1+4.2,-3.2],[8.2,y1+5.6,-5.8],.14,P('ustun'));
   beam('iron',[8.2,y1+2.8,-3.2],[8.2,y1+5.2,-5.4],.055,P('iron'));
  });

  /* Customs house [-9.8..5.8, -3.4..6.8] with Plate B2 Raichle recessed loggia & B3 Escata Spire! */
  tbRecessedLoggia(-2.0,y1,5.6,0,5.2,h1,2.2,{});
  tbWallRing(-9.8,-3.4,5.8,4.4,y1,h1,{
   register:'secession',
   holes:{
    s:[{at:-2.0,w:1.85,h:2.4,door:true,name:'customs-front-door'},{at:3.2,w:1.4,h:1.4,y:1.0}],
    n:[{at:-5.8,w:1.6,h:2.25,door:true,name:'customs-quay-door'},{at:1.8,w:1.4,h:1.4,y:1.0}],
    e:[{at:.5,w:1.4,h:1.4,y:1.0}],
    w:[{at:.5,w:1.4,h:1.4,y:1.0}]
   }
  });
  tbZsolnayRoof(-2.0,yRoof,.5,16.0,8.2,{mode:'hip',over:.7,spire:true,lanternR:1.6,lanternH:4.2});
  tbBanner(8.6,y1,6.2,5.0,{pal:'flag'});

  tbTarget(-2.0,y1,5.6,'customs-entry-loggia',true);
  tbTarget(-2.0,y1,.5,'customs-clearing-hall',true);
  tbTarget(8.0,y1,1.2,'quay-crane-apron',false);

  tbFurnList([
   ['tb_syndic_ledger_desk',-5.6,y1,.6,0],
   ['tb_syndic_ledger_desk',.8,y1,.6,0],
   ['tb_bonded_bale_stack',3.6,y1,-1.4,0],
   ['tb_ganch_screen_bench',-6.2,y1,-1.8,0],
   ['tb_brass_lantern_stand',-2.0,y1,5.8,0]
  ]);
 }
});

/* 30. El Capricho & Trencadis Salt-Lake Navigation Pharos (Plates B4 & B5) */
defBuilding({
 key:'tb_beacon_tower',
 name:'El Capricho and Trencadis Salt-Lake Navigation Pharos',
 seed:10430,w:18,d:18,h:23.5,budget:88000,cut:true,
 front:{x:0,z:8.0,yaw:0},
 tags:{style:'urban',types:['infrastructure','military'],role:'lighthouse'},
 build(){
  const y1=.58,h1=4.0,yRoof=y1+h1;
  tbPorticoPlinth(14.2,13.6,y1,{stepW:3.0,stepRun:1.3});

  /* Keeper's banded-brick watch lodge [-6.4..6.4, -5.8..3.4] + open front portico [z = 3.4..6.2] */
  tbUstunAyvan(0,4.8,12.2,2.6,y1,h1,{n:4,verdigris:true,ganchBack:true});
  tbWallRing(-6.4,-5.8,6.4,3.4,y1,h1,{
   register:'banded',
   holes:{
    s:[{at:0,w:1.7,h:2.35,door:true,name:'pharos-lodge-door'}],
    n:[{at:-3.2,w:1.3,h:1.35,y:1.0},{at:3.2,w:1.3,h:1.35,y:1.0}],
    e:[{at:-1.2,w:1.3,h:1.35,y:1.0}],
    w:[{at:-1.2,w:1.3,h:1.35,y:1.0}]
   }
  });
  tbZsolnayRoof(0,yRoof,-1.2,13.2,9.6,{mode:'hip',over:.66});

  /* Soaring glazed-teal El Capricho navigation beacon shaft rising above roof with glowing oil/crystal cresset! */
  tbWindTower(0,-1.2,2.15,yRoof+.4,16.8,{pedH:1.8,block:false});
  svNoWalk(()=>{
   cyl('glow',0,yRoof+14.8,-1.2,.42,.65,P('flame'),10);
  });

  tbTarget(0,y1,4.8,'pharos-watch-portico',true);
  tbTarget(0,y1,-1.2,'pharos-keeper-lodge',true);

  tbFurnList([
   ['tb_crystal_altar_brazier',0,y1,-1.2,0],
   ['tb_ustun_daybed',-3.8,y1,-3.4,0],
   ['tb_syndic_ledger_desk',3.4,y1,-3.2,0],
   ['tb_zeer_cold_rack',3.8,y1,1.2,PI],
   ['tb_brass_lantern_stand',-3.6,y1,4.8,0]
  ]);
 }
});
