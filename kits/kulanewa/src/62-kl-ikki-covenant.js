// prefix: kl
// ================================================================= KULA-NA IKKI COVENANT-COMMUNES — CITADELS & PARISH HALLS (8122..8126)
// Upland & Foundry Jinaimachi Towns (The Uncrowned Bell / Kula-Na):
//   8122. kl_ikki_covenant_citadel — Moated Jinaimachi Great Hall of The Uncrowned Bell, twin drum-frustums & Covenant Bell-Cupola
//   8123. kl_ikki_mujinzo_vault    — Mujinzo Mutual-Aid Granary & Zero-Usury Parish Chest
//   8124. kl_ikki_debtor_cloister  — Sanctuary Cloister & Parish Refectory for Freed Bondsmen
//   8125. kl_ikki_otona_hall       — Otona Elected Lay-Elder Assembly & Woodblock Tract Press
//   8126. kl_ikki_infirmary_bath   — Parish Herbal Infirmary & Hot-Cistern Bathhouse

/* 22. Moated Jinaimachi Great Hall of The Uncrowned Bell */
defBuilding({
 key:'kl_ikki_covenant_citadel',
 name:'Moated Jinaimachi Great Hall of The Uncrowned Bell',
 seed:8122,w:34,d:28,h:24.2,budget:138000,cut:true,
 front:{x:0,z:13.2,yaw:0},
 tags:{style:'ikki',wealth:'rich',types:['religious','civic','military'],role:'covenant-citadel',job:'worship'},
 build(){
  const y1=.68,h1=4.0,y2=y1+h1,h2=3.65,yRoof=y2+h2;

  /* Front Jinaimachi wet moat [-15.2..15.2, 8.6..12.2] spanned by a cambered dark-cedar moat bridge! */
  klWaterChannel(0,10.4,30.4,3.6,.3,.72,{river:{name:'ikki-citadel-moat',axis:'x',speed:.34}});
  klTimberBridge(0,12.8,0,7.8,0,y1,3.2,{rails:true});

  /* Citadel courtyard platform [-14.4..14.4, -11.6..8.2] */
  klFloorSlab(0,y1,-1.7,28.8,19.8,{mk:'paving',th:y1});

  /* Battered white-kura curtain walls with stepped slate copings + timber Jinaimachi gate-portal */
  klToranaDoor(0,y1,8.0,0,2.45,2.7,{register:'kura',torana:true,leafMk:'darkcedar',name:'citadel-moat-gate'});
  svNoWalk(()=>{
   box('darkcedar',0,y1+2.95,8.0,4.8,.95,1.45,P('darkcedar'));
   klNewarRoof(0,y1+3.9,8.0,5.2,1.8,1,{style:'ikki',mode:'gable',gableAxis:'x',mk:'shingle',over:.45,tierRise:.95,ceiling:false});
  });
  for(const s of [-1,1]){
   klWall(s<0?-9.2:2.6,8.0,s<0?-2.6:9.2,8.0,y1,2.65,{style:'ikki',register:'kura'});
   klParapet(s<0?-9.2:2.6,8.0,s<0?-2.6:9.2,8.0,y1+2.65,{kind:'kura',h:.55,capMk:'slate'});
  }

  /* AF4 Twin Inhabited Arch-Nickel & Black-Iron-Hooped Slatted-Cedar Militia Drum-Frustums at SW & SE Bastions! */
  for(const sx of [-11.8,11.8]){
   klHoopedFrustum(sx,6.2,3.05,2.05,0,14.8,{
    plinthH:y1,hoops:5,
    opens:[
     {a:sx<0?0:PI,y:0,w:1.4,h:2.2,door:true,name:sx<0?'west-drum-frustum-door':'east-drum-frustum-door'},
     {a:PI/2,y:3.6,w:.9,h:1.15},
     {a:-PI/2,y:7.8,w:.9,h:1.15}
    ]
   });
  }

  /* Saffron & Indigo Covenant Banners of The Uncrowned Bell flanking the Great Hall steps */
  klBanner(-5.2,y1,3.2,0,3.6,'silkSaffron');
  klBanner(-3.4,y1,3.2,0,3.6,'silkIndigo');
  klBanner(3.4,y1,3.2,0,3.6,'silkIndigo');
  klBanner(5.2,y1,3.2,0,3.6,'silkSaffron');

  /* Great Two-Storey Dark-Cedar & Kilnbrick Jinaimachi Covenant Hall [-11.4..11.4, -10.8..2.2] */
  klTimberColonnade(-10.8,2.2,10.8,2.2,y1,h1,{style:'ikki',n:7,skipMid:1.9,trimMk:'nickel'});
  klCeilingSlab(0,y2-.24,1.2,22.2,2.0,{mk:'darkcedar',trimMk:'cedar'});

  klWallRing(-11.4,-10.8,11.4,.2,y1,h1,{
   style:'ikki',register:'kura',udatsu:'ew',udatsuD:1.35,
   holes:{
    s:[
     {at:-6.4,w:1.55,h:2.3,door:true,torana:false,leafMk:'darkcedar',name:'citadel-west-aisle-door'},
     {at:0,w:2.15,h:2.6,door:true,torana:true,leafMk:'darkcedar',name:'citadel-great-bell-door'},
     {at:6.4,w:1.55,h:2.3,door:true,torana:false,leafMk:'darkcedar',name:'citadel-east-aisle-door'}
    ],
    n:[{at:-5.8,w:1.25,h:1.35,y:1.05},{at:0,w:1.35,h:1.4,y:1.05},{at:5.8,w:1.25,h:1.35,y:1.05}]
   }
  });

  const st=klInteriorStair(8.2,-7.4,y1,y2,0,{w:1.3,riser:.18,going:.27,mk:'darkcedar',smk:'nickel',col:P('darkcedar'),scol:P('nickel'),rail:'both'});
  klFloorSlab(0,y2,-5.3,22.2,10.6,{mk:'floor',th:.18,hole:st});
  klCeilingSlab(-2.2,y2-.28,-5.3,17.2,10.0,{mk:'darkcedar',trimMk:'cedar'});

  klWallRing(-11.0,-10.5,11.0,0,y2,h2,{
   style:'ikki',register:'brick',dadoMk:'celadon',
   holes:{
    s:[{at:-6.6,w:1.55,h:1.5,y:.95},{at:-2.2,w:1.55,h:1.5,y:.95},{at:2.2,w:1.55,h:1.5,y:.95},{at:6.6,w:1.55,h:1.5,y:.95}],
    n:[{at:-5.4,w:1.45,h:1.45,y:.95},{at:5.4,w:1.45,h:1.45,y:.95}]
   }
  });

  /* AF1 Monumental 2-Tier Charcoal-Slate Jinaimachi Hipped Roof + Open Octagonal Cast-Bronze Covenant Bell-Cupola! */
  klNewarRoof(0,yRoof,-5.25,22.8,11.2,2,{
   style:'ikki',mode:'hip',mk:'slate',over:.86,tierRise:1.55,cupola:true,cupolaR:2.65,cupolaH:4.8
  });

  klTarget(0,y1,5.0,'jinaimachi-assembly-court',false);
  klTarget(0,y1,1.2,'covenant-porch-gallery',true);
  klTarget(-1.8,y1,-5.3,'great-hall-uncrowned-bell',true);
  klTarget(-2.2,y2,-5.3,'upper-covenant-gallery',true);
  klTarget(-11.8,y1,6.2,'west-militia-drum-tower',true);
  klTarget(11.8,y1,6.2,'east-militia-drum-tower',true);

  klFurnList([
   ['kulanewa_covenant_lectern',0,y1,-7.6,0],
   ['kulanewa_covenant_bell_stand',-3.4,y1,-7.4,0],
   ['kulanewa_mujinzo_chest',3.4,y1,-7.4,0],
   ['kulanewa_cedar_settle',-4.2,y1,-3.8,0],
   ['kulanewa_cedar_settle',4.2,y1,-3.8,0],
   ['kulanewa_pavise_rack',-11.8,y1,5.2,0],
   ['kulanewa_pavise_rack',11.8,y1,5.2,0],
   ['kulanewa_covenant_lectern',-2.4,y2,-5.4,0],
   ['kulanewa_cedar_settle',-2.4,y2,-3.2,PI],
   ['kulanewa_syndicate_brazier',-3.6,y1,5.2,0],
   ['kulanewa_syndicate_brazier',3.6,y1,5.2,0]
  ]);
 }
});

