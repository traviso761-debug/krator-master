// prefix: ra
// ================================================================= UPPER RIA / EASTERN DYNASTY (LIWA-TOGA) — ALL DWELLING CLASSES (23-28)
// Complete residential spectrum across poor, middle & rich and single-family & multi-family in High-Ria stone & Lanna slate grammar:
//   23. ra_east_quarry_shack      — Poor single-family: dressed dolomite & porphyry quarryman's shack + flat drying porch + slate gable
//   24. ra_east_stepped_tenement  — Poor multi-family: 3-storey karst-terrace dolomite & cedar walk-up tenement + spring trough
//   25. ra_east_lapidary_shophouse — Middle single-family: 2-storey Minoan tapered-porphyry shop loggia + alabaster & slate family loft
//   26. ra_east_veranda_insula    — Middle multi-family: 2-storey Classical dolomite round-arch apartment row + cedar & slate veranda
//   27. ra_east_patrician_manor   — Rich single-family: walled porphyry-cavetto clan manor, palm portico, spring court & Hongsa stupa
//   28. ra_east_archon_residences — Rich multi-family: 2-storey Classical peristyle archon & river-master suites + Lanna Prasat crown

/* 23. Dressed-Dolomite and Porphyry Quarryman Shack (poor, dwelling-single) */
defBuilding({
 key:'ra_east_quarry_shack',
 name:'Dressed-Dolomite and Porphyry Quarryman Shack',
 seed:7223,w:14,d:14,h:9.8,budget:62000,cut:true,
 front:{x:0,z:5.9,yaw:0},
 tags:{style:'upper-ria',wealth:'poor',types:['dwelling-single'],role:'hut',job:'quarrying'},
 build(){
  const y1=.48,gh=3.0,yRoof=y1+gh;
  raFloorSlab(0,y1,-.2,9.8,9.4,{mk:'paving',th:.48});
  raStripWalk([0,0,6.0],[0,y1,4.6],2.4);

  /* Front Minoan Tapered-Porphyry Stone Porch [z = 2.0..4.4] + rough-cut stone blocks on side apron */
  for(const px of [-3.9,0,3.9]){
   raColumn(px,y1,4.1,gh-.18,{style:'upper-ria',mk:'porphyry',baseMk:'dolomite',capMk:'bronze',r:.17,taper:'minoan',block:false});
  }
  raFlatTerraceRoof(0,yRoof-.18,3.2,9.2,2.4,{
   style:'upper-ria',mk:'dolomite',topMk:'paving',soffitMk:'cedar',trimMk:'bronze',parapet:'balustrade',skip:'n'
  });
  svNoWalk(()=>{
   box('porphyry',3.4,y1+.01,3.2,.95,.55,.75,P('porphyry'));
   box('dolomite',3.4,y1+.56,3.2,.68,.42,.58,P('dolomite'));
  });

  raWallRing(-4.3,-4.5,4.3,2.0,y1,gh,{
   style:'upper-ria',mk:'dolomite',socMk:'porphyry',dadoMk:'carve',postMk:'porphyry',
   holes:{
    s:[{at:-1.6,w:1.35,h:2.15,door:true,crownMk:'bronze',pediment:false,name:'quarry-shack-door'}],
    e:[{at:-1.2,w:1.05,h:1.2,y:1.0}],
    w:[{at:-1.2,w:1.05,h:1.2,y:1.0}]
   }
  });
  raTieredRoof(0,yRoof,-1.25,9.0,6.8,2,{
   style:'upper-ria',mode:'gable',gableAxis:'x',mk:'indigoslate',trimMk:'alabaster',soffitMk:'cedar',neckMk:'dolomite',
   over:.55,tierRise:.95
  });

  raTarget(-1.6,y1,3.2,'quarry-stone-porch',true);
  raTarget(0,y1,-1.25,'quarryman-hearth-room',true);

  raFurnList([
   ['ria_teak_divan',-2.2,y1,-2.9,0],
   ['ria_porphyry_table',1.8,y1,-1.9,PI/2],
   ['ria_saffron_cushion',.6,y1,-1.9,PI/2],
   ['ria_tribute_chest',2.6,y1,.6,PI],
   ['ria_offering_basin',-2.8,y1,.6,0]
  ]);
 }
});

