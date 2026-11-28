// prefix: kl
// ================================================================= KARUM LEDGER-SYNDICATES — ALL 6 DWELLING CLASSES (8116..8121)
// Complete residential matrix across (poor | middle | rich) x (dwelling-single | dwelling-multi):
//   8116. kl_karum_banker_mansion    — rich,   dwelling-single: Walled Newar-Kura Banker Courtyard Mansion
//   8117. kl_karum_syndicate_court   — rich,   dwelling-multi:  Multi-Partner Factor Compound & Sky-Walk Frustum
//   8118. kl_karum_sanjhya_shophouse — middle, dwelling-single: 2-Storey Sanjhya Oriel Counting-Shophouse
//   8119. kl_karum_clerk_insula      — middle, dwelling-multi:  Udatsu-Walled Ledger-Clerk Apartment Row
//   8120. kl_karum_trestle_cottage   — poor,   dwelling-single: Kiyomizu River-Pile Boatman Cottage
//   8121. kl_karum_porter_tenement   — poor,   dwelling-multi:  2-Storey Quay-Porter Kura-Base Courtyard Tenement

/* 16. Walled Newar-Kura Banker Courtyard Mansion (rich, dwelling-single) */
defBuilding({
 key:'kl_karum_banker_mansion',
 name:'Walled Newar-Kura Banker Courtyard Mansion',
 seed:8116,w:28,d:24,h:17.8,budget:118000,cut:true,
 front:{x:0,z:10.8,yaw:0},
 tags:{style:'karum',wealth:'rich',types:['dwelling-single'],role:'mansion'},
 build(){
  const y1=.58,h1=3.65,y2=y1+h1,h2=3.35,yRoof=y2+h2;
  klFloorSlab(0,y1,0,24.2,20.2,{mk:'paving',th:y1});
  klStair(0,0,10.9,0,y1,9.6,3.2,{mk:'sootstone',sideMk:'kura'});

  /* Front white-kura mansion wall + repousse bronze Torana portal */
  klToranaDoor(0,y1,9.5,0,2.15,2.55,{register:'kura',torana:true,leafMk:'darkcedar',name:'mansion-gate-door'});
  for(const s of [-1,1]){
   klWall(s<0?-11.6:1.5,9.5,s<0?-1.5:11.6,9.5,y1,2.6,{style:'karum',register:'kura'});
   klParapet(s<0?-11.6:1.5,9.5,s<0?-1.5:11.6,9.5,y1+2.6,{kind:'kura',h:.48,capMk:'terracotta'});
  }
  klWall(11.6,9.2,11.6,1.4,y1,2.6,{style:'karum',register:'kura'});
  klWall(-11.6,1.4,-11.6,9.2,y1,2.6,{style:'karum',register:'kura'});

  /* Ornamental courtyard water pool + West private kura strongroom wing [-11.2..-6.2, 2.2..8.2] */
  klWaterChannel(3.8,5.4,4.8,3.2,y1+.3,.42,{curbMk:'sootstone',bedMk:'celadon'});
  klWallRing(-11.2,2.2,-6.2,8.2,y1,3.15,{
   style:'karum',register:'kura',
   holes:{e:[{at:5.2,w:1.4,h:2.15,door:true,torana:false,leafMk:'iron',name:'mansion-treasury-door'}]}
  });
  klNewarRoof(-8.7,y1+3.15,5.2,5.4,6.4,1,{style:'karum',mode:'hip',mk:'slate',over:.52,tierRise:1.0});

  /* Rear Two-Storey Newar Kilnbrick & Sanjhya Oriel Residence [-11.2..11.2, -9.4..1.2] */
  klTimberColonnade(-10.4,2.3,10.4,2.3,y1,h1,{style:'karum',n:7,skipMid:1.8,trimMk:'bronze'});
  klCeilingSlab(0,y2-.24,1.75,21.4,1.5,{mk:'darkcedar',trimMk:'cedar'});

  klWallRing(-11.2,-9.4,11.2,1.2,y1,h1,{
   style:'karum',register:'kura',udatsu:'ew',udatsuD:1.3,
   holes:{
    s:[
     {at:-6.2,w:1.45,h:2.25,door:true,torana:false,leafMk:'darkcedar',name:'mansion-west-parlour'},
     {at:0,w:1.9,h:2.45,door:true,torana:true,leafMk:'darkcedar',name:'mansion-great-hall'},
     {at:6.2,w:1.45,h:2.25,door:true,torana:false,leafMk:'darkcedar',name:'mansion-east-study'}
    ],
    n:[{at:-5.8,w:1.2,h:1.3,y:1.05},{at:0,w:1.25,h:1.35,y:1.05},{at:5.8,w:1.2,h:1.3,y:1.05}]
   }
  });

  const st=klInteriorStair(8.0,-6.2,y1,y2,0,{w:1.25,riser:.18,going:.27,mk:'darkcedar',smk:'bronze',col:P('darkcedar'),scol:P('bronze'),rail:'both'});
  klFloorSlab(0,y2,-4.1,21.8,10.2,{mk:'floor',th:.18,hole:st});
  klCeilingSlab(-2.2,y2-.28,-4.1,17.0,9.6,{mk:'darkcedar',trimMk:'cedar'});

  klWallRing(-10.9,-9.2,10.9,1.0,y2,h2,{
   style:'karum',register:'brick',dadoMk:'cobalt',
   holes:{
    s:[{at:-6.6,w:1.55,h:1.5,y:.95},{at:0,w:1.75,h:1.55,y:.95},{at:6.6,w:1.55,h:1.5,y:.95}],
    n:[{at:-5.4,w:1.45,h:1.45,y:.95},{at:5.4,w:1.45,h:1.45,y:.95}]
   }
  });
  klNewarRoof(0,yRoof,-4.1,22.4,10.8,3,{
   style:'karum',mode:'hip',mk:'terracotta',over:.74,tierRise:1.08
  });

  klTarget(0,y1,5.6,'mansion-fountain-court',false);
  klTarget(-8.7,y1,5.2,'private-kura-treasury',true);
  klTarget(-1.8,y1,-4.1,'banker-reception-hall',true);
  klTarget(-2.2,y2,-4.1,'upper-sanjhya-living-suite',true);

  klFurnList([
   ['kulanewa_amber_safe',-9.2,y1,5.2,PI/2],
   ['kulanewa_tea_samovar',0,y1,-4.4,0],
   ['kulanewa_cedar_settle',0,y1,-2.4,PI],
   ['kulanewa_naruqqum_table',5.2,y1,-5.2,0],
   ['kulanewa_trundle_bunk',-7.4,y2,-6.6,0],
   ['kulanewa_cedar_settle',-2.2,y2,-4.2,0],
   ['kulanewa_tea_samovar',-2.2,y2,-2.6,0],
   ['kulanewa_syndicate_brazier',-2.6,y1,5.4,0]
  ]);
 }
});

