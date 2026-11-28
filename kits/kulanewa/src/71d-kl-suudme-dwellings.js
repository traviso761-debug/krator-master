// prefix: kl
// ================================================================= SUUDME-KAARUM ESTUARY TOWNS — ALL 6 DWELLING CLASSES (8158..8163)
// Complete residential matrix across (poor | middle | rich) x (dwelling-single | dwelling-multi) for style: 'suudme':
//   8158. kl_suudme_mandarin_court    — rich,   dwelling-single: Tooka-Vanem Patrician Peristyle and Ruan-Thai Clan Compound
//   8159. kl_suudme_patrician_palazzo — rich,   dwelling-multi:  Three-Storey Travertine Arcade and Bell-Mondop Syndicate Palazzo
//   8160. kl_suudme_sanjhya_villa     — middle, dwelling-single: Raised Ruan-Teak and Carved-Oriel Merchant Villa
//   8161. kl_suudme_arcade_insula     — middle, dwelling-multi:  Arcaded Kaarum-Insula Glazed-Spandrel Apartments
//   8162. kl_suudme_trestle_cottage   — poor,   dwelling-single: Estuary Boatman Ruan-Trestle Stilt Cottage
//   8163. kl_suudme_quay_tenement     — poor,   dwelling-multi:  Stepped Bluff-Foot Stevedore Courtyard Tenement