/* 24. Three-Storey Karst-Terrace Dolomite and Cedar Walk-Up Tenement (poor, dwelling-multi) */
defBuilding({
 key:'ra_east_stepped_tenement',
 name:'Three-Storey Karst-Terrace Dolomite and Cedar Walk-Up Tenement',
 seed:7224,w:22,d:20,h:17.2,budget:108000,cut:true,
 front:{x:0,z:8.9,yaw:0},
 tags:{style:'upper-ria',wealth:'poor',types:['dwelling-multi'],role:'tenement'},
 build(){
  const y1=.42,h1=3.3,y2=y1+h1,h2=3.15,y3=y2+h2,h3=3.0,yRoof=y3+h3;
  raFloorSlab(0,y1,0,19.4,16.8,{mk:'paving',th:.42});
  raStripWalk([0,0,9.0],[0,y1,7.8],3.2);

  /* Shared Karst Spring Water-Trough & Classical Balustrade Forecourt */
  raWaterCourt(-4.2,5.4,4.2,2.2,y1+.34,.38,{style:'upper-ria',curbMk:'dolomite',trimMk:'porphyry',lotus:2});
  raClassicalBalustrade(-9.2,8.1,-2.2,8.1,y1,{style:'upper-ria',mk:'dolomite',trimMk:'porphyry',block:true});
  raClassicalBalustrade(2.2,8.1,9.2,8.1,y1,{style:'upper-ria',mk:'dolomite',trimMk:'porphyry',block:true});

  /* Ground-floor dolomite & red-porphyry multi-family block [-9.0..9.0, -7.6..1.6] */
  raWallRing(-9.0,-7.6,9.0,1.6,y1,h1,{
   style:'upper-ria',mk:'dolomite',socMk:'porphyry',dadoMk:'carve',postMk:'porphyry',
   holes:{
    s:[
     {at:-5.8,w:1.35,h:2.15,door:true,crownMk:'bronze',pediment:false,name:'east-tenement-g1'},
     {at:0,w:1.45,h:2.2,door:true,crownMk:'bronze',pediment:false,name:'east-tenement-g2'},
     {at:5.8,w:1.35,h:2.15,door:true,crownMk:'bronze',pediment:false,name:'east-tenement-g3'}
    ],
    n:[{at:-5.6,w:1.05,h:1.25,y:1.05},{at:0,w:1.05,h:1.25,y:1.05},{at:5.6,w:1.05,h:1.25,y:1.05}],
    e:[{at:-3.0,w:1.1,h:1.3,y:1.05}],
    w:[{at:-3.0,w:1.1,h:1.3,y:1.05}]
   }
  });
  for(const ix of [-3.0,3.0]){
   raWall(ix,-7.1,ix,1.1,y1,h1,{style:'upper-ria',mk:'dolomite',holes:[{at:4.1,w:1.3,h:2.1,door:true,open:true}]});
  }

  /* Exterior stone stair y1 -> y2 stone veranda, plus West flight y2 -> y3! */
  raFloorSlab(0,y2,-2.2,18.2,11.6,{mk:'paving',th:.18});
  raCeilingSlab(0,y2-.24,-3.0,17.4,8.6,{mk:'dolomite',trimMk:'silver'});
  raGrandStair(5.6,y1,6.8,5.6,y2,3.4,1.9,{mk:'dolomite',sideMk:'porphyry'});
  raClassicalBalustrade(-8.8,3.48,3.8,3.48,y2,{style:'upper-ria',mk:'dolomite',trimMk:'porphyry',h:.84,block:true});

  raWallRing(-8.8,-7.4,8.8,1.4,y2,h2,{
   style:'upper-ria',mk:'alabaster',socMk:'porphyry',dadoMk:'carve',postMk:'porphyry',
   holes:{
    s:[
     {at:-5.4,w:1.3,h:2.1,door:true,crownMk:'silver',pediment:false,name:'east-tenement-u1'},
     {at:0,w:1.35,h:2.1,door:true,crownMk:'silver',pediment:false,name:'east-tenement-u2'},
     {at:5.4,w:1.3,h:2.1,door:true,crownMk:'silver',pediment:false,name:'east-tenement-u3'}
    ],
    n:[{at:-5.2,w:1.05,h:1.25,y:1.0},{at:0,w:1.05,h:1.25,y:1.0},{at:5.2,w:1.05,h:1.25,y:1.0}]
   }
  });
  for(const px of [-8.4,-4.2,0,4.2,8.4]){
   raColumn(px,y2,3.2,h2-.1,{style:'upper-ria',mk:'porphyry',baseMk:'dolomite',capMk:'bronze',r:.16,taper:'minoan',block:false});
  }

  /* Third-storey Shan-Lanna cedar & indigo-slate loft [-5.0..5.0, -7.0..1.0] + Flat Dolomite Balustrade Side Decks */
  raFloorSlab(0,y3,-3.0,17.6,8.8,{mk:'floor',th:.18});
  raCeilingSlab(0,y3-.24,-2.2,17.6,11.0,{mk:'cedar',trimMk:'silver'});
  raGrandStair(-6.8,y2,3.1,-6.8,y3,1.2,1.65,{mk:'dolomite',sideMk:'porphyry',openUnder:true});

  raClassicalBalustrade(5.4,1.25,8.6,1.25,y3,{style:'upper-ria',mk:'dolomite',trimMk:'porphyry',block:true});
  raClassicalBalustrade(-8.6,-7.25,-8.6,1.0,y3,{style:'upper-ria',mk:'dolomite',trimMk:'porphyry',block:true});
  raClassicalBalustrade(8.6,1.0,8.6,-7.25,y3,{style:'upper-ria',mk:'dolomite',trimMk:'porphyry',block:true});

  raWallRing(-5.0,-7.0,5.0,1.0,y3,h3,{
   style:'upper-ria',mk:'cedar',socMk:'porphyry',dadoMk:'carve',postMk:'dolomite',
   holes:{
    w:[{at:-3.0,w:1.3,h:2.05,door:true,crownMk:'bronze',pediment:false,name:'east-tenement-top-door'}],
    s:[{at:-2.2,w:1.1,h:1.25,y:.95},{at:2.2,w:1.1,h:1.25,y:.95}],
    n:[{at:0,w:1.1,h:1.25,y:.95}]
   }
  });
  raTieredRoof(0,yRoof,-3.0,10.6,8.6,2,{
   style:'upper-ria',mode:'gable',gableAxis:'x',mk:'indigoslate',trimMk:'alabaster',soffitMk:'cedar',neckMk:'dolomite',
   over:.58,tierRise:.98
  });

  raTarget(1.5,y1,5.2,'karst-spring-forecourt',false);
  raTarget(0,y1,-3.0,'ground-miner-flat',true);
  raTarget(0,y2,2.4,'second-floor-porphyry-gallery',true);
  raTarget(0,y2,-3.0,'second-floor-flat',true);
  raTarget(0,y3,-3.0,'third-floor-cedar-loft',true);

  raFurnList([
   ['ria_teak_divan',-6.4,y1,-5.4,0],
   ['ria_porphyry_table',0,y1,-4.2,0],
   ['ria_glazed_amphora_rack',6.8,y1,-5.2,-PI/2],
   ['ria_teak_divan',-5.8,y2,-5.2,0],
   ['ria_porphyry_table',0,y2,-4.0,0],
   ['ria_tribute_chest',6.2,y2,-5.2,-PI/2],
   ['ria_teak_divan',1.8,y3,-4.8,0],
   ['ria_saffron_cushion',-1.8,y3,-3.2,0]
  ]);
 }
});