/* 17. Multi-Partner Factor Compound and Sky-Walk Frustum (rich, dwelling-multi) */
defBuilding({
 key:'kl_karum_syndicate_court',
 name:'Multi-Partner Factor Compound and Sky-Walk Frustum',
 seed:8117,w:28,d:24,h:18.6,budget:120000,cut:true,
 front:{x:2.2,z:10.6,yaw:0},
 tags:{style:'karum',wealth:'rich',types:['dwelling-multi'],role:'compound'},
 build(){
  const y1=.62,h1=3.65,y2=y1+h1,h2=3.35,yRoof=y2+h2;
  klKuraPlinth(24.0,19.6,y1,{stepX:2.2,stepW:3.4,stepRun:1.5});

  /* SW Partner Archive Frustum Tower (-9.0, 2.8) linked by straight E-W Sky-Walk to upper residence gallery! */
  klHoopedFrustum(-9.0,2.8,2.95,2.0,y1,14.2,{
   hoops:5,midY:y2,
   opens:[
    {a:PI/2,y:0,w:1.4,h:2.2,door:true,name:'partner-frustum-door'},
    {a:0,y:y2-y1,w:1.45,h:2.2,door:true,open:true},
    {a:PI,y:3.6,w:.9,h:1.15}
   ]
  });

  /* Two-Storey Multi-Partner Residence Block [-4.2..11.2, -9.0..5.2] (3 partner household suites!) */
  klTimberColonnade(-3.8,6.2,10.8,6.2,y1,h1,{style:'karum',n:5,trimMk:'bronze'});
  klCeilingSlab(3.5,y2-.24,5.6,15.2,1.6,{mk:'darkcedar',trimMk:'cedar'});

  klWallRing(-4.2,-9.0,11.2,5.2,y1,h1,{
   style:'karum',register:'kura',udatsu:'ew',udatsuD:1.25,
   holes:{
    s:[
     {at:-.8,w:1.5,h:2.25,door:true,torana:false,leafMk:'darkcedar',name:'partner-suite-a-door'},
     {at:3.6,w:1.75,h:2.4,door:true,torana:true,leafMk:'darkcedar',name:'partner-suite-b-door'},
     {at:8.0,w:1.5,h:2.25,door:true,torana:false,leafMk:'darkcedar',name:'partner-suite-c-door'}
    ],
    n:[{at:0,w:1.2,h:1.3,y:1.05},{at:7.0,w:1.2,h:1.3,y:1.05}]
   }
  });

  const st=klInteriorStair(8.2,-5.8,y1,y2,0,{w:1.2,riser:.18,going:.27,mk:'darkcedar',smk:'bronze',col:P('darkcedar'),scol:P('bronze'),rail:'both'});
  klFloorSlab(3.5,y2,-1.9,15.0,13.8,{mk:'floor',th:.18,hole:st});
  klCeilingSlab(1.4,y2-.28,-1.9,10.4,13.2,{mk:'darkcedar',trimMk:'cedar'});

  klWallRing(-4.0,-8.8,11.0,5.0,y2,h2,{
   style:'karum',register:'brick',dadoMk:'celadon',
   holes:{
    s:[{at:-.6,w:1.5,h:1.45,y:.95},{at:3.6,w:1.6,h:1.5,y:.95},{at:7.8,w:1.5,h:1.45,y:.95}],
    w:[{at:2.8,w:1.45,h:2.2,door:true,open:true},{at:-3.8,w:1.4,h:1.4,y:.95}],
    n:[{at:1.2,w:1.45,h:1.45,y:.95},{at:6.8,w:1.45,h:1.45,y:.95}]
   }
  });
  klSkywalk(-4.0,2.8,-7.3,2.8,y2,1.8);

  klNewarRoof(3.5,yRoof,-1.9,15.6,14.4,2,{
   style:'karum',mode:'hip',mk:'terracotta',over:.74,tierRise:1.24,cupola:true,cupolaR:1.95,cupolaH:3.5
  });

  klTarget(2.2,y1,7.8,'partner-compound-forecourt',false);
  klTarget(2.2,y1,-1.9,'partner-ground-apartments',true);
  klTarget(2.2,y2,-1.9,'partner-upper-apartments',true);
  klTarget(-9.0,y1,2.8,'archive-frustum-vault',true);
  klTarget(-9.0,y2,2.8,'archive-frustum-study',true);

  klFurnList([
   ['kulanewa_tea_samovar',.4,y1,-2.2,0],
   ['kulanewa_cedar_settle',.4,y1,-.4,PI],
   ['kulanewa_naruqqum_table',5.2,y1,-4.2,0],
   ['kulanewa_trundle_bunk',-.8,y2,-5.8,0],
   ['kulanewa_trundle_bunk',3.8,y2,-5.8,0],
   ['kulanewa_tablet_rack',-9.0,y1,1.6,0],
   ['kulanewa_amber_safe',-9.0,y2,1.8,0],
   ['kulanewa_oil_cresset',2.2,y1,7.4,0]
  ]);
 }
});