/* 58. Tooka-Vanem Patrician Peristyle and Ruan-Thai Clan Compound (rich, dwelling-single) */
defBuilding({
 key:'kl_suudme_mandarin_court',
 name:'Tooka-Vanem Patrician Peristyle and Ruan-Thai Clan Compound',
 seed:8158,w:28,d:24,h:18.4,budget:120000,cut:true,
 front:{x:0,z:11.0,yaw:0},
 tags:{style:'suudme',wealth:'rich',types:['dwelling-single'],role:'mansion'},
 build(){
  const y1=.58,h1=3.65,y2=y1+h1,h2=3.35,yRoof=y2+h2;
  klFloorSlab(0,y1,0,24.2,20.2,{mk:'paving',col:P('travertine'),th:y1});
  klSuudmeStair(0,0,10.9,0,y1,9.6,3.2,{nagaScale:.7});

  /* Polychrome Babylonian Ishtar Gatehouse + kura-and-cobalt compound walls with crow-step merlons! */
  klIshtarPortal(0,y1,9.5,0,2.2,2.55,{buttW:1.15,d:.94,hTot:3.65,name:'mandarin-ishtar-gate'});
  for(const s of [-1,1]){
   const xa=s<0?-11.6:2.38,xb=s<0?-2.38:11.6;
   klWall(xa,9.5,xb,9.5,y1,2.65,{style:'suudme',register:'kura',dadoMk:'cobalt'});
   klMerlonParapet(xa,9.5,xb,9.5,y1+2.65,{pal:'cobalt',bandPal:'saffron',accPal:'emerald'});
  }
  klWall(11.6,9.2,11.6,1.4,y1,2.65,{style:'suudme',register:'kura',dadoMk:'cobalt'});
  klWall(-11.6,1.4,-11.6,9.2,y1,2.65,{style:'suudme',register:'kura',dadoMk:'cobalt'});

  /* Sunny Classical travertine lotus court + West private kura bullion strongroom [-11.2..-6.2, 2.2..8.2] */
  klLotusBasin(4.2,5.4,4.8,3.2,y1+.3,.44,{lotus:6});
  klWallBlock(4.2,y1,5.4,4.8,.9,3.2,0);
  klWallRing(-11.2,2.2,-6.2,8.2,y1,3.15,{
   style:'suudme',register:'kura',dadoMk:'celadon',
   holes:{e:[{at:5.2,w:1.4,h:2.15,door:true,torana:false,leafMk:'iron',name:'mandarin-treasury-door'}]}
  });
  klBellMondop(-8.7,y1+3.15,5.2,5.4,6.4,1,{mk:'celadon',bell:false,over:.52,tierRise:.98});

  /* Rear Two-Storey Classical Travertine Arcade & Ruan-Thai Dark-Teak Manor [-11.2..11.2, -9.4..1.2] */
  klRoundArcade(-10.4,2.35,10.4,2.35,y1,h1,{bays:6,spandrelPal:'emerald'});
  klCeilingSlab(0,y2-.24,1.75,21.4,1.5,{mk:'darkcedar',col:P('teak'),trimMk:'brass',trimCol:P('gilt')});

  klWallRing(-11.2,-9.4,11.2,1.2,y1,h1,{
   style:'suudme',register:'kura',dadoMk:'cobalt',udatsu:'ew',udatsuD:1.3,
   holes:{
    s:[
     {at:-6.2,w:1.45,h:2.25,door:true,torana:false,leafMk:'lacquer',name:'mandarin-west-parlour'},
     {at:0,w:1.9,h:2.45,door:true,torana:true,leafMk:'lacquer',name:'mandarin-great-hall'},
     {at:6.2,w:1.45,h:2.25,door:true,torana:false,leafMk:'lacquer',name:'mandarin-east-study'}
    ],
    n:[{at:-5.8,w:1.2,h:1.3,y:1.05},{at:0,w:1.25,h:1.35,y:1.05},{at:5.8,w:1.2,h:1.3,y:1.05}]
   }
  });

  const st=klInteriorStair(8.0,-6.2,y1,y2,0,{w:1.25,riser:.18,going:.27,mk:'darkcedar',smk:'brass',col:P('teak'),scol:P('gilt')});
  klFloorSlab(0,y2,-4.1,21.8,10.2,{mk:'floor',th:.18,hole:st});
  klCeilingSlab(-2.2,y2-.28,-4.1,17.0,9.6,{mk:'darkcedar',col:P('teak'),trimMk:'brass',trimCol:P('gilt')});

  klTeakSanjhyaGallery(-10.9,-9.2,10.9,1.0,y2,h2,{
   friezePal:'saffron',
   holes:{
    s:[{at:-6.6,w:1.55,h:1.5,y:.95,roofMk:'celadon'},{at:0,w:1.75,h:1.55,y:.95,roofMk:'celadon'},{at:6.6,w:1.55,h:1.5,y:.95,roofMk:'celadon'}],
    n:[{at:-5.4,w:1.45,h:1.45,y:.95,roofMk:'celadon'},{at:5.4,w:1.45,h:1.45,y:.95,roofMk:'celadon'}]
   }
  });
  klBellMondop(0,yRoof,-4.1,22.4,10.8,3,{
   mk:'celadon',mode:'gable',gableAxis:'x',bell:false,over:.74,tierRise:1.08,neckH:.36
  });

  klTarget(-.8,y1,5.6,'mandarin-lotus-forecourt',false);
  klTarget(-8.7,y1,5.2,'family-kura-treasury',true);
  klTarget(-1.8,y1,-4.1,'mandarin-reception-hall',true);
  klTarget(-2.2,y2,-4.1,'ruan-thai-clan-suite',true);

  klFurnList([
   ['kulanewa_amber_safe',-9.2,y1,5.2,PI/2],
   ['kulanewa_tea_samovar',0,y1,-4.4,0],
   ['kulanewa_lotus_divan',0,y1,-2.4,PI],
   ['kulanewa_naruqqum_table',5.2,y1,-5.2,0],
   ['kulanewa_trundle_bunk',-7.4,y2,-6.6,0],
   ['kulanewa_lotus_divan',-2.2,y2,-4.2,0],
   ['kulanewa_tea_samovar',-2.2,y2,-2.4,0],
   ['kulanewa_uktena_brazier',-2.4,y1,5.4,0]
  ]);
 }
});