/* 25. Two-Storey Minoan Porphyry-Column Shophouse and Alabaster Loft (middle, dwelling-single) */
defBuilding({
 key:'ra_east_lapidary_shophouse',
 name:'Two-Storey Minoan Porphyry-Column Shophouse and Alabaster Loft',
 seed:7225,w:16,d:20,h:15.4,budget:88000,cut:true,
 front:{x:0,z:8.8,yaw:0},
 tags:{style:'upper-ria',wealth:'middle',types:['dwelling-single','shop'],role:'shophouse',job:'trading'},
 build(){
  const y1=.45,gh=3.6,y2=y1+gh,uh=3.3,yRoof=y2+uh;
  raFloorSlab(0,y1,0,13.4,16.8,{mk:'paving',th:.45});
  raStripWalk([0,0,8.9],[0,y1,7.6],3.0);

  /* Ground Minoan Tapered Red-Porphyry Colonnade Shopfront */
  raColonnade(-5.6,7.3,5.6,7.3,y1,gh,{style:'upper-ria',n:4,skipMid:1.4,mk:'porphyry',friezeMk:'dolomite',r:.22,taper:'minoan',block:false});
  raCeilingSlab(0,y2-.12,5.8,12.2,2.6,{mk:'dolomite',trimMk:'silver'});

  raWallRing(-6.0,-7.6,6.0,4.4,y1,gh,{
   style:'upper-ria',mk:'dolomite',socMk:'porphyry',dadoMk:'carve',postMk:'porphyry',
   holes:{
    s:[
     {at:-2.6,w:1.65,h:2.35,door:true,crownMk:'silver',name:'east-shophouse-door'},
     {at:2.6,w:1.35,h:1.6,y:.95,pediment:true,crownMk:'silver'}
    ],
    n:[{at:0,w:1.35,h:2.2,door:true,crownMk:'silver',name:'east-shophouse-back-door'}],
    e:[{at:-1.6,w:1.2,h:1.5,y:1.05}],
    w:[{at:-1.6,w:1.2,h:1.5,y:1.05}]
   }
  });

  const st=svStair(3.8,-5.8,y1,y2,0,{w:1.2,riser:.18,going:.27,mk:'dolomite',smk:'silver',col:P('dolomite'),scol:P('silver'),rail:'both'});
  raFloorSlab(0,y2,-.2,12.4,15.2,{mk:'mosaic',th:.18,hole:st});
  raCeilingSlab(-1.4,y2-.24,-1.6,8.2,11.2,{mk:'dolomite',trimMk:'silver'});
  raClassicalBalustrade(-5.8,7.32,5.8,7.32,y2,{style:'upper-ria',mk:'dolomite',trimMk:'porphyry',h:.86,block:true});

  raWallRing(-5.8,-7.4,5.8,4.6,y2,uh,{
   style:'upper-ria',mk:'alabaster',socMk:'porphyry',dadoMk:'carve',postMk:'porphyry',
   holes:{
    s:[
     {at:-2.8,w:1.2,h:1.5,y:.95,pediment:true,crownMk:'silver'},
     {at:0,w:1.5,h:2.25,door:true,crownMk:'silver',name:'east-shophouse-balcony-door'},
     {at:2.8,w:1.2,h:1.5,y:.95,pediment:true,crownMk:'silver'}
    ],
    n:[{at:-2.4,w:1.15,h:1.45,y:.95},{at:2.4,w:1.15,h:1.45,y:.95}],
    e:[{at:-1.4,w:1.15,h:1.45,y:.95}],
    w:[{at:-1.4,w:1.15,h:1.45,y:.95}]
   }
  });
  raTieredRoof(0,yRoof,-1.4,12.2,12.6,2,{
   style:'upper-ria',mode:'gable',gableAxis:'z',mk:'indigoslate',trimMk:'alabaster',soffitMk:'dolomite',neckMk:'alabaster',
   over:.62,tierRise:1.04
  });

  raTarget(0,y1,5.8,'minoan-shop-loggia',true);
  raTarget(-1.4,y1,-1.6,'lapidary-shop-floor',true);
  raTarget(-1.2,y2,-1.4,'upper-alabaster-salon',true);
  raTarget(0,y2,6.0,'stone-balustrade-terrace',false);

  raFurnList([
   ['ria_amber_seal_desk',-2.4,y1,1.6,0],
   ['ria_lodestone_compass',-3.8,y1,-1.4,0],
   ['ria_tribute_chest',-4.4,y1,-5.4,PI/2],
   ['ria_teak_divan',-3.2,y2,-4.8,0],
   ['ria_porphyry_table',-1.2,y2,-1.2,0],
   ['ria_saffron_cushion',-1.2,y2,.1,PI],
   ['ria_lantern_stand',2.8,y1,5.8,0]
  ]);
 }
});