/* 18. Two-Storey Sanjhya Oriel Counting-Shophouse (middle, dwelling-single) */
defBuilding({
 key:'kl_karum_sanjhya_shophouse',
 name:'Two-Storey Sanjhya Oriel Counting-Shophouse',
 seed:8118,w:16,d:20,h:14.8,budget:86000,cut:true,
 front:{x:0,z:8.8,yaw:0},
 tags:{style:'karum',wealth:'middle',types:['dwelling-single','shop'],role:'shophouse',job:'trading'},
 build(){
  const y1=.44,h1=3.55,y2=y1+h1,h2=3.25,yRoof=y2+h2;
  klFloorSlab(0,y1,0,13.2,16.8,{mk:'paving',th:y1});
  klStair(0,0,8.9,0,y1,7.7,2.8,{mk:'sootstone',sideMk:'kura'});

  /* Ground covered Newar timber counting-porch [z = 4.6..7.6] */
  klTimberColonnade(-5.6,7.4,5.6,7.4,y1,h1,{style:'karum',n:4,skipMid:1.6,trimMk:'bronze'});
  klCeilingSlab(0,y2-.24,6.0,11.8,2.6,{mk:'darkcedar',trimMk:'cedar'});

  /* Ground kura shop-room [-5.8..5.8, -7.6..4.6] with stepped udatsu firewall wings */
  klWallRing(-5.8,-7.6,5.8,4.6,y1,h1,{
   style:'karum',register:'kura',udatsu:'ew',udatsuD:1.25,
   holes:{
    s:[
     {at:-2.2,w:1.65,h:2.3,door:true,torana:true,leafMk:'darkcedar',name:'shophouse-front-door'},
     {at:2.6,w:1.3,h:1.35,y:1.0}
    ],
    n:[{at:0,w:1.35,h:2.2,door:true,torana:false,leafMk:'darkcedar',name:'shophouse-back-door'}],
    e:[{at:-1.5,w:1.15,h:1.3,y:1.05}],
    w:[{at:-1.5,w:1.15,h:1.3,y:1.05}]
   }
  });

  const st=klInteriorStair(3.4,-4.6,y1,y2,0,{w:1.15,riser:.18,going:.27,mk:'darkcedar',smk:'cedar',col:P('darkcedar'),scol:P('cedar'),rail:'both'});
  klFloorSlab(0,y2,-.2,12.0,15.0,{mk:'floor',th:.18,hole:st});
  klCeilingSlab(-1.4,y2-.28,-1.5,8.2,11.4,{mk:'darkcedar',trimMk:'cedar'});
  klParapet(-5.6,7.25,5.6,7.25,y2,{kind:'timber'});

  /* Upper kilnbrick + cobalt-dado Family Quarters with projecting Sanjhya oriels + front balcony door */
  klWallRing(-5.6,-7.4,5.6,4.4,y2,h2,{
   style:'karum',register:'brick',dadoMk:'cobalt',
   holes:{
    s:[
     {at:-2.8,w:1.45,h:1.45,y:.95},
     {at:0,w:1.45,h:2.2,door:true,torana:false,leafMk:'darkcedar',name:'shophouse-balcony-door'},
     {at:2.8,w:1.45,h:1.45,y:.95}
    ],
    n:[{at:-2.2,w:1.35,h:1.35,y:.95},{at:2.2,w:1.35,h:1.35,y:.95}],
    e:[{at:-1.5,w:1.35,h:1.35,y:.95}],
    w:[{at:-1.5,w:1.35,h:1.35,y:.95}]
   }
  });
  klNewarRoof(0,yRoof,-1.5,12.0,12.6,2,{
   style:'karum',mode:'gable',gableAxis:'z',mk:'terracotta',over:.66,tierRise:1.12
  });

  klTarget(0,y1,6.0,'shophouse-counting-porch',true);
  klTarget(-1.4,y1,-1.5,'shophouse-ledger-room',true);
  klTarget(-1.4,y2,-1.5,'shophouse-family-loft',true);
  klTarget(0,y2,5.8,'shophouse-front-balcony',false);

  klFurnList([
   ['kulanewa_naruqqum_table',-1.8,y1,1.6,0],
   ['kulanewa_bullion_scale',2.2,y1,1.8,PI],
   ['kulanewa_amber_safe',-3.6,y1,-4.8,PI/2],
   ['kulanewa_trundle_bunk',-3.2,y2,-4.8,0],
   ['kulanewa_tea_samovar',-1.2,y2,-1.4,0],
   ['kulanewa_cedar_settle',-1.2,y2,.4,PI],
   ['kulanewa_oil_cresset',2.8,y1,6.0,0]
  ]);
 }
});