/* 23. Mujinzo Mutual-Aid Granary and Zero-Usury Parish Chest */
defBuilding({
 key:'kl_ikki_mujinzo_vault',
 name:'Mujinzo Mutual-Aid Granary and Zero-Usury Parish Chest',
 seed:8123,w:26,d:20,h:17.4,budget:108000,cut:true,
 front:{x:0,z:8.8,yaw:0},
 tags:{style:'ikki',wealth:'middle',types:['infrastructure','civic','farm'],role:'granary',job:'warehousing'},
 build(){
  const y1=.76,h1=3.75,y2=y1+h1,h2=3.25,yRoof=y2+h2;
  klKuraPlinth(22.0,15.8,y1,{stepW:3.6,stepRun:1.6,socMk:'sootstone'});

  /* Open front mutual-aid grain-distribution porch + Covenant banners */
  klTimberColonnade(-9.8,7.2,9.8,7.2,y1,h1,{style:'ikki',n:7,skipMid:1.8,trimMk:'nickel'});
  klCeilingSlab(0,y2-.24,5.6,20.4,3.0,{mk:'darkcedar',trimMk:'cedar'});
  klBanner(-10.0,y1,7.6,0,3.0,'silkSaffron');
  klBanner(10.0,y1,7.6,0,3.0,'silkIndigo');

  /* Heavy fireproof white-kura Mujinzo parish granary [-10.2..10.2, -7.2..4.0] with 4 stepped slate udatsu wings */
  klWallRing(-10.2,-7.2,10.2,4.0,y1,h1,{
   style:'ikki',register:'kura',
   holes:{
    s:[
     {at:-5.8,w:1.55,h:2.3,door:true,torana:false,leafMk:'iron',name:'mujinzo-west-grain-door'},
     {at:0,w:1.85,h:2.45,door:true,torana:true,leafMk:'iron',name:'mujinzo-parish-chest-door'},
     {at:5.8,w:1.55,h:2.3,door:true,torana:false,leafMk:'iron',name:'mujinzo-east-grain-door'}
    ],
    n:[{at:-5.4,w:1.1,h:1.15,y:1.5},{at:0,w:1.1,h:1.15,y:1.5},{at:5.4,w:1.1,h:1.15,y:1.5}]
   }
  });
  for(const ux of [-10.65,-3.4,3.4,10.65]){
   klUdatsuWall(ux,y1,3.5,0,1.4,h1+.75,{style:'ikki',capMk:'slate'});
  }

  const st=klInteriorStair(7.2,-4.0,y1,y2,0,{w:1.2,riser:.18,going:.27,mk:'darkcedar',smk:'iron',col:P('darkcedar'),scol:P('iron'),rail:'both'});
  klFloorSlab(0,y2,-1.6,19.8,10.8,{mk:'floor',th:.18,hole:st});
  klCeilingSlab(-2.2,y2-.28,-1.6,14.8,10.2,{mk:'darkcedar',trimMk:'cedar'});

  klWallRing(-9.9,-7.0,9.9,3.8,y2,h2,{
   style:'ikki',register:'kura',dadoMk:'celadon',
   holes:{
    s:[{at:-5.6,w:1.15,h:1.2,y:1.1},{at:0,w:1.25,h:1.25,y:1.1},{at:5.6,w:1.15,h:1.2,y:1.1}],
    n:[{at:-4.8,w:1.15,h:1.2,y:1.1},{at:4.8,w:1.15,h:1.2,y:1.1}]
   }
  });
  klNewarRoof(0,yRoof,-1.6,20.4,11.4,2,{
   style:'ikki',mode:'hip',mk:'slate',over:.74,tierRise:1.22,cupola:true,cupolaR:2.0,cupolaH:3.6
  });

  klTarget(0,y1,5.6,'mujinzo-distribution-porch',true);
  klTarget(-1.8,y1,-1.6,'mujinzo-parish-grain-vault',true);
  klTarget(-2.2,y2,-1.6,'upper-famine-reserve-loft',true);

  klFurnList([
   ['kulanewa_mujinzo_chest',0,y1,-4.6,0],
   ['kulanewa_mujinzo_chest',-3.2,y1,-4.6,0],
   ['kulanewa_grain_bin',-7.2,y1,-4.6,0],
   ['kulanewa_grain_bin',-7.2,y1,-.8,0],
   ['kulanewa_grain_bin',4.2,y1,-4.6,0],
   ['kulanewa_bullion_scale',-3.6,y1,5.6,0],
   ['kulanewa_grain_bin',-5.2,y2,-4.2,0],
   ['kulanewa_mujinzo_chest',-.8,y2,-4.2,0],
   ['kulanewa_covenant_bell_stand',3.8,y1,5.6,0]
  ]);
 }
});