/* 59. Three-Storey Travertine Arcade and Bell-Mondop Syndicate Palazzo (rich, dwelling-multi) */
defBuilding({
 key:'kl_suudme_patrician_palazzo',
 name:'Three-Storey Travertine Arcade and Bell-Mondop Syndicate Palazzo',
 seed:8159,w:28,d:24,h:20.6,budget:126000,cut:true,
 front:{x:2.4,z:10.7,yaw:0},
 tags:{style:'suudme',wealth:'rich',types:['dwelling-multi'],role:'palazzo'},
 build(){
  const y1=.64,h1=3.65,y2=y1+h1,h2=3.35,y3=y2+h2,h3=3.05,yRoof=y3+h3;
  klSuudmePlinth(24.0,19.4,y1,{stepX:2.4,stepW:3.4,stepRun:1.45,nagaScale:.72});

  /* SW Inhabited Paktong-Hooped Glazed Archive Pylon (-9.0, 2.8) linked by Pyatthat Skywalk! */
  klHoopedGlazePylon(-9.0,2.8,2.95,2.0,y1,14.2,{
   hoops:5,midY:y2,
   opens:[
    {a:PI/2,y:0,w:1.4,h:2.2,door:true,name:'palazzo-pylon-door'},
    {a:0,y:y2-y1,w:1.45,h:2.2,door:true,open:true},
    {a:PI,y:3.6,w:.9,h:1.15}
   ]
  });

  /* Ground Classical Travertine Arcade + 3-Suite Kura Partner Apartments [-4.2..11.2, -9.0..5.2] */
  klRoundArcade(-3.8,6.25,10.8,6.25,y1,h1,{bays:4,spandrelPal:'cobalt'});
  klCeilingSlab(3.5,y2-.24,5.65,15.2,1.5,{mk:'darkcedar',col:P('teak'),trimMk:'brass',trimCol:P('gilt')});

  klWallRing(-4.2,-9.0,11.2,5.2,y1,h1,{
   style:'suudme',register:'kura',dadoMk:'cobalt',udatsu:'ew',udatsuD:1.25,
   holes:{
    s:[
     {at:-.8,w:1.5,h:2.25,door:true,torana:false,leafMk:'lacquer',name:'palazzo-suite-a-door'},
     {at:3.6,w:1.75,h:2.4,door:true,torana:true,leafMk:'lacquer',name:'palazzo-suite-b-door'},
     {at:8.0,w:1.5,h:2.25,door:true,torana:false,leafMk:'lacquer',name:'palazzo-suite-c-door'}
    ],
    n:[{at:0,w:1.2,h:1.3,y:1.05},{at:7.0,w:1.2,h:1.3,y:1.05}]
   }
  });

  const st1=klInteriorStair(8.2,-5.8,y1,y2,0,{w:1.2,riser:.18,going:.27,mk:'darkcedar',smk:'brass',col:P('teak'),scol:P('gilt')});
  klFloorSlab(3.5,y2,-1.9,15.0,13.8,{mk:'floor',th:.18,hole:st1});
  klCeilingSlab(1.4,y2-.28,-1.9,10.4,13.2,{mk:'darkcedar',col:P('teak'),trimMk:'brass',trimCol:P('gilt')});

  klTeakSanjhyaGallery(-4.0,-8.8,11.0,5.0,y2,h2,{
   friezePal:'saffron',
   holes:{
    s:[{at:-.6,w:1.5,h:1.45,y:.95,roofMk:'terracotta'},{at:3.6,w:1.6,h:1.5,y:.95,roofMk:'terracotta'},{at:7.8,w:1.5,h:1.45,y:.95,roofMk:'terracotta'}],
    w:[{at:2.8,w:1.45,h:2.2,door:true,open:true},{at:-3.8,w:1.4,h:1.4,y:.95,roofMk:'terracotta'}],
    n:[{at:1.2,w:1.45,h:1.45,y:.95,roofMk:'terracotta'},{at:6.8,w:1.45,h:1.45,y:.95,roofMk:'terracotta'}]
   }
  });
  klPyatthatSkywalk(-4.0,2.8,-7.3,2.8,y2,1.85,{roofMk:'celadon'});

  /* Third-storey open Classical travertine & Ruan-Teak belvedere loggia + 3-tier Bell-Mondop! */
  const st2=klInteriorStair(-.8,-5.6,y2,y3,0,{w:1.2,riser:.18,going:.27,mk:'darkcedar',smk:'paktong',col:P('teak'),scol:P('paktong')});
  klFloorSlab(3.5,y3,-1.9,14.8,13.6,{mk:'paving',col:P('travertine'),th:.18,hole:st2});
  klCeilingSlab(6.0,y3-.28,-1.9,9.2,13.0,{mk:'darkcedar',col:P('teak'),trimMk:'brass',trimCol:P('gilt')});

  klPeristyle(-3.7,4.7,10.7,4.7,y3,h3,{n:5,friezePal:'emerald'});
  klPeristyle(10.7,-8.5,-3.7,-8.5,y3,h3,{n:5,friezePal:'emerald'});
  klPeristyle(10.7,4.2,10.7,-8.0,y3,h3,{n:4,friezePal:'saffron'});
  klParapet(-3.7,4.8,10.7,4.8,y3,{kind:'timber'});
  klParapet(10.7,-8.6,-3.7,-8.6,y3,{kind:'timber'});
  klParapet(10.8,4.5,10.8,-8.3,y3,{kind:'timber'});

  klBellMondop(3.5,yRoof,-1.9,15.2,14.0,3,{
   mk:'terracotta',over:.72,tierRise:1.05,neckH:.34,bell:true,cupolaR:1.85,cupolaH:3.45,cupolaMk:'brass'
  });

  klTarget(2.4,y1,7.8,'palazzo-arcade-forecourt',false);
  klTarget(2.2,y1,-1.9,'palazzo-ground-suites',true);
  klTarget(2.2,y2,-1.9,'palazzo-sanjhya-suites',true);
  klTarget(4.2,y3,-.8,'palazzo-belvedere-loggia',true);
  klTarget(-9.0,y1,2.8,'palazzo-pylon-vault',true);
  klTarget(-9.0,y2,2.8,'palazzo-pylon-study',true);

  klFurnList([
   ['kulanewa_tea_samovar',.6,y1,-2.2,0],
   ['kulanewa_lotus_divan',.6,y1,-.2,PI],
   ['kulanewa_naruqqum_table',5.2,y1,-4.2,0],
   ['kulanewa_trundle_bunk',-.6,y2,-5.8,0],
   ['kulanewa_trundle_bunk',3.8,y2,-5.8,0],
   ['kulanewa_tea_samovar',4.8,y3,-.6,0],
   ['kulanewa_tablet_rack',-9.0,y1,1.6,0],
   ['kulanewa_amber_safe',-9.0,y2,1.8,0],
   ['kulanewa_oil_cresset',2.4,y1,7.4,0]
  ]);
 }
});

