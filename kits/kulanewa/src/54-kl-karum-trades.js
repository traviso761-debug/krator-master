// prefix: kl
// ================================================================= KARUM LEDGER-SYNDICATES — MINTS, PRESSES, EXCHANGES & GRANARIES (8106..8110)
//   8106. kl_karum_paktong_mint  — Paktong & Silver Bullion Assay Mint-Foundry
//   8107. kl_karum_amber_press   — 64-Sign Clay-Envelope Kiln & Bark-Draft Paper Mill
//   8108. kl_karum_silk_exchange — Covered Silk, Spice & Superconductor Factor Bazaar
//   8109. kl_karum_kura_granary  — Triple-Gable Stepped-Udatsu Fireproof Kura Reserve Granary
//   8110. kl_karum_glaze_pottery — Glazed-Dado Tile & Amphora Kiln-Yard

/* 6. Paktong and Silver Bullion Assay Mint-Foundry */
defBuilding({
 key:'kl_karum_paktong_mint',
 name:'Paktong and Silver Bullion Assay Mint-Foundry',
 seed:8106,w:24,d:20,h:17.6,budget:108000,cut:true,
 front:{x:1.8,z:8.8,yaw:0},
 tags:{style:'karum',wealth:'rich',types:['industry'],role:'mint-foundry',job:'smithing'},
 build(){
  const y1=.56,h1=3.7,y2=y1+h1,h2=3.3,yRoof=y2+h2;
  klKuraPlinth(20.6,16.0,y1,{stepX:1.8,stepW:3.0,stepRun:1.4,topMk:'cobble'});

  /* West Cupellation Furnace Frustum Stack (solid hooped cedar/iron blast stack + glowing assay hearth) */
  klHoopedFrustum(-7.4,-3.8,2.35,1.45,y1,12.8,{hollow:false,hoops:5});
  smokeAt(-7.4,y1+13.1,-3.8,{r:.34,kind:'fire'});
  haloAt(-7.4,y1+1.4,-1.2,0xffa848,true);

  /* Ground fireproof kura minting & die-striking vault [-4.4..9.4, -7.0..6.2] */
  klWallRing(-4.4,-7.0,9.4,6.2,y1,h1,{
   style:'karum',register:'kura',udatsu:'ew',udatsuD:1.25,
   holes:{
    s:[
     {at:2.5,w:1.85,h:2.4,door:true,torana:true,leafMk:'iron',name:'mint-front-door'},
     {at:-1.6,w:1.15,h:1.3,y:1.1},
     {at:6.8,w:1.15,h:1.3,y:1.1}
    ],
    w:[{at:1.6,w:1.4,h:2.2,door:true,torana:false,name:'mint-yard-door'}],
    n:[{at:0,w:1.15,h:1.3,y:1.1},{at:5.2,w:1.15,h:1.3,y:1.1}]
   }
  });

  const st=klInteriorStair(6.6,-3.8,y1,y2,0,{w:1.2,riser:.18,going:.27,mk:'darkcedar',smk:'nickel',col:P('darkcedar'),scol:P('nickel'),rail:'both'});
  klFloorSlab(2.5,y2,-.4,13.4,12.8,{mk:'floor',th:.18,hole:st});
  klCeilingSlab(.4,y2-.28,-.4,9.2,12.2,{mk:'darkcedar',trimMk:'cedar'});

  /* Upper kilnbrick + cobalt-dado Coinage Assay & Die Registry */
  klWallRing(-4.2,-6.8,9.2,6.0,y2,h2,{
   style:'karum',register:'brick',dadoMk:'cobalt',
   holes:{
    s:[{at:-1.2,w:1.45,h:1.45,y:.95},{at:2.8,w:1.6,h:1.5,y:.95},{at:6.6,w:1.45,h:1.45,y:.95}],
    e:[{at:-.4,w:1.4,h:1.4,y:.95}],
    n:[{at:2.5,w:1.45,h:1.45,y:.95}]
   }
  });
  klNewarRoof(2.5,yRoof,-.4,14.0,13.4,2,{
   style:'karum',mode:'hip',mk:'slate',over:.72,tierRise:1.24
  });

  klTarget(-7.2,y1,2.4,'furnace-cupellation-yard',false);
  klTarget(1.8,y1,-.4,'paktong-die-hall',true);
  klTarget(1.2,y2,-.4,'bullion-assay-registry',true);

  klFurnList([
   ['kulanewa_trip_anvil',-.8,y1,1.6,0],
   ['kulanewa_bullion_scale',3.6,y1,1.8,PI],
   ['kulanewa_amber_safe',-.8,y1,-4.2,0],
   ['kulanewa_amber_safe',3.2,y1,-4.2,0],
   ['kulanewa_naruqqum_table',1.2,y2,-1.2,0],
   ['kulanewa_tablet_rack',-2.2,y2,-4.6,0],
   ['kulanewa_syndicate_brazier',-6.8,y1,3.2,0]
  ]);
 }
});