/* 24. Sanctuary Cloister and Parish Refectory for Freed Bondsmen */
defBuilding({
 key:'kl_ikki_debtor_cloister',
 name:'Sanctuary Cloister and Parish Refectory for Freed Bondsmen',
 seed:8124,w:26,d:22,h:16.4,budget:110000,cut:true,
 front:{x:0,z:9.8,yaw:0},
 tags:{style:'ikki',wealth:'middle',types:['religious','inn'],role:'cloister',job:'worship'},
 build(){
  const y1=.52,h1=3.55,y2=y1+h1,h2=3.2,yRoof=y2+h2;
  klFloorSlab(0,y1,0,22.6,18.6,{mk:'paving',th:y1});
  klStair(0,0,9.9,0,y1,8.8,3.2,{mk:'sootstone',sideMk:'kura'});

  /* White-kura sanctuary wall + Torana Sanctuary Gate (inviolable refuge for runaway Karum debtors!) */
  klToranaDoor(0,y1,8.7,0,2.15,2.5,{register:'kura',torana:true,leafMk:'darkcedar',name:'sanctuary-gate-door'});
  for(const s of [-1,1]){
   klWall(s<0?-10.8:1.5,8.7,s<0?-1.5:10.8,8.7,y1,2.55,{style:'ikki',register:'kura'});
   klParapet(s<0?-10.8:1.5,8.7,s<0?-1.5:10.8,8.7,y1+2.55,{kind:'kura',h:.48,capMk:'slate'});
  }
  klWall(10.8,8.4,10.8,1.6,y1,2.55,{style:'ikki',register:'kura'});
  klWall(-10.8,1.6,-10.8,8.4,y1,2.55,{style:'ikki',register:'kura'});

  /* Sanctuary ablution basin in east court + colonnaded cloister walk */
  klWaterChannel(5.4,5.2,4.2,2.8,y1+.28,.4,{curbMk:'sootstone',bedMk:'celadon'});
  klTimberColonnade(-10.0,2.4,10.0,2.4,y1,h1,{style:'ikki',n:7,skipMid:1.8,trimMk:'nickel'});
  klCeilingSlab(0,y2-.24,1.8,20.8,1.6,{mk:'darkcedar',trimMk:'cedar'});

  /* Rear Two-Storey Communal Refectory & Freedmen Dormitory [-10.6..10.6, -8.8..1.4] */
  klWallRing(-10.6,-8.8,10.6,1.4,y1,h1,{
   style:'ikki',register:'kura',udatsu:'ew',udatsuD:1.25,
   holes:{
    s:[
     {at:-5.8,w:1.45,h:2.25,door:true,torana:false,leafMk:'darkcedar',name:'cloister-kitchen-door'},
     {at:0,w:1.85,h:2.4,door:true,torana:true,leafMk:'darkcedar',name:'cloister-refectory-door'},
     {at:5.8,w:1.45,h:2.25,door:true,torana:false,leafMk:'darkcedar',name:'cloister-chapel-door'}
    ],
    n:[{at:-5.4,w:1.2,h:1.3,y:1.05},{at:0,w:1.2,h:1.3,y:1.05},{at:5.4,w:1.2,h:1.3,y:1.05}]
   }
  });

  const st=klInteriorStair(7.6,-5.6,y1,y2,0,{w:1.2,riser:.18,going:.27,mk:'darkcedar',smk:'cedar',col:P('darkcedar'),scol:P('cedar'),rail:'both'});
  klFloorSlab(0,y2,-3.7,20.6,9.8,{mk:'floor',th:.18,hole:st});
  klCeilingSlab(-2.2,y2-.28,-3.7,15.8,9.2,{mk:'darkcedar',trimMk:'cedar'});

  klWallRing(-10.3,-8.6,10.3,1.2,y2,h2,{
   style:'ikki',register:'brick',dadoMk:'celadon',
   holes:{
    s:[{at:-6.2,w:1.45,h:1.4,y:.95},{at:-2.0,w:1.45,h:1.4,y:.95},{at:2.0,w:1.45,h:1.4,y:.95},{at:6.2,w:1.45,h:1.4,y:.95}],
    n:[{at:-5.0,w:1.4,h:1.4,y:.95},{at:5.0,w:1.4,h:1.4,y:.95}]
   }
  });
  klNewarRoof(0,yRoof,-3.7,21.2,10.4,2,{
   style:'ikki',mode:'hip',mk:'slate',over:.74,tierRise:1.22
  });

  klTarget(-3.2,y1,5.2,'sanctuary-cloister-garth',false);
  klTarget(-1.8,y1,-3.7,'parish-communal-refectory',true);
  klTarget(-2.2,y2,-3.7,'freed-bondsmen-dormitory',true);

  klFurnList([
   ['kulanewa_tea_samovar',-3.4,y1,-3.8,0],
   ['kulanewa_cedar_settle',-3.4,y1,-2.0,PI],
   ['kulanewa_covenant_lectern',2.6,y1,-5.8,0],
   ['kulanewa_mujinzo_chest',-7.4,y1,-6.2,0],
   ['kulanewa_trundle_bunk',-7.4,y2,-6.2,0],
   ['kulanewa_trundle_bunk',-3.4,y2,-6.2,0],
   ['kulanewa_trundle_bunk',.8,y2,-6.2,0],
   ['kulanewa_covenant_bell_stand',-4.8,y1,5.2,0]
  ]);
 }
});