/* 26. Two-Storey Classical Dolomite and Cedar Guild Apartment Block (middle, dwelling-multi) */
defBuilding({
 key:'ra_east_veranda_insula',
 name:'Two-Storey Classical Dolomite and Cedar Guild Apartment Block',
 seed:7226,w:26,d:18,h:16.0,budget:112000,cut:true,
 front:{x:0,z:7.9,yaw:0},
 tags:{style:'upper-ria',wealth:'middle',types:['dwelling-multi'],role:'apartments'},
 build(){
  const y1=.5,gh=3.6,y2=y1+gh,uh=3.35,yRoof=y2+uh;
  raFloorSlab(0,y1,0,23.2,14.8,{mk:'paving',th:.5});
  raStripWalk([0,0,8.1],[0,y1,6.8],3.6);

  /* Ground 6-bay Classical Dolomite & Porphyry Round-Arch Loggia */
  raArcade(-10.8,6.5,10.8,6.5,y1,gh,{style:'upper-ria',bays:6,mk:'dolomite',trimMk:'porphyry',pierW:.52});
  raCeilingSlab(0,y2-.12,5.0,22.0,2.6,{mk:'dolomite',trimMk:'silver'});

  raWallRing(-10.8,-6.4,10.8,3.6,y1,gh,{
   style:'upper-ria',mk:'dolomite',socMk:'porphyry',dadoMk:'carve',postMk:'porphyry',
   holes:{
    s:[
     {at:-7.2,w:1.45,h:2.25,door:true,crownMk:'silver',name:'east-insula-w-door'},
     {at:0,w:1.55,h:2.3,door:true,crownMk:'silver',name:'east-insula-m-door'},
     {at:7.2,w:1.45,h:2.25,door:true,crownMk:'silver',name:'east-insula-e-door'}
    ],
    n:[{at:-7.0,w:1.15,h:1.45,y:1.05},{at:0,w:1.2,h:1.45,y:1.05},{at:7.0,w:1.15,h:1.45,y:1.05}],
    e:[{at:-1.4,w:1.2,h:1.45,y:1.05}],
    w:[{at:-1.4,w:1.2,h:1.45,y:1.05}]
   }
  });
  for(const ix of [-3.6,3.6]){
   raWall(ix,-5.9,ix,3.1,y1,gh,{style:'upper-ria',mk:'dolomite',holes:[{at:4.5,w:1.4,h:2.2,door:true,open:true}]});
  }

  const st=svStair(-8.4,-3.8,y1,y2,0,{w:1.2,riser:.18,going:.27,mk:'dolomite',smk:'silver',col:P('dolomite'),scol:P('silver'),rail:'both'});
  raFloorSlab(0,y2,.1,21.2,12.4,{mk:'floor',th:.18,hole:st});
  raCeilingSlab(3.6,y2-.24,-1.4,13.8,9.2,{mk:'dolomite',trimMk:'silver'});

  raClassicalBalustrade(-10.5,6.22,10.5,6.22,y2,{style:'upper-ria',mk:'dolomite',trimMk:'porphyry',h:.86,block:false});
  for(const px of [-10.4,-6.2,-2.1,2.1,6.2,10.4]){
   raColumn(px,y2,6.2,uh-.1,{style:'upper-ria',mk:'alabaster',capMk:'silver',baseMk:'porphyry',r:.18,capital:'palm',block:false});
  }
  raCeilingSlab(0,yRoof-.08,5.0,21.6,2.6,{mk:'cedar',trimMk:'silver'});

  raWallRing(-10.6,-6.2,10.6,3.6,y2,uh,{
   style:'upper-ria',mk:'cedar',socMk:'porphyry',dadoMk:'carve',postMk:'dolomite',
   holes:{
    s:[
     {at:-5.2,w:1.4,h:2.2,door:true,crownMk:'silver',name:'east-insula-uw-door'},
     {at:0,w:1.45,h:2.2,door:true,crownMk:'silver',name:'east-insula-um-door'},
     {at:7.0,w:1.4,h:2.2,door:true,crownMk:'silver',name:'east-insula-ue-door'}
    ],
    n:[{at:-6.8,w:1.15,h:1.45,y:.95},{at:0,w:1.2,h:1.45,y:.95},{at:6.8,w:1.15,h:1.45,y:.95}]
   }
  });

  /* Twin Lanna Indigo-Slate End Gables + Central Flat Classical Balustrade Stone Roof Deck */
  raFlatTerraceRoof(0,yRoof,.1,8.6,13.0,{
   style:'upper-ria',mk:'dolomite',topMk:'paving',soffitMk:'dolomite',trimMk:'silver',parapet:'balustrade',skip:'ew'
  });
  for(const sx of [-7.6,7.6]){
   raTieredRoof(sx,yRoof+.18,.1,6.8,13.2,2,{
    style:'upper-ria',mode:'gable',gableAxis:'z',mk:'indigoslate',trimMk:'alabaster',soffitMk:'cedar',neckMk:'dolomite',
    over:.56,tierRise:.98
   });
  }

  raTarget(0,y1,5.0,'dolomite-ground-arcade',true);
  raTarget(0,y1,-1.4,'ground-guild-flat',true);
  raTarget(7.2,y1,-1.4,'ground-east-flat',true);
  raTarget(0,y2,5.0,'upper-palm-veranda',true);
  raTarget(2.4,y2,-1.4,'upper-factor-suite',true);

  raFurnList([
   ['ria_teak_divan',8.2,y1,-4.2,0],
   ['ria_porphyry_table',0,y1,-2.4,0],
   ['ria_amber_seal_desk',-5.6,y1,-3.8,0],
   ['ria_teak_divan',7.6,y2,-4.0,0],
   ['ria_porphyry_table',1.2,y2,-2.2,0],
   ['ria_saffron_cushion',1.2,y2,-.9,PI],
   ['ria_silk_screen',-3.2,y2,-4.0,.2],
   ['ria_lantern_stand',-4.2,y1,5.0,0],
   ['ria_lantern_stand',4.2,y1,5.0,0]
  ]);
 }
});