/* 7. 64-Sign Clay-Envelope Kiln and Bark-Draft Paper Mill */
defBuilding({
 key:'kl_karum_amber_press',
 name:'64-Sign Clay-Envelope Kiln and Bark-Draft Paper Mill',
 seed:8107,w:22,d:19,h:15.2,budget:96000,cut:true,
 front:{x:-1.8,z:8.2,yaw:0},
 tags:{style:'karum',wealth:'middle',types:['industry','shop'],role:'tablet-press',job:'scribing'},
 build(){
  const y1=.52,h1=3.5,y2=y1+h1,h2=3.2,yRoof=y2+h2;
  klFloorSlab(-1.8,y1,-.4,14.8,15.2,{mk:'paving',th:y1});
  klStair(-1.8,0,8.3,-1.8,y1,7.1,2.8,{mk:'sootstone',sideMk:'kura'});

  /* East Kiyomizu bark-pulp soaking trestle & beehive clay-tablet firing kiln! */
  klKiyomizuTrestle(7.4,1.2,3.8,10.6,0,y1,{rails:'nse'});
  svNoWalk(()=>{
   cyl('sootstone',7.4,y1+.01,-2.2,1.45,.36,P('sootstone'),14);
   lathe('kilnbrick',7.4,-2.2,[[1.38,y1+.37],[1.22,y1+1.55],[.46,y1+2.55]],14,P('kilnbrick'),{uv:'cone'});
   cyl('iron',7.4,y1+2.55,-2.2,.38,.55,P('iron'),10);
   /* Bark-paper drying screens on trestle */
   for(const dz of [1.6,3.8]){
    box('darkcedar',7.4,y1+.02,dz,2.1,1.55,.08,P('darkcedar'));
    box('bone',7.4,y1+.14,dz+.05,1.86,1.28,.025,P('bone'));
   }
  });
  klWallBlock(7.4,y1,-2.2,2.6,2.6,2.6,0);
  smokeAt(7.4,y1+3.15,-2.2,{r:.24,kind:'fire'});
  haloAt(7.4,y1+.7,-2.2,0xffb454,false);

  /* Main kura & kilnbrick tablet-press workshop [-8.6..4.8, -7.2..6.4] */
  klWallRing(-8.6,-7.2,4.8,6.4,y1,h1,{
   style:'karum',register:'kura',
   holes:{
    s:[
     {at:-1.9,w:1.75,h:2.35,door:true,torana:true,leafMk:'darkcedar',name:'press-front-door'},
     {at:-6.2,w:1.15,h:1.3,y:1.05},
     {at:2.2,w:1.15,h:1.3,y:1.05}
    ],
    e:[{at:2.6,w:1.4,h:2.2,door:true,torana:false,name:'press-trestle-door'}],
    n:[{at:-4.8,w:1.15,h:1.3,y:1.05},{at:1.2,w:1.15,h:1.3,y:1.05}]
   }
  });

  const st=klInteriorStair(-6.2,-4.0,y1,y2,0,{w:1.15,riser:.18,going:.27,mk:'darkcedar',smk:'cedar',col:P('darkcedar'),scol:P('cedar'),rail:'both'});
  klFloorSlab(-1.9,y2,-.4,13.0,13.2,{mk:'floor',th:.18,hole:st});
  klCeilingSlab(.2,y2-.28,-.4,8.6,12.6,{mk:'darkcedar',trimMk:'cedar'});

  klWallRing(-8.4,-7.0,4.6,6.2,y2,h2,{
   style:'karum',register:'brick',dadoMk:'cobalt',
   holes:{
    s:[{at:-5.6,w:1.45,h:1.45,y:.95},{at:-1.9,w:1.55,h:1.5,y:.95},{at:1.8,w:1.45,h:1.45,y:.95}],
    w:[{at:-.4,w:1.4,h:1.4,y:.95}],
    n:[{at:-1.9,w:1.45,h:1.45,y:.95}]
   }
  });
  klNewarRoof(-1.9,yRoof,-.4,13.6,13.8,2,{
   style:'karum',mode:'gable',gableAxis:'x',mk:'terracotta',over:.72,tierRise:1.22
  });

  klTarget(7.4,y1,2.6,'bark-paper-drying-deck',false);
  klTarget(-.8,y1,-.4,'clay-envelope-press-room',true);
  klTarget(-.2,y2,-.4,'seal-engraving-loft',true);

  klFurnList([
   ['kulanewa_naruqqum_table',-.8,y1,1.4,0],
   ['kulanewa_tablet_rack',-3.2,y1,-4.8,0],
   ['kulanewa_tablet_rack',1.4,y1,-4.8,0],
   ['kulanewa_naruqqum_table',-.2,y2,-1.4,0],
   ['kulanewa_amber_safe',2.4,y2,-4.4,-PI/2],
   ['kulanewa_oil_cresset',7.2,y1,5.0,0]
  ]);
 }
});