/* 60. Raised Ruan-Teak and Carved-Oriel Merchant Villa (middle, dwelling-single) */
defBuilding({
 key:'kl_suudme_sanjhya_villa',
 name:'Raised Ruan-Teak and Carved-Oriel Merchant Villa',
 seed:8160,w:18,d:20,h:15.8,budget:92000,cut:true,
 front:{x:0,z:9.4,yaw:0},
 tags:{style:'suudme',wealth:'middle',types:['dwelling-single','shop'],role:'villa',job:'trading'},
 build(){
  const y1=.48,h1=3.55,y2=y1+h1,h2=3.25,yRoof=y2+h2;
  klSuudmePlinth(14.4,16.0,y1,{stepW:2.8,stepRun:1.3,nagaScale:.64});

  /* Ground Classical travertine round-arch shopfront loggia [z = 4.4..7.2] */
  klRoundArcade(-6.2,7.2,6.2,7.2,y1,h1,{bays:3,spandrelPal:'cobalt'});
  klCeilingSlab(0,y2-.24,5.8,13.0,2.6,{mk:'darkcedar',col:P('teak'),trimMk:'brass',trimCol:P('gilt')});

  /* Ground kura & cobalt-dado merchant counting-room [-6.4..6.4, -7.4..4.4] with cobalt udatsu wings */
  klWallRing(-6.4,-7.4,6.4,4.4,y1,h1,{
   style:'suudme',register:'kura',dadoMk:'cobalt',udatsu:'ew',udatsuD:1.25,
   holes:{
    s:[
     {at:-2.2,w:1.65,h:2.3,door:true,torana:true,leafMk:'lacquer',name:'villa-front-door'},
     {at:2.8,w:1.25,h:1.3,y:1.05}
    ],
    n:[{at:0,w:1.35,h:2.2,door:true,torana:false,leafMk:'darkcedar',name:'villa-rear-door'}],
    e:[{at:-1.5,w:1.15,h:1.3,y:1.05}],
    w:[{at:-1.5,w:1.15,h:1.3,y:1.05}]
   }
  });

  const st=klInteriorStair(3.8,-4.4,y1,y2,0,{w:1.15,riser:.18,going:.27,mk:'darkcedar',smk:'brass',col:P('teak'),scol:P('gilt')});
  klFloorSlab(0,y2,-.1,13.0,14.8,{mk:'floor',th:.18,hole:st});
  klCeilingSlab(-1.4,y2-.28,-1.5,9.0,11.2,{mk:'darkcedar',col:P('teak'),trimMk:'brass',trimCol:P('gilt')});
  klMerlonParapet(-6.2,7.1,6.2,7.1,y2,{pal:'cobalt',bandPal:'saffron',accPal:'emerald'});

  /* Upper Ruan-Thai dark-teak & overhanging Sanjhya family salon + 2-tier Celadon Chofa-gable roof! */
  klTeakSanjhyaGallery(-6.2,-7.2,6.2,4.2,y2,h2,{
   friezePal:'emerald',
   holes:{
    s:[
     {at:-3.2,w:1.45,h:1.45,y:.95,roofMk:'celadon'},
     {at:0,w:1.45,h:2.2,door:true,torana:false,leafMk:'lacquer',name:'villa-balcony-door'},
     {at:3.2,w:1.45,h:1.45,y:.95,roofMk:'celadon'}
    ],
    n:[{at:-2.4,w:1.35,h:1.35,y:.95,roofMk:'celadon'},{at:2.4,w:1.35,h:1.35,y:.95,roofMk:'celadon'}],
    e:[{at:-1.5,w:1.35,h:1.35,y:.95,roofMk:'celadon'}],
    w:[{at:-1.5,w:1.35,h:1.35,y:.95,roofMk:'celadon'}]
   }
  });
  klBellMondop(0,yRoof,-1.5,13.0,12.0,2,{
   mk:'celadon',mode:'gable',gableAxis:'z',bell:false,over:.68,tierRise:1.15
  });

  klTarget(0,y1,5.8,'villa-arcade-counting-porch',true);
  klTarget(-1.4,y1,-1.5,'villa-ledger-shoproom',true);
  klTarget(-1.4,y2,-1.5,'villa-ruan-family-salon',true);
  klTarget(0,y2,5.6,'villa-merlon-balcony',false);

  klFurnList([
   ['kulanewa_naruqqum_table',-1.8,y1,1.6,0],
   ['kulanewa_bullion_scale',2.4,y1,1.8,PI],
   ['kulanewa_amber_safe',-3.8,y1,-4.8,PI/2],
   ['kulanewa_trundle_bunk',-3.6,y2,-4.8,0],
   ['kulanewa_tea_samovar',-1.2,y2,-1.4,0],
   ['kulanewa_lotus_divan',-1.2,y2,.6,PI],
   ['kulanewa_oil_cresset',3.2,y1,5.8,0]
  ]);
 }
});