/* 25. Otona Elected Lay-Elder Assembly and Woodblock Tract Press */
defBuilding({
 key:'kl_ikki_otona_hall',
 name:'Otona Elected Lay-Elder Assembly and Woodblock Tract Press',
 seed:8125,w:24,d:20,h:18.2,budget:106000,cut:true,
 front:{x:0,z:8.8,yaw:0},
 tags:{style:'ikki',wealth:'middle',types:['civic'],role:'assembly-hall',job:'scribing'},
 build(){
  const y1=.66,h1=3.65,y2=y1+h1,h2=3.4,yRoof=y2+h2;
  klKuraPlinth(19.8,15.8,y1,{stepW:3.2,stepRun:1.5,socMk:'sootstone'});

  klTimberColonnade(-8.8,7.0,8.8,7.0,y1,h1,{style:'ikki',n:6,skipMid:1.8,trimMk:'nickel'});
  klCeilingSlab(0,y2-.24,5.5,18.4,2.8,{mk:'darkcedar',trimMk:'cedar'});
  klBanner(-9.0,y1,7.4,0,3.1,'silkSaffron');
  klBanner(9.0,y1,7.4,0,3.1,'silkIndigo');

  /* Ground kura woodblock sermon-tract press & commune archive [-9.0..9.0, -7.2..4.2] */
  klWallRing(-9.0,-7.2,9.0,4.2,y1,h1,{
   style:'ikki',register:'kura',udatsu:'ew',udatsuD:1.25,
   holes:{
    s:[
     {at:0,w:1.9,h:2.45,door:true,torana:true,leafMk:'darkcedar',name:'otona-front-door'},
     {at:-5.0,w:1.2,h:1.3,y:1.05},
     {at:5.0,w:1.2,h:1.3,y:1.05}
    ],
    n:[{at:-4.4,w:1.2,h:1.3,y:1.05},{at:4.4,w:1.2,h:1.3,y:1.05}]
   }
  });

  const st=klInteriorStair(6.0,-4.0,y1,y2,0,{w:1.2,riser:.18,going:.27,mk:'darkcedar',smk:'nickel',col:P('darkcedar'),scol:P('nickel'),rail:'both'});
  klFloorSlab(0,y2,-1.5,17.6,11.0,{mk:'floor',th:.18,hole:st});
  klCeilingSlab(-2.0,y2-.28,-1.5,13.0,10.4,{mk:'darkcedar',trimMk:'cedar'});

  /* Upper kilnbrick + celadon-dado Otona Lay-Elder Ring-Assembly Hall */
  klWallRing(-8.8,-7.0,8.8,4.0,y2,h2,{
   style:'ikki',register:'brick',dadoMk:'celadon',
   holes:{
    s:[{at:-4.8,w:1.5,h:1.45,y:.95},{at:0,w:1.7,h:1.5,y:.95},{at:4.8,w:1.5,h:1.45,y:.95}],
    e:[{at:-1.5,w:1.4,h:1.4,y:.95}],
    w:[{at:-1.5,w:1.4,h:1.4,y:.95}],
    n:[{at:-4.2,w:1.4,h:1.4,y:.95},{at:4.2,w:1.4,h:1.4,y:.95}]
   }
  });
  klNewarRoof(0,yRoof,-1.5,18.2,11.6,2,{
   style:'ikki',mode:'hip',mk:'slate',over:.74,tierRise:1.22,cupola:true,cupolaR:2.05,cupolaH:3.8
  });

  klTarget(0,y1,5.6,'otona-tract-porch',true);
  klTarget(-1.8,y1,-1.5,'woodblock-press-hall',true);
  klTarget(-2.0,y2,-1.5,'otona-elder-assembly-room',true);

  klFurnList([
   ['kulanewa_naruqqum_table',-2.6,y1,-1.6,0],
   ['kulanewa_tablet_rack',-6.4,y1,-4.8,0],
   ['kulanewa_tablet_rack',-2.2,y1,-4.8,0],
   ['kulanewa_mujinzo_chest',2.4,y1,-4.8,0],
   ['kulanewa_covenant_lectern',-2.4,y2,-4.4,0],
   ['kulanewa_cedar_settle',-5.2,y2,-1.2,PI/2],
   ['kulanewa_cedar_settle',.8,y2,-1.2,-PI/2],
   ['kulanewa_covenant_bell_stand',3.8,y1,5.5,0]
  ]);
 }
});