/* 27. Walled Porphyry-Cavetto Extended-Clan Manor and Hongsa Shrine (rich, dwelling-single) */
defBuilding({
 key:'ra_east_patrician_manor',
 name:'Walled Porphyry-Cavetto Extended-Clan Manor and Hongsa Shrine',
 seed:7227,w:30,d:26,h:19.0,budget:126000,cut:true,
 front:{x:0,z:11.9,yaw:0},
 tags:{style:'upper-ria',wealth:'rich',types:['dwelling-single'],role:'clan-compound'},
 build(){
  const y1=.6,gh=3.85,y2=y1+gh,uh=3.45,yRoof=y2+uh;
  raFloorSlab(0,y1,0,26.4,22.4,{mk:'paving',th:.6});
  raGrandStair(0,0,12.0,0,y1,10.6,3.2,{mk:'dolomite',sideMk:'porphyry',rail:'hongsa',railOpts:{scale:.75}});

  /* Front Egyptian-Ptolemaic Battered Porphyry Cavetto Gate-Pylons + Pierced Dolomite Compound Walls */
  raBatteredPylon(-2.6,10.3,1.8,1.5,y1,4.2,{style:'upper-ria',mk:'porphyry',bandMk:'dolomite',relMk:'alabaster'});
  raBatteredPylon(2.6,10.3,1.8,1.5,y1,4.2,{style:'upper-ria',mk:'porphyry',bandMk:'dolomite',relMk:'alabaster'});
  raDoor(0,y1,10.3,0,2.2,2.6,{style:'upper-ria',crownMk:'silver',name:'patrician-manor-gate'});
  raPiercedFretWall(-12.6,10.3,-3.6,10.3,y1,{style:'upper-ria',h:1.65,block:true});
  raPiercedFretWall(3.6,10.3,12.6,10.3,y1,{style:'upper-ria',h:1.65,block:true});
  raWall(12.8,10.0,12.8,-10.6,y1,2.5,{style:'upper-ria',mk:'dolomite',socMk:'porphyry',dadoMk:'carve',cornice:false});
  raWall(-12.8,-10.6,-12.8,10.0,y1,2.5,{style:'upper-ria',mk:'dolomite',socMk:'porphyry',dadoMk:'carve',cornice:false});

  /* Karst-Spring Impluvium Basin + East Silver Hongsa Ancestor Prang + West Retainer Wing */
  raWaterCourt(0,3.8,6.2,4.4,y1+.3,.45,{style:'upper-ria',curbMk:'dolomite',trimMk:'porphyry',lotus:4});
  raTopiaryUrn(-4.6,y1,6.8,.8,true);
  raTopiaryUrn(4.6,y1,6.8,.8,true);

  raPrang(8.8,y1,5.2,2.6,7.4,{style:'upper-ria',mk:'alabaster',bandMk:'porphyry',trimMk:'silver',vault:false});
  raWallBlock(8.8,y1,5.2,2.4,3.2,2.4,0);

  raWallRing(-11.8,1.4,-6.2,8.4,y1,3.3,{
   style:'upper-ria',mk:'dolomite',socMk:'porphyry',dadoMk:'carve',postMk:'porphyry',
   holes:{e:[{at:4.9,w:1.45,h:2.2,door:true,crownMk:'silver',name:'manor-steward-door'}],s:[{at:-9.0,w:1.1,h:1.35,y:1.0}]}
  });
  raFlatTerraceRoof(-9.0,y1+3.3,4.9,5.8,7.2,{
   style:'upper-ria',mk:'dolomite',topMk:'paving',soffitMk:'dolomite',trimMk:'silver',parapet:'balustrade'
  });

  /* Rear Two-Storey Green-Palm Portico & Lanna Indigo-Slate Triclinium Manor [-11.6..11.6, -10.2..-1.2] */
  raColonnade(-10.8,-.2,10.8,-.2,y1,gh,{style:'upper-ria',n:7,skipMid:1.8,mk:'alabaster',altMk:'porphyry',r:.22,capital:'palm',block:false});
  raCeilingSlab(0,y2-.12,-.7,22.2,1.2,{mk:'dolomite',trimMk:'silver'});
  raWallRing(-11.6,-10.2,11.6,-1.2,y1,gh,{
   style:'upper-ria',mk:'dolomite',socMk:'porphyry',dadoMk:'carve',postMk:'porphyry',
   holes:{
    s:[
     {at:-6.6,w:1.4,h:2.25,door:true,crownMk:'silver',name:'east-manor-w-door'},
     {at:0,w:1.95,h:2.55,door:true,crownMk:'silver',name:'east-manor-main-door'},
     {at:6.6,w:1.4,h:2.25,door:true,crownMk:'silver',name:'east-manor-e-door'}
    ],
    n:[{at:-6.4,w:1.2,h:1.5,y:1.05},{at:0,w:1.4,h:1.6,y:1.05,pediment:true},{at:6.4,w:1.2,h:1.5,y:1.05}]
   }
  });
  const st=svStair(-8.6,-8.6,y1,y2,0,{w:1.25,riser:.18,going:.27,mk:'dolomite',smk:'silver',col:P('dolomite'),scol:P('silver'),rail:'both'});
  raFloorSlab(0,y2,-5.7,22.6,8.6,{mk:'mosaic',th:.18,hole:st});
  raCeilingSlab(2.2,y2-.24,-5.7,17.6,8.2,{mk:'dolomite',trimMk:'silver'});

  raWallRing(-8.4,-9.8,8.4,-1.6,y2,uh,{
   style:'upper-ria',mk:'alabaster',socMk:'porphyry',dadoMk:'carve',postMk:'porphyry',
   holes:{
    s:[{at:-4.4,w:1.2,h:1.5,y:.95,pediment:true},{at:0,w:1.6,h:2.25,door:true,crownMk:'silver',name:'east-manor-u-door'},{at:4.4,w:1.2,h:1.5,y:.95,pediment:true}],
    w:[{at:-5.7,w:1.35,h:2.15,door:true,crownMk:'silver',name:'east-manor-uw-door'}],
    e:[{at:-5.7,w:1.35,h:2.15,door:true,crownMk:'silver',name:'east-manor-ue-door'}]
   }
  });
  for(const sx of [-10.0,10.0]){
   raClassicalBalustrade(sx-1.4,-1.5,sx+1.4,-1.5,y2,{style:'upper-ria',mk:'dolomite',trimMk:'porphyry',block:true});
   raClassicalBalustrade(sx+1.4,-9.9,sx-1.4,-9.9,y2,{style:'upper-ria',mk:'dolomite',trimMk:'porphyry',block:true});
  }
  raTieredRoof(0,yRoof,-5.7,17.4,8.8,3,{
   style:'upper-ria',mode:'gable',gableAxis:'x',mk:'indigoslate',trimMk:'alabaster',soffitMk:'dolomite',neckMk:'alabaster',
   over:.65,tierRise:1.06,spire:true,spireH:3.8
  });

  raTarget(0,y1,7.8,'manor-impluvium-court',false);
  raTarget(-9.0,y1,4.9,'steward-kitchen-hall',true);
  raTarget(2.0,y1,-5.7,'triclinium-banquet-hall',true);
  raTarget(0,y2,-5.7,'patrician-upper-salon',true);

  raFurnList([
   ['ria_porphyry_table',1.8,y1,-6.2,0],
   ['ria_saffron_cushion',.4,y1,-6.2,PI/2],
   ['ria_saffron_cushion',3.2,y1,-6.2,-PI/2],
   ['ria_teak_divan',7.4,y1,-7.2,0],
   ['ria_hongsa_lectern',-4.2,y1,-5.8,0],
   ['ria_glazed_amphora_rack',-10.2,y1,3.6,PI/2],
   ['ria_teak_divan',4.6,y2,-6.8,0],
   ['ria_silk_screen',2.2,y2,-6.8,-.2],
   ['ria_offering_basin',-3.4,y1,1.2,0],
   ['ria_offering_basin',3.4,y1,1.2,0]
  ]);
 }
});