/* 8. Covered Silk, Spice and Superconductor Factor Bazaar */
defBuilding({
 key:'kl_karum_silk_exchange',
 name:'Covered Silk, Spice and Superconductor Factor Bazaar',
 seed:8108,w:26,d:20,h:16.4,budget:112000,cut:true,
 front:{x:0,z:8.8,yaw:0},
 tags:{style:'karum',wealth:'rich',types:['market','shop'],role:'bazaar',job:'weaving'},
 build(){
  const y1=.54,h1=3.7,y2=y1+h1,h2=3.35,yRoof=y2+h2;
  klKuraPlinth(22.2,16.4,y1,{stepW:3.6,stepRun:1.45});

  /* Deep front double-bay dark-cedar factor bazaar arcade [z = 2.6..7.8] + silk sun-awnings */
  klTimberColonnade(-10.2,7.6,10.2,7.6,y1,h1,{style:'karum',n:7,skipMid:1.9,trimMk:'bronze'});
  klCeilingSlab(0,y2-.24,5.2,21.0,4.8,{mk:'darkcedar',trimMk:'cedar'});
  svNoWalk(()=>{
   for(const sx of [-6.4,6.4]){
    poly('silk',[[sx-3.2,y1+2.95,7.85],[sx+3.2,y1+2.95,7.85],[sx+3.2,y1+2.35,8.75],[sx-3.2,y1+2.35,8.75]],P(sx<0?'silkCrimson':'silkSaffron'),true);
   }
  });
  klSteelyard(-7.6,y2-.16,7.8,0,1.75,{bell:false});

  /* Rear fireproof kura bonded silk & spice warehouse [-10.4..10.4, -7.4..2.8] */
  klWallRing(-10.4,-7.4,10.4,2.8,y1,h1,{
   style:'karum',register:'kura',udatsu:'ew',udatsuD:1.3,
   holes:{
    s:[
     {at:-5.8,w:1.55,h:2.3,door:true,torana:false,leafMk:'darkcedar',name:'bazaar-west-stall-door'},
     {at:0,w:1.9,h:2.45,door:true,torana:true,leafMk:'darkcedar',name:'bazaar-center-door'},
     {at:5.8,w:1.55,h:2.3,door:true,torana:false,leafMk:'darkcedar',name:'bazaar-east-stall-door'}
    ],
    n:[{at:-5.2,w:1.2,h:1.3,y:1.05},{at:0,w:1.2,h:1.3,y:1.05},{at:5.2,w:1.2,h:1.3,y:1.05}]
   }
  });

  const st=klInteriorStair(7.4,-4.2,y1,y2,0,{w:1.2,riser:.18,going:.27,mk:'darkcedar',smk:'bronze',col:P('darkcedar'),scol:P('bronze'),rail:'both'});
  klFloorSlab(0,y2,-2.3,20.2,9.8,{mk:'floor',th:.18,hole:st});
  klCeilingSlab(-2.2,y2-.28,-2.3,15.2,9.2,{mk:'darkcedar',trimMk:'cedar'});

  /* Upper kilnbrick + cobalt-dado Sample & Auction Gallery */
  klWallRing(-10.1,-7.2,10.1,2.6,y2,h2,{
   style:'karum',register:'brick',dadoMk:'cobalt',
   holes:{
    s:[{at:-6.2,w:1.5,h:1.45,y:.95},{at:-2.0,w:1.5,h:1.45,y:.95},{at:2.0,w:1.5,h:1.45,y:.95},{at:6.2,w:1.5,h:1.45,y:.95}],
    n:[{at:-4.8,w:1.4,h:1.4,y:.95},{at:4.8,w:1.4,h:1.4,y:.95}]
   }
  });
  klNewarRoof(0,yRoof,-2.3,20.6,10.4,2,{
   style:'karum',mode:'hip',mk:'terracotta',over:.76,tierRise:1.28
  });

  klTarget(0,y1,5.2,'bazaar-factor-arcade',true);
  klTarget(-1.8,y1,-2.3,'bonded-silk-vault',true);
  klTarget(-1.8,y2,-2.3,'upper-sample-auction-hall',true);

  klFurnList([
   ['kulanewa_bullion_scale',-4.2,y1,5.0,0],
   ['kulanewa_naruqqum_table',4.2,y1,5.0,0],
   ['kulanewa_amber_safe',-6.8,y1,-4.6,0],
   ['kulanewa_grain_bin',-2.2,y1,-4.8,0],
   ['kulanewa_tablet_rack',2.8,y1,-4.8,0],
   ['kulanewa_naruqqum_table',-3.4,y2,-2.4,0],
   ['kulanewa_cedar_settle',-3.4,y2,-.6,PI],
   ['kulanewa_tea_samovar',1.8,y2,-2.4,0]
  ]);
 }
});