/* 19. Udatsu-Walled Ledger-Clerk Apartment Row (middle, dwelling-multi) */
defBuilding({
 key:'kl_karum_clerk_insula',
 name:'Udatsu-Walled Ledger-Clerk Apartment Row',
 seed:8119,w:26,d:18,h:15.2,budget:104000,cut:true,
 front:{x:0,z:7.9,yaw:0},
 tags:{style:'karum',wealth:'middle',types:['dwelling-multi'],role:'apartments'},
 build(){
  const y1=.48,h1=3.55,y2=y1+h1,h2=3.25,yRoof=y2+h2;
  klFloorSlab(0,y1,0,22.8,14.8,{mk:'paving',th:y1});
  klStair(0,0,8.0,0,y1,6.8,3.4,{mk:'sootstone',sideMk:'kura'});

  /* Full-width dark-cedar ground & upper verandas divided at the ends & middle by stepped Udatsu firewall wings! */
  klTimberColonnade(-10.4,6.4,10.4,6.4,y1,h1,{style:'karum',n:7,skipMid:1.8,trimMk:'bronze'});
  klCeilingSlab(0,y2-.24,5.0,21.6,2.6,{mk:'darkcedar',trimMk:'cedar'});

  klWallRing(-10.6,-6.4,10.6,3.6,y1,h1,{
   style:'karum',register:'kura',udatsu:'ew',udatsuD:1.3,
   holes:{
    s:[
     {at:-6.8,w:1.45,h:2.25,door:true,torana:false,leafMk:'darkcedar',name:'clerk-g1-door'},
     {at:0,w:1.6,h:2.3,door:true,torana:true,leafMk:'darkcedar',name:'clerk-g2-door'},
     {at:6.8,w:1.45,h:2.25,door:true,torana:false,leafMk:'darkcedar',name:'clerk-g3-door'}
    ],
    n:[{at:-6.6,w:1.15,h:1.25,y:1.05},{at:0,w:1.15,h:1.25,y:1.05},{at:6.6,w:1.15,h:1.25,y:1.05}]
   }
  });

  const st=klInteriorStair(8.0,-3.8,y1,y2,0,{w:1.2,riser:.18,going:.27,mk:'darkcedar',smk:'cedar',col:P('darkcedar'),scol:P('cedar'),rail:'both'});
  klFloorSlab(0,y2,.1,21.0,12.4,{mk:'floor',th:.18,hole:st});
  klCeilingSlab(-2.2,y2-.28,-1.4,15.6,9.2,{mk:'darkcedar',trimMk:'cedar'});

  klTimberColonnade(-10.2,6.1,10.2,6.1,y2,h2,{style:'karum',n:7,trimMk:'bronze'});
  klParapet(-10.2,6.15,10.2,6.15,y2,{kind:'timber'});
  klCeilingSlab(0,yRoof-.08,4.9,21.0,2.4,{mk:'darkcedar',trimMk:'cedar'});

  klWallRing(-10.4,-6.2,10.4,3.6,y2,h2,{
   style:'karum',register:'brick',dadoMk:'cobalt',
   holes:{
    s:[
     {at:-6.8,w:1.4,h:2.2,door:true,torana:false,leafMk:'darkcedar',name:'clerk-u1-door'},
     {at:0,w:1.45,h:2.2,door:true,torana:false,leafMk:'darkcedar',name:'clerk-u2-door'},
     {at:5.0,w:1.4,h:2.2,door:true,torana:false,leafMk:'darkcedar',name:'clerk-u3-door'}
    ],
    n:[{at:-6.4,w:1.4,h:1.4,y:.95},{at:0,w:1.4,h:1.4,y:.95},{at:6.4,w:1.4,h:1.4,y:.95}]
   }
  });
  klNewarRoof(0,yRoof,-1.3,21.4,10.6,2,{
   style:'karum',mode:'gable',gableAxis:'x',mk:'terracotta',over:.68,tierRise:1.18
  });

  klTarget(0,y1,5.0,'clerk-ground-arcade',true);
  klTarget(-2.2,y1,-1.4,'clerk-ground-apartments',true);
  klTarget(0,y2,4.9,'clerk-upper-veranda',true);
  klTarget(-2.2,y2,-1.4,'clerk-upper-apartments',true);

  klFurnList([
   ['kulanewa_trundle_bunk',-7.8,y1,-4.2,0],
   ['kulanewa_naruqqum_table',-1.2,y1,-2.6,0],
   ['kulanewa_tablet_rack',4.2,y1,-4.4,0],
   ['kulanewa_trundle_bunk',-7.6,y2,-4.0,0],
   ['kulanewa_tea_samovar',-1.4,y2,-2.2,0],
   ['kulanewa_cedar_settle',-1.4,y2,-.4,PI],
   ['kulanewa_oil_cresset',-4.2,y1,5.0,0],
   ['kulanewa_oil_cresset',4.2,y1,5.0,0]
  ]);
 }
});