/* 28. Two-Storey Classical Peristyle Archon and River-Master Apartments (rich, dwelling-multi) */
defBuilding({
 key:'ra_east_archon_residences',
 name:'Two-Storey Classical Peristyle Archon and River-Master Apartments',
 seed:7228,w:28,d:24,h:19.4,budget:124000,cut:true,
 front:{x:0,z:10.9,yaw:0},
 tags:{style:'upper-ria',wealth:'rich',types:['dwelling-multi'],role:'noble-apartments'},
 build(){
  const y1=.78,gh=3.85,y2=y1+gh,uh=3.45,yRoof=y2+uh;
  raPlinth(24.4,19.6,y1,{
   style:'upper-ria',baseMk:'porphyry',midMk:'dolomite',capMk:'dolomite',topMk:'mosaic',
   stepW:3.6,stepRun:1.8,rail:'hongsa',railOpts:{scale:.75}
  });

  /* Front Classical Green-Palm Peristyle Colonnade + Karst Lotus Patio */
  raColonnade(-10.8,8.8,10.8,8.8,y1,gh,{
   style:'upper-ria',n:7,skipMid:1.8,mk:'dolomite',altMk:'porphyry',r:.24,capital:'palm'
  });
  raWaterCourt(0,4.8,5.4,3.4,y1+.3,.42,{style:'upper-ria',curbMk:'alabaster',trimMk:'porphyry',lotus:4});

  raWallRing(-11.4,-9.0,11.4,1.2,y1,gh,{
   style:'upper-ria',mk:'dolomite',socMk:'porphyry',dadoMk:'carve',postMk:'porphyry',
   holes:{
    s:[
     {at:-7.8,w:1.5,h:2.35,door:true,crownMk:'silver',name:'archon-west-suite-door'},
     {at:0,w:1.85,h:2.5,door:true,crownMk:'silver',name:'archon-central-foyer-door'},
     {at:7.8,w:1.5,h:2.35,door:true,crownMk:'silver',name:'archon-east-suite-door'}
    ],
    n:[{at:-7.4,w:1.25,h:1.55,y:1.05,pediment:true},{at:0,w:1.4,h:1.65,y:1.05,pediment:true},{at:7.4,w:1.25,h:1.55,y:1.05,pediment:true}],
    e:[{at:-3.9,w:1.25,h:1.55,y:1.05,pediment:true}],
    w:[{at:-3.9,w:1.25,h:1.55,y:1.05,pediment:true}]
   }
  });
  const st=svStair(-8.8,-7.4,y1,y2,0,{w:1.25,riser:.18,going:.27,mk:'dolomite',smk:'silver',col:P('dolomite'),scol:P('silver'),rail:'both'});
  raFloorSlab(0,y2,-3.9,22.2,9.8,{mk:'mosaic',th:.18,hole:st});
  raCeilingSlab(2.2,y2-.24,-3.9,17.4,9.4,{mk:'dolomite',trimMk:'silver'});
  raCeilingSlab(0,y2-.12,8.1,22.4,1.6,{mk:'dolomite',trimMk:'silver'});

  raWallRing(-11.0,-8.8,11.0,1.0,y2,uh,{
   style:'upper-ria',mk:'alabaster',socMk:'porphyry',dadoMk:'carve',postMk:'porphyry',
   holes:{
    s:[
     {at:-7.4,w:1.25,h:1.55,y:.95,pediment:true},
     {at:-3.6,w:1.25,h:1.55,y:.95,pediment:true},
     {at:0,w:1.65,h:2.3,door:true,crownMk:'silver',name:'archon-upper-balcony-door'},
     {at:3.6,w:1.25,h:1.55,y:.95,pediment:true},
     {at:7.4,w:1.25,h:1.55,y:.95,pediment:true}
    ],
    n:[{at:-6.8,w:1.2,h:1.5,y:.95},{at:0,w:1.35,h:1.6,y:.95,pediment:true},{at:6.8,w:1.2,h:1.5,y:.95}]
   }
  });
  raFloorSlab(0,y2,2.1,6.4,2.0,{mk:'dolomite',th:.16});
  raClassicalBalustrade(-3.0,3.02,3.0,3.02,y2,{style:'upper-ria',mk:'dolomite',trimMk:'porphyry',block:true});

  for(const sx of [-8.0,8.0]){
   raFlatTerraceRoof(sx,yRoof,-3.9,6.0,9.8,{
    style:'upper-ria',mk:'dolomite',topMk:'paving',soffitMk:'dolomite',trimMk:'silver',parapet:'balustrade',skip:sx<0?'e':'w'
   });
  }
  raTieredRoof(0,yRoof+.2,-3.9,10.2,10.0,3,{
   style:'upper-ria',mode:'gable',gableAxis:'z',mk:'indigoslate',trimMk:'alabaster',soffitMk:'dolomite',neckMk:'alabaster',
   over:.64,tierRise:1.06,spire:true,spireH:4.2
  });

  raTarget(0,y1,8.1,'palm-front-peristyle',true);
  raTarget(0,y1,2.4,'archon-spring-court',false);
  raTarget(7.4,y1,-3.9,'east-rivermaster-suite',true);
  raTarget(0,y1,-3.9,'central-archon-foyer',true);
  raTarget(2.4,y2,-3.9,'upper-senator-apartment',true);

  raFurnList([
   ['ria_teak_divan',8.2,y1,-6.4,0],
   ['ria_porphyry_table',0,y1,-4.8,0],
   ['ria_saffron_cushion',-1.4,y1,-4.8,PI/2],
   ['ria_saffron_cushion',1.4,y1,-4.8,-PI/2],
   ['ria_hongsa_lectern',6.8,y2,-5.6,0],
   ['ria_teak_divan',-2.2,y2,-6.2,0],
   ['ria_silk_screen',.4,y2,-6.2,-.2],
   ['ria_lodestone_compass',-4.4,y1,4.8,0],
   ['ria_offering_basin',4.4,y1,4.8,0],
   ['ria_lantern_stand',-3.0,y1,7.8,0],
   ['ria_lantern_stand',3.0,y1,7.8,0]
  ]);
 }
});