/* 61. Arcaded Kaarum-Insula Glazed-Spandrel Apartments (middle, dwelling-multi) */
defBuilding({
 key:'kl_suudme_arcade_insula',
 name:'Arcaded Kaarum-Insula Glazed-Spandrel Apartments',
 seed:8161,w:26,d:19,h:16.0,budget:108000,cut:true,
 front:{x:0,z:8.9,yaw:0},
 tags:{style:'suudme',wealth:'middle',types:['dwelling-multi'],role:'apartments'},
 build(){
  const y1=.48,h1=3.55,y2=y1+h1,h2=3.25,yRoof=y2+h2;
  klFloorSlab(0,y1,0,22.8,15.2,{mk:'paving',col:P('travertine'),th:y1});
  klSuudmeStair(0,0,8.8,0,y1,7.5,3.4,{nagaScale:.66});

  /* Full-width Classical travertine round-arch ground loggia + cobalt-coped udatsu firewalls! */
  klRoundArcade(-10.4,6.6,10.4,6.6,y1,h1,{bays:6,spandrelPal:'cobalt'});
  klCeilingSlab(0,y2-.24,5.1,21.6,2.8,{mk:'darkcedar',col:P('teak'),trimMk:'brass',trimCol:P('gilt')});

  klWallRing(-10.6,-6.4,10.6,3.6,y1,h1,{
   style:'suudme',register:'kura',dadoMk:'cobalt',udatsu:'ew',udatsuD:1.3,
   holes:{
    s:[
     {at:-6.8,w:1.45,h:2.25,door:true,torana:false,leafMk:'lacquer',name:'insula-g1-door'},
     {at:0,w:1.6,h:2.3,door:true,torana:true,leafMk:'lacquer',name:'insula-g2-door'},
     {at:6.8,w:1.45,h:2.25,door:true,torana:false,leafMk:'lacquer',name:'insula-g3-door'}
    ],
    n:[{at:-6.6,w:1.15,h:1.25,y:1.05},{at:0,w:1.15,h:1.25,y:1.05},{at:6.6,w:1.15,h:1.25,y:1.05}]
   }
  });

  const st=klInteriorStair(8.0,-3.8,y1,y2,0,{w:1.2,riser:.18,going:.27,mk:'darkcedar',smk:'paktong',col:P('teak'),scol:P('paktong')});
  klFloorSlab(0,y2,.1,21.2,12.6,{mk:'floor',th:.18,hole:st});
  klCeilingSlab(-2.2,y2-.28,-1.4,15.6,9.2,{mk:'darkcedar',col:P('teak'),trimMk:'brass',trimCol:P('gilt')});

  /* Upper Ruan-Teak veranda colonnade + kilnbrick & polychrome glazed-spandrel apartments! */
  klPeristyle(-10.2,6.2,10.2,6.2,y2,h2,{n:7,friezePal:'saffron'});
  klParapet(-10.2,6.28,10.2,6.28,y2,{kind:'timber'});
  klCeilingSlab(0,yRoof-.08,4.9,21.0,2.4,{mk:'darkcedar',col:P('teak'),trimMk:'brass',trimCol:P('gilt')});

  klTeakSanjhyaGallery(-10.4,-6.2,10.4,3.6,y2,h2,{
   mk:'kilnbrick',pal:'kilnbrick',friezePal:'emerald',
   holes:{
    s:[
     {at:-6.8,w:1.4,h:2.2,door:true,torana:false,leafMk:'lacquer',name:'insula-u1-door'},
     {at:0,w:1.45,h:2.2,door:true,torana:false,leafMk:'lacquer',name:'insula-u2-door'},
     {at:5.0,w:1.4,h:2.2,door:true,torana:false,leafMk:'lacquer',name:'insula-u3-door'}
    ],
    n:[{at:-6.4,w:1.4,h:1.4,y:.95,roofMk:'terracotta'},{at:0,w:1.4,h:1.4,y:.95,roofMk:'terracotta'},{at:6.4,w:1.4,h:1.4,y:.95,roofMk:'terracotta'}]
   }
  });
  klBellMondop(0,yRoof,-1.3,21.4,10.6,2,{
   mk:'terracotta',mode:'gable',gableAxis:'x',bell:false,over:.68,tierRise:1.18
  });

  klTarget(0,y1,5.1,'insula-travertine-arcade',true);
  klTarget(-2.2,y1,-1.4,'insula-ground-apartments',true);
  klTarget(0,y2,4.9,'insula-upper-veranda',true);
  klTarget(-2.2,y2,-1.4,'insula-upper-apartments',true);

  klFurnList([
   ['kulanewa_trundle_bunk',-7.8,y1,-4.2,0],
   ['kulanewa_naruqqum_table',-1.2,y1,-2.6,0],
   ['kulanewa_tablet_rack',4.2,y1,-4.4,0],
   ['kulanewa_trundle_bunk',-7.6,y2,-4.0,0],
   ['kulanewa_tea_samovar',-1.4,y2,-2.2,0],
   ['kulanewa_lotus_divan',-1.4,y2,-.2,PI],
   ['kulanewa_oil_cresset',-4.2,y1,5.1,0],
   ['kulanewa_oil_cresset',4.2,y1,5.1,0]
  ]);
 }
});