/* 20. Kiyomizu River-Pile Boatman Cottage (poor, dwelling-single) */
defBuilding({
 key:'kl_karum_trestle_cottage',
 name:'Kiyomizu River-Pile Boatman Cottage',
 seed:8120,w:16,d:17,h:11.2,budget:68000,cut:true,
 front:{x:1.6,z:7.4,yaw:0},
 tags:{style:'karum',wealth:'poor',types:['dwelling-single'],role:'cottage',job:'fishing'},
 build(){
  const yDeck=1.35,gh=3.05,yRoof=yDeck+gh;

  /* Shallow river-margin slip under west side of the Kiyomizu pile deck */
  klWaterChannel(-4.8,-.4,4.4,13.6,.28,.62,{river:{name:'boatman-slip',axis:'z',speed:.38}});

  /* Interlocking dark-cedar Kiyomizu river-trestle platform [-5.2..5.6, -5.8..4.8] + front timber stair */
  klKiyomizuTrestle(.2,-.5,10.8,10.6,0,yDeck,{rails:'nw',nx:4,nz:4});
  klStair(1.6,0,7.3,1.6,yDeck,4.7,2.2,{mk:'darkcedar',cheek:'timber',openUnder:true});

  /* Front net-mending porch [z = 2.0..4.6] + plaster-and-cedar boatman cottage [-4.6..5.0, -5.4..2.0] */
  klTimberColonnade(-4.2,4.4,4.8,4.4,yDeck,gh,{style:'karum',n:4,skipMid:1.8,trimMk:'iron'});
  klCeilingSlab(.2,yRoof-.12,3.2,9.8,2.4,{mk:'darkcedar',trimMk:'cedar'});

  klWallRing(-4.6,-5.4,5.0,2.0,yDeck,gh,{
   style:'karum',register:'timber',mk:'plaster',
   holes:{
    s:[{at:1.6,w:1.4,h:2.15,door:true,torana:false,leafMk:'cedar',name:'cottage-front-door'},{at:-2.2,w:1.1,h:1.2,y:.95,flat:true}],
    e:[{at:-1.7,w:1.1,h:1.2,y:.95,flat:true}],
    n:[{at:.2,w:1.1,h:1.2,y:.95,flat:true}]
   }
  });
  klNewarRoof(.2,yRoof,-.4,10.4,10.4,1,{
   style:'karum',mode:'gable',gableAxis:'x',mk:'shingle',over:.62,tierRise:1.35
  });

  klTarget(1.6,yDeck,3.2,'boatman-net-porch',true);
  klTarget(.2,yDeck,-1.7,'boatman-living-room',true);

  klFurnList([
   ['kulanewa_trundle_bunk',-2.4,yDeck,-3.8,0],
   ['kulanewa_tea_samovar',1.8,yDeck,-2.6,0],
   ['kulanewa_cedar_settle',1.8,yDeck,-.8,PI],
   ['kulanewa_grain_bin',3.6,yDeck,-4.0,0],
   ['kulanewa_oil_cresset',-2.8,yDeck,3.2,0]
  ]);
 }
});