/* 9. Triple-Gable Stepped-Udatsu Fireproof Kura Reserve Granary */
defBuilding({
 key:'kl_karum_kura_granary',
 name:'Triple-Gable Stepped-Udatsu Fireproof Kura Reserve Granary',
 seed:8109,w:26,d:19,h:15.4,budget:102000,cut:true,
 front:{x:0,z:8.2,yaw:0},
 tags:{style:'karum',wealth:'middle',types:['infrastructure','farm'],role:'granary',job:'warehousing'},
 build(){
  const y1=.78,h1=4.2,yRoof=y1+h1;
  klKuraPlinth(22.4,14.8,y1,{stepW:3.6,stepRun:1.65,socMk:'sootstone',topMk:'paving'});

  /* Front covered timber loading & weighing veranda [z = 3.8..7.0] */
  klTimberColonnade(-10.2,6.8,10.2,6.8,y1,3.55,{style:'karum',n:7,skipMid:1.8,trimMk:'iron'});
  klCeilingSlab(0,y1+3.55,5.2,21.0,3.2,{mk:'darkcedar',trimMk:'cedar'});
  klSteelyard(6.2,y1+3.45,7.0,0,1.7,{bell:false});

  /* Continuous triple-vault chalk-white kura granary [-10.4..10.4, -6.8..3.6] divided visually by 4 stepped udatsu wings! */
  klWallRing(-10.4,-6.8,10.4,3.6,y1,h1,{
   style:'karum',register:'kura',
   holes:{
    s:[
     {at:-6.8,w:1.55,h:2.3,door:true,torana:false,leafMk:'iron',name:'kura-west-bay-door'},
     {at:0,w:1.75,h:2.4,door:true,torana:true,leafMk:'iron',name:'kura-center-bay-door'},
     {at:6.8,w:1.55,h:2.3,door:true,torana:false,leafMk:'iron',name:'kura-east-bay-door'}
    ],
    n:[{at:-6.8,w:1.05,h:1.1,y:1.6},{at:0,w:1.05,h:1.1,y:1.6},{at:6.8,w:1.05,h:1.1,y:1.6}]
   }
  });
  for(const ux of [-10.85,-3.55,3.55,10.85]){
   klUdatsuWall(ux,y1,3.1,0,1.45,h1+.85,{style:'karum',capMk:'slate'});
  }
  /* Three non-overlapping side-by-side Newar slate/terracotta gables over the three grain bays! */
  for(const bx of [-6.9,0,6.9]){
   klNewarRoof(bx,yRoof,-1.6,5.9,10.6,2,{
    style:'karum',mode:'gable',gableAxis:'z',mk:bx===0?'terracotta':'slate',over:.32,tierRise:1.18
   });
  }

  klTarget(0,y1,5.2,'granary-loading-porch',true);
  klTarget(-6.8,y1,-1.6,'west-kura-grain-vault',true);
  klTarget(0,y1,-1.6,'central-kura-grain-vault',true);
  klTarget(6.8,y1,-1.6,'east-kura-grain-vault',true);

  klFurnList([
   ['kulanewa_grain_bin',-8.2,y1,-4.2,0],
   ['kulanewa_grain_bin',-5.6,y1,-4.2,0],
   ['kulanewa_grain_bin',-1.4,y1,-4.2,0],
   ['kulanewa_grain_bin',1.4,y1,-4.2,0],
   ['kulanewa_grain_bin',5.6,y1,-4.2,0],
   ['kulanewa_grain_bin',8.2,y1,-4.2,0],
   ['kulanewa_bullion_scale',-3.4,y1,5.2,0],
   ['kulanewa_amber_safe',0,y1,.4,0]
  ]);
 }
});