/* 62. Estuary Boatman Ruan-Trestle Stilt Cottage (poor, dwelling-single) */
defBuilding({
 key:'kl_suudme_trestle_cottage',
 name:'Estuary Boatman Ruan-Trestle Stilt Cottage',
 seed:8162,w:16,d:18,h:12.2,budget:74000,cut:true,
 front:{x:1.6,z:7.7,yaw:0},
 tags:{style:'suudme',wealth:'poor',types:['dwelling-single'],role:'cottage',job:'fishing'},
 build(){
  const yDeck=1.38,gh=3.1,yRoof=yDeck+gh;

  /* Shallow estuary tidal creek slip beneath west side of the dark-cedar pile stage */
  klWaterChannel(-4.8,-.4,4.4,14.0,.28,.64,{river:{name:'suudme-boat-slip',axis:'z',speed:.38}});

  /* Interlocking dark-cedar Kiyomizu tidal pile platform + timber stair */
  klKiyomizuTrestle(.2,-.5,10.8,10.8,0,yDeck,{rails:'nw',nx:4,nz:4});
  klStair(1.6,0,7.6,1.6,yDeck,4.8,2.2,{mk:'darkcedar',col:P('teak'),cheek:'timber',openUnder:true});

  /* Front Ruan net-porch + plaster-and-teak cabin banded with salvaged cobalt glaze tiles! */
  klTimberColonnade(-4.2,4.5,4.8,4.5,yDeck,gh,{mk:'darkcedar',trimMk:'brass'});
  klCeilingSlab(.2,yRoof-.12,3.25,9.8,2.4,{mk:'darkcedar',col:P('teak'),trimMk:'cedar'});

  klWallRing(-4.6,-5.4,5.0,2.0,yDeck,gh,{
   style:'suudme',register:'timber',mk:'plaster',dado:.16,dadoMk:'cobalt',
   holes:{
    s:[{at:1.6,w:1.4,h:2.15,door:true,torana:false,leafMk:'lacquer',name:'suudme-cottage-door'},{at:-2.2,w:1.1,h:1.2,y:.95,flat:true}],
    e:[{at:-1.7,w:1.1,h:1.2,y:.95,flat:true}],
    n:[{at:.2,w:1.1,h:1.2,y:.95,flat:true}]
   }
  });
  /* Steep 1-tier Terracotta Ruan-Gable roof with upturned gilded chofa eave-horns! */
  klBellMondop(.2,yRoof,-.4,10.4,10.6,1,{
   mk:'terracotta',mode:'gable',gableAxis:'x',bell:false,over:.64,tierRise:1.42
  });

  klTarget(1.6,yDeck,3.2,'estuary-net-porch',true);
  klTarget(.2,yDeck,-1.7,'boatman-ruan-cabin',true);

  klFurnList([
   ['kulanewa_trundle_bunk',-2.4,yDeck,-3.8,0],
   ['kulanewa_tea_samovar',1.8,yDeck,-2.6,0],
   ['kulanewa_cedar_settle',1.8,yDeck,-.8,PI],
   ['kulanewa_grain_bin',3.6,yDeck,-4.0,0],
   ['kulanewa_oil_cresset',-2.8,yDeck,3.2,0]
  ]);
 }
});