/* 21. Two-Storey Quay-Porter Kura-Base Courtyard Tenement (poor, dwelling-multi) */
defBuilding({
 key:'kl_karum_porter_tenement',
 name:'Two-Storey Quay-Porter Kura-Base Courtyard Tenement',
 seed:8121,w:22,d:19,h:14.6,budget:94000,cut:true,
 front:{x:0,z:8.4,yaw:0},
 tags:{style:'karum',wealth:'poor',types:['dwelling-multi'],role:'tenement'},
 build(){
  const y1=.38,h1=3.35,y2=y1+h1,h2=3.05,yRoof=y2+h2;
  klFloorSlab(0,y1,0,19.2,16.2,{mk:'cobble',th:y1});
  klStair(0,0,8.5,0,y1,7.5,3.0,{mk:'sootstone',sideMk:'kura'});

  /* Shared front well-court with sootstone wellhead (svNoWalk + klWallBlock) */
  svNoWalk(()=>{
   cyl('sootstone',-4.2,y1+.01,5.2,.82,.68,P('sootstone'),12);
   cyl('kura',-4.2,y1+.69,5.2,.88,.12,P('kura'),12);
   cyl('water',-4.2,y1+.48,5.2,.62,.06,P('water'),10);
  });
  klWallBlock(-4.2,y1,5.2,1.65,.95,1.65,0);

  /* Ground fireproof kura porter tenement flats [-8.8..8.8, -7.2..1.8] (3 doors!) */
  klWallRing(-8.8,-7.2,8.8,1.8,y1,h1,{
   style:'karum',register:'kura',udatsu:'ew',udatsuD:1.2,
   holes:{
    s:[
     {at:-5.6,w:1.35,h:2.15,door:true,torana:false,leafMk:'cedar',name:'porter-g1-door'},
     {at:0,w:1.45,h:2.2,door:true,torana:false,leafMk:'cedar',name:'porter-g2-door'},
     {at:5.6,w:1.35,h:2.15,door:true,torana:false,leafMk:'cedar',name:'porter-g3-door'}
    ],
    n:[{at:-5.4,w:1.05,h:1.2,y:1.05},{at:0,w:1.05,h:1.2,y:1.05},{at:5.4,w:1.05,h:1.2,y:1.05}]
   }
  });

  /* Exterior east courtyard stair climbing y1 -> y2 open cedar gallery [z = 1.8..3.8] */
  klFloorSlab(0,y2,-1.8,17.8,11.0,{mk:'floor',th:.18});
  klCeilingSlab(0,y2-.26,-2.7,17.2,8.4,{mk:'darkcedar',trimMk:'cedar'});
  klStair(5.8,y1,6.8,5.8,y2,3.6,1.8,{mk:'sootstone',cheek:'timber',openUnder:true});
  klParapet(-8.6,3.55,4.2,3.55,y2,{kind:'timber'});
  klTimberColonnade(-8.4,3.45,8.4,3.45,y2,h2,{style:'karum',n:6,trimMk:'iron'});
  klCeilingSlab(0,yRoof-.08,2.6,17.4,2.0,{mk:'darkcedar',trimMk:'cedar'});

  /* Second-storey kilnbrick & cedar porter flats [-8.6..8.6, -7.0..1.6] */
  klWallRing(-8.6,-7.0,8.6,1.6,y2,h2,{
   style:'karum',register:'timber',mk:'kilnbrick',
   holes:{
    s:[
     {at:-5.4,w:1.35,h:2.1,door:true,torana:false,leafMk:'cedar',name:'porter-u1-door'},
     {at:0,w:1.35,h:2.1,door:true,torana:false,leafMk:'cedar',name:'porter-u2-door'},
     {at:5.4,w:1.35,h:2.1,door:true,torana:false,leafMk:'cedar',name:'porter-u3-door'}
    ],
    n:[{at:-5.2,w:1.15,h:1.25,y:.95,flat:true},{at:0,w:1.15,h:1.25,y:.95,flat:true},{at:5.2,w:1.15,h:1.25,y:.95,flat:true}]
   }
  });
  klNewarRoof(0,yRoof,-2.7,17.8,9.4,2,{
   style:'karum',mode:'gable',gableAxis:'x',mk:'terracotta',over:.64,tierRise:1.12
  });

  klTarget(1.2,y1,5.2,'porter-well-courtyard',false);
  klTarget(0,y1,-2.7,'ground-porter-flats',true);
  klTarget(0,y2,2.6,'upper-porter-gallery',true);
  klTarget(0,y2,-2.7,'upper-porter-flats',true);

  klFurnList([
   ['kulanewa_trundle_bunk',-6.2,y1,-5.0,0],
   ['kulanewa_tea_samovar',0,y1,-3.8,0],
   ['kulanewa_grain_bin',6.4,y1,-5.0,0],
   ['kulanewa_trundle_bunk',-6.0,y2,-4.8,0],
   ['kulanewa_trundle_bunk',.4,y2,-4.8,0],
   ['kulanewa_mujinzo_chest',6.0,y2,-4.8,-PI/2],
   ['kulanewa_oil_cresset',2.4,y1,5.4,0]
  ]);
 }
});