/* 26. Parish Herbal Infirmary and Hot-Cistern Bathhouse */
defBuilding({
 key:'kl_ikki_infirmary_bath',
 name:'Parish Herbal Infirmary and Hot-Cistern Bathhouse',
 seed:8126,w:24,d:20,h:15.6,budget:100000,cut:true,
 front:{x:0,z:8.8,yaw:0},
 tags:{style:'ikki',wealth:'middle',types:['civic'],role:'infirmary',job:'healing'},
 build(){
  const y1=.54,h1=3.55,y2=y1+h1,h2=3.2,yRoof=y2+h2;
  klKuraPlinth(20.2,16.0,y1,{stepW:3.0,stepRun:1.45});

  /* Forecourt medicinal herb planter bed (svNoWalk) + east hot-spring cistern basin */
  svNoWalk(()=>{
   box('sootstone',-5.6,y1+.01,5.4,4.8,.34,2.8,P('sootstone'));
   box('earth',-5.6,y1+.35,5.4,4.4,.06,2.4,P('earth'));
   for(const gx of [-7.0,-5.6,-4.2])for(const gz of [4.8,6.0]){
    ellip('foliage',gx,y1+.58,gz,.52,.36,.52,P('foliage'),0,8);
   }
  });
  klWallBlock(-5.6,y1,5.4,4.8,.86,2.8,0);
  klWaterChannel(5.6,5.4,4.6,2.8,y1+.3,.42,{curbMk:'sootstone',bedMk:'copper'});

  /* Ground kura bath & apothecary ward [-9.2..9.2, -7.2..2.6] + copper kettle flue */
  klWallRing(-9.2,-7.2,9.2,2.6,y1,h1,{
   style:'ikki',register:'kura',dadoMk:'celadon',
   holes:{
    s:[
     {at:0,w:1.75,h:2.35,door:true,torana:true,leafMk:'darkcedar',name:'infirmary-main-door'},
     {at:-5.2,w:1.2,h:1.25,y:1.1},
     {at:5.2,w:1.2,h:1.25,y:1.1}
    ],
    n:[{at:-4.4,w:1.15,h:1.25,y:1.1},{at:4.4,w:1.15,h:1.25,y:1.1}]
   }
  });
  svNoWalk(()=>{
   cyl('copper',8.0,y1+h1,-5.6,.38,4.4,P('copper'),10,.3);
  });
  smokeAt(8.0,y1+h1+4.5,-5.6,{r:.25,kind:'fire'});

  const st=svStair(6.0,-4.2,y1,y2,0,{w:1.2,riser:.18,going:.27,mk:'darkcedar',smk:'copper',col:P('darkcedar'),scol:P('copper'),rail:'both'});
  klFloorSlab(0,y2,-2.3,18.0,9.4,{mk:'floor',th:.18,hole:st});
  klCeilingSlab(-2.0,y2-.28,-2.3,13.4,8.8,{mk:'darkcedar',trimMk:'cedar'});

  klWallRing(-8.9,-7.0,8.9,2.4,y2,h2,{
   style:'ikki',register:'brick',dadoMk:'celadon',
   holes:{
    s:[{at:-4.8,w:1.45,h:1.4,y:.95},{at:0,w:1.6,h:1.45,y:.95},{at:4.8,w:1.45,h:1.4,y:.95}],
    n:[{at:-4.0,w:1.4,h:1.4,y:.95},{at:4.0,w:1.4,h:1.4,y:.95}]
   }
  });
  klNewarRoof(0,yRoof,-2.3,18.4,10.0,2,{
   style:'ikki',mode:'hip',mk:'slate',over:.72,tierRise:1.18
  });

  klTarget(0,y1,5.4,'infirmary-herb-forecourt',false);
  klTarget(-1.8,y1,-2.3,'apothecary-cistern-hall',true);
  klTarget(-2.0,y2,-2.3,'convalescent-ward-loft',true);

  klFurnList([
   ['kulanewa_tea_samovar',-2.2,y1,-2.4,0],
   ['kulanewa_tablet_rack',-6.2,y1,-4.8,0],
   ['kulanewa_mujinzo_chest',1.8,y1,-4.8,0],
   ['kulanewa_trundle_bunk',-6.2,y2,-4.6,0],
   ['kulanewa_trundle_bunk',-2.2,y2,-4.6,0],
   ['kulanewa_trundle_bunk',1.8,y2,-4.6,0],
   ['kulanewa_oil_cresset',0,y1,6.4,0]
  ]);
 }
});