/* 10. Glazed-Dado Tile and Amphora Kiln-Yard */
defBuilding({
 key:'kl_karum_glaze_pottery',
 name:'Glazed-Dado Tile and Amphora Kiln-Yard',
 seed:8110,w:22,d:19,h:14.8,budget:94000,cut:true,
 front:{x:2.2,z:8.2,yaw:0},
 tags:{style:'karum',wealth:'middle',types:['industry'],role:'kiln-yard',job:'pottery'},
 build(){
  const y1=.46,h1=3.55,y2=y1+h1,h2=3.05,yRoof=y2+h2;
  klFloorSlab(0,y1,-.2,18.8,15.6,{mk:'cobble',th:y1});
  klStair(2.2,0,8.3,2.2,y1,7.2,2.8,{mk:'sootstone',sideMk:'kura'});

  /* West 3-Chamber Stepped Noborigama Glaze-Firing Climbing Kiln (svNoWalk + smokeAt + haloAt) */
  svNoWalk(()=>{
   for(let i=0;i<3;i++){
    const kz=3.2-i*3.1,ky=y1+i*.28;
    box('sootstone',-6.4,y1+.01,kz,3.6,.26+i*.28,2.8,P('sootstone'));
    box('kilnbrick',-6.4,ky+.27,kz,3.3,1.55,2.55,P('kilnbrick'));
    box(i===1?'cobalt':'celadon',-6.4,ky+1.82,kz,3.42,.16,2.66,P(i===1?'cobalt':'celadon'));
    box('terracotta',-6.4,ky+1.98,kz,3.0,.32,2.3,P('terracotta'));
   }
   cyl('kilnbrick',-6.4,y1+2.6,-3.2,.48,2.8,P('kilnbrick'),10,.36);
  });
  klWallBlock(-6.4,y1,.1,3.5,2.6,9.2,0);
  smokeAt(-6.4,y1+5.5,-3.2,{r:.3,kind:'fire'});
  haloAt(-6.4,y1+.8,3.2,0xffa644,true);

  /* East Throwing & Glaze-Painting Workshop [-2.4..8.8, -6.8..5.8] */
  klWallRing(-2.4,-6.8,8.8,5.8,y1,h1,{
   style:'karum',register:'kura',dadoMk:'cobalt',
   holes:{
    s:[
     {at:3.2,w:1.65,h:2.3,door:true,torana:true,leafMk:'darkcedar',name:'pottery-shop-door'},
     {at:6.8,w:1.2,h:1.3,y:1.05}
    ],
    w:[{at:1.4,w:1.4,h:2.2,door:true,torana:false,name:'pottery-kiln-door'}],
    n:[{at:3.2,w:1.2,h:1.3,y:1.05}]
   }
  });

  const st=svStair(6.2,-3.6,y1,y2,0,{w:1.15,riser:.18,going:.27,mk:'darkcedar',smk:'cedar',col:P('darkcedar'),scol:P('cedar'),rail:'both'});
  klFloorSlab(3.2,y2,-.5,10.8,12.2,{mk:'floor',th:.18,hole:st});
  klCeilingSlab(1.2,y2-.28,-.5,6.8,11.6,{mk:'darkcedar',trimMk:'cedar'});

  klWallRing(-2.2,-6.6,8.6,5.6,y2,h2,{
   style:'karum',register:'brick',dadoMk:'celadon',
   holes:{
    s:[{at:.8,w:1.45,h:1.4,y:.9},{at:5.6,w:1.45,h:1.4,y:.9}],
    w:[{at:-.5,w:1.4,h:1.4,y:.9}],
    n:[{at:3.2,w:1.4,h:1.4,y:.9}]
   }
  });
  klNewarRoof(3.2,yRoof,-.5,11.4,12.8,2,{
   style:'karum',mode:'gable',gableAxis:'z',mk:'terracotta',over:.68,tierRise:1.15
  });

  klTarget(-2.8,y1,6.4,'kiln-glazing-yard',false);
  klTarget(2.2,y1,-.5,'potter-wheel-workshop',true);
  klTarget(1.8,y2,-.5,'tile-drying-loft',true);

  klFurnList([
   ['kulanewa_naruqqum_table',1.8,y1,1.6,0],
   ['kulanewa_grain_bin',.2,y1,-4.2,0],
   ['kulanewa_tablet_rack',3.6,y1,-4.6,0],
   ['kulanewa_tea_samovar',1.8,y2,-1.4,0],
   ['kulanewa_cedar_settle',1.8,y2,.8,PI],
   ['kulanewa_oil_cresset',-3.6,y1,5.6,0]
  ]);
 }
});