/* 63. Stepped Bluff-Foot Stevedore Courtyard Tenement (poor, dwelling-multi) */
defBuilding({
 key:'kl_suudme_quay_tenement',
 name:'Stepped Bluff-Foot Stevedore Courtyard Tenement',
 seed:8163,w:22,d:19,h:15.2,budget:96000,cut:true,
 front:{x:0,z:8.7,yaw:0},
 tags:{style:'suudme',wealth:'poor',types:['dwelling-multi'],role:'tenement'},
 build(){
  const y1=.4,h1=3.35,y2=y1+h1,h2=3.05,yRoof=y2+h2;
  klFloorSlab(0,y1,0,19.2,16.2,{mk:'cobble',th:y1});
  klStair(0,0,8.6,0,y1,7.5,3.0,{mk:'ashlar',col:P('travertine'),sideMk:'cobalt',sideCol:P('cobalt')});

  /* Shared front well-court with travertine-and-cobalt glazed cistern wellhead */
  svNoWalk(()=>{
   cyl('ashlar',-4.2,y1+.01,5.2,.82,.66,P('travertine'),12);
   cyl('cobalt',-4.2,y1+.674,5.2,.88,.14,P('cobalt'),12);
   cyl('water',-4.2,y1+.48,5.2,.62,.06,P('water'),10);
  });
  klWallBlock(-4.2,y1,5.2,1.65,.95,1.65,0);

  /* Ground fireproof kura & cobalt-dado stevedore tenement flats [-8.8..8.8, -7.2..1.8] */
  klWallRing(-8.8,-7.2,8.8,1.8,y1,h1,{
   style:'suudme',register:'kura',dadoMk:'cobalt',udatsu:'ew',udatsuD:1.2,
   holes:{
    s:[
     {at:-5.6,w:1.35,h:2.15,door:true,torana:false,leafMk:'cedar',name:'stevedore-g1-door'},
     {at:0,w:1.45,h:2.2,door:true,torana:false,leafMk:'lacquer',name:'stevedore-g2-door'},
     {at:5.6,w:1.35,h:2.15,door:true,torana:false,leafMk:'cedar',name:'stevedore-g3-door'}
    ],
    n:[{at:-5.4,w:1.05,h:1.2,y:1.05},{at:0,w:1.05,h:1.2,y:1.05},{at:5.4,w:1.05,h:1.2,y:1.05}]
   }
  });

  /* Exterior travertine-and-timber courtyard stair climbing y1 -> y2 open Ruan-Teak gallery */
  klFloorSlab(0,y2,-1.8,17.8,11.0,{mk:'floor',th:.18});
  klCeilingSlab(0,y2-.26,-2.7,17.2,8.4,{mk:'darkcedar',col:P('teak'),trimMk:'cedar'});
  klStair(5.8,y1,6.8,5.8,y2,3.6,1.8,{mk:'ashlar',col:P('travertine'),cheek:'timber',openUnder:true});
  klParapet(-8.6,3.55,4.2,3.55,y2,{kind:'timber'});
  klTimberColonnade(-8.4,3.45,8.4,3.45,y2,h2,{mk:'darkcedar',trimMk:'paktong'});
  klCeilingSlab(0,yRoof-.08,2.6,17.4,2.0,{mk:'darkcedar',col:P('teak'),trimMk:'cedar'});

  /* Second-storey kilnbrick & saffron-frieze stevedore flats + 2-tier Chofa-gable roof! */
  klTeakSanjhyaGallery(-8.6,-7.0,8.6,1.6,y2,h2,{
   mk:'kilnbrick',pal:'kilnbrick',friezePal:'saffron',
   holes:{
    s:[
     {at:-5.4,w:1.35,h:2.1,door:true,torana:false,leafMk:'cedar',name:'stevedore-u1-door'},
     {at:0,w:1.35,h:2.1,door:true,torana:false,leafMk:'lacquer',name:'stevedore-u2-door'},
     {at:5.4,w:1.35,h:2.1,door:true,torana:false,leafMk:'cedar',name:'stevedore-u3-door'}
    ],
    n:[{at:-5.2,w:1.15,h:1.25,y:.95,flat:true},{at:0,w:1.15,h:1.25,y:.95,flat:true},{at:5.2,w:1.15,h:1.25,y:.95,flat:true}]
   }
  });
  klBellMondop(0,yRoof,-2.7,17.8,9.4,2,{
   mk:'terracotta',mode:'gable',gableAxis:'x',bell:false,over:.64,tierRise:1.12
  });

  klTarget(1.2,y1,5.2,'stevedore-cistern-courtyard',false);
  klTarget(0,y1,-2.7,'ground-stevedore-flats',true);
  klTarget(0,y2,2.6,'upper-stevedore-gallery',true);
  klTarget(0,y2,-2.7,'upper-stevedore-flats',true);

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
