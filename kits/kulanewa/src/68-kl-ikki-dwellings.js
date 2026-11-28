// prefix: kl
// ================================================================= KULA-NA IKKI COVENANT-COMMUNES — ALL 6 DWELLING CLASSES (8137..8142)
// Complete residential matrix across (poor | middle | rich) x (dwelling-single | dwelling-multi):
//   8137. kl_ikki_elder_manor      — rich,   dwelling-single: Otona Steward House & Parish Bell-Court
//   8138. kl_ikki_brotherhood_hall — rich,   dwelling-multi:  Master-Smith & Preacher Multi-Household Jinaimachi Court
//   8139. kl_ikki_smith_shophouse  — middle, dwelling-single: 2-Storey Cutler & Crossbow-Maker Shophouse
//   8140. kl_ikki_commune_row      — middle, dwelling-multi:  Shared-Well Udatsu Artisan Terrace Apartments
//   8141. kl_ikki_smelter_hut      — poor,   dwelling-single: Stone-&-Cedar Collier Cottage
//   8142. kl_ikki_foundry_tenement — poor,   dwelling-multi:  2-Storey Mill-Hand Gallery Tenement

/* 37. Vanema Steward House and Parish Bell-Court (rich, dwelling-single) */
defBuilding({
 key:'kl_ikki_elder_manor',
 name:'Vanema Steward House and Parish Bell-Court',
 seed:8137,w:26,d:22,h:17.6,budget:112000,cut:true,
 front:{x:0,z:9.8,yaw:0},
 tags:{style:'ikki',wealth:'rich',types:['dwelling-single'],role:'manor'},
 build(){
  const y1=.58,h1=3.65,y2=y1+h1,h2=3.3,yRoof=y2+h2;
  klFloorSlab(0,y1,0,22.4,18.4,{mk:'paving',th:y1});
  klStair(0,0,9.9,0,y1,8.7,3.2,{mk:'sootstone',sideMk:'kura'});

  /* White-kura parish steward compound wall + bronze Torana gate + Covenant banners */
  klToranaDoor(0,y1,8.6,0,2.1,2.5,{register:'kura',torana:true,leafMk:'darkcedar',name:'elder-court-gate'});
  for(const s of [-1,1]){
   klWall(s<0?-10.8:1.5,8.6,s<0?-1.5:10.8,8.6,y1,2.5,{style:'ikki',register:'kura'});
   klParapet(s<0?-10.8:1.5,8.6,s<0?-1.5:10.8,8.6,y1+2.5,{kind:'kura',h:.48,capMk:'slate'});
  }
  klWall(10.8,8.3,10.8,1.4,y1,2.5,{style:'ikki',register:'kura'});
  klWall(-10.8,1.4,-10.8,8.3,y1,2.5,{style:'ikki',register:'kura'});
  klBanner(-3.4,y1,4.8,0,2.9,'silkSaffron');
  klBanner(3.4,y1,4.8,0,2.9,'silkIndigo');

  /* Rear Two-Storey Kura & Celadon-Dado Kilnbrick Otona Steward House [-10.4..10.4, -8.6..1.2] */
  klTimberColonnade(-9.8,2.2,9.8,2.2,y1,h1,{style:'ikki',n:7,skipMid:1.8,trimMk:'nickel'});
  klCeilingSlab(0,y2-.24,1.65,20.4,1.5,{mk:'darkcedar',trimMk:'cedar'});

  klWallRing(-10.4,-8.6,10.4,1.2,y1,h1,{
   style:'ikki',register:'kura',udatsu:'ew',udatsuD:1.25,
   holes:{
    s:[
     {at:-5.8,w:1.45,h:2.25,door:true,torana:false,leafMk:'darkcedar',name:'elder-study-door'},
     {at:0,w:1.85,h:2.4,door:true,torana:true,leafMk:'darkcedar',name:'elder-hall-door'},
     {at:5.8,w:1.45,h:2.25,door:true,torana:false,leafMk:'darkcedar',name:'elder-hearth-door'}
    ],
    n:[{at:-5.2,w:1.2,h:1.3,y:1.05},{at:0,w:1.2,h:1.3,y:1.05},{at:5.2,w:1.2,h:1.3,y:1.05}]
   }
  });

  const st=klInteriorStair(7.4,-5.4,y1,y2,0,{w:1.2,riser:.18,going:.27,mk:'darkcedar',smk:'nickel',col:P('darkcedar'),scol:P('nickel'),rail:'both'});
  klFloorSlab(0,y2,-3.7,20.2,9.4,{mk:'floor',th:.18,hole:st});
  klCeilingSlab(-2.0,y2-.28,-3.7,15.6,8.8,{mk:'darkcedar',trimMk:'cedar'});

  klWallRing(-10.1,-8.4,10.1,1.0,y2,h2,{
   style:'ikki',register:'brick',dadoMk:'celadon',
   holes:{
    s:[{at:-6.0,w:1.5,h:1.45,y:.95},{at:0,w:1.65,h:1.5,y:.95},{at:6.0,w:1.5,h:1.45,y:.95}],
    n:[{at:-4.8,w:1.4,h:1.4,y:.95},{at:4.8,w:1.4,h:1.4,y:.95}]
   }
  });
  klNewarRoof(0,yRoof,-3.7,20.8,10.0,2,{
   style:'ikki',mode:'hip',mk:'slate',over:.74,tierRise:1.2,cupola:true,cupolaR:1.9,cupolaH:3.5
  });

  klTarget(0,y1,5.2,'otona-parish-bell-court',false);
  klTarget(-1.8,y1,-3.7,'otona-steward-hall',true);
  klTarget(-2.0,y2,-3.7,'otona-family-chambers',true);

  klFurnList([
   ['kulanewa_covenant_lectern',-5.8,y1,-5.8,0],
   ['kulanewa_tea_samovar',0,y1,-4.0,0],
   ['kulanewa_cedar_settle',0,y1,-2.0,PI],
   ['kulanewa_mujinzo_chest',4.8,y1,-5.8,0],
   ['kulanewa_trundle_bunk',-6.8,y2,-5.8,0],
   ['kulanewa_cedar_settle',-1.8,y2,-3.8,0],
   ['kulanewa_covenant_bell_stand',-6.4,y1,5.4,0],
   ['kulanewa_syndicate_brazier',6.4,y1,5.4,0]
  ]);
 }
});

/* 38. Master-Smith and Regilaul Preacher Talku-Kula Court (rich, dwelling-multi) */
defBuilding({
 key:'kl_ikki_brotherhood_hall',
 name:'Master-Smith and Regilaul Preacher Talku-Kula Court',
 seed:8138,w:28,d:24,h:17.8,budget:118000,cut:true,
 front:{x:0,z:10.8,yaw:0},
 tags:{style:'ikki',wealth:'rich',types:['dwelling-multi'],role:'jinaimachi-court'},
 build(){
  const y1=.6,h1=3.65,y2=y1+h1,h2=3.35,yRoof=y2+h2;
  klKuraPlinth(24.2,19.8,y1,{stepW:3.6,stepRun:1.5,socMk:'sootstone'});

  /* Front open dark-cedar colonnade + communal ablution basin in forecourt */
  klTimberColonnade(-10.8,8.6,10.8,8.6,y1,h1,{style:'ikki',n:7,skipMid:1.9,trimMk:'nickel'});
  klCeilingSlab(0,y2-.24,7.8,22.2,1.8,{mk:'darkcedar',trimMk:'cedar'});
  klWaterChannel(0,4.8,5.0,3.0,y1+.3,.4,{curbMk:'sootstone',bedMk:'celadon'});

  /* Two-Storey Multi-Household Jinaimachi Residence Block [-11.4..11.4, -9.2..1.4] */
  klWallRing(-11.4,-9.2,11.4,1.4,y1,h1,{
   style:'ikki',register:'kura',udatsu:'ew',udatsuD:1.3,
   holes:{
    s:[
     {at:-7.2,w:1.5,h:2.25,door:true,torana:false,leafMk:'darkcedar',name:'brotherhood-west-suite'},
     {at:0,w:1.85,h:2.45,door:true,torana:true,leafMk:'darkcedar',name:'brotherhood-common-hall'},
     {at:7.2,w:1.5,h:2.25,door:true,torana:false,leafMk:'darkcedar',name:'brotherhood-east-suite'}
    ],
    n:[{at:-6.6,w:1.2,h:1.3,y:1.05},{at:0,w:1.25,h:1.35,y:1.05},{at:6.6,w:1.2,h:1.3,y:1.05}]
   }
  });

  const st=klInteriorStair(8.4,-6.0,y1,y2,0,{w:1.25,riser:.18,going:.27,mk:'darkcedar',smk:'nickel',col:P('darkcedar'),scol:P('nickel'),rail:'both'});
  klFloorSlab(0,y2,-3.9,22.2,10.2,{mk:'floor',th:.18,hole:st});
  klCeilingSlab(-2.2,y2-.28,-3.9,17.2,9.6,{mk:'darkcedar',trimMk:'cedar'});

  klWallRing(-11.1,-9.0,11.1,1.2,y2,h2,{
   style:'ikki',register:'brick',dadoMk:'celadon',
   holes:{
    s:[{at:-7.2,w:1.5,h:1.45,y:.95},{at:-2.4,w:1.5,h:1.45,y:.95},{at:2.4,w:1.5,h:1.45,y:.95},{at:7.2,w:1.5,h:1.45,y:.95}],
    n:[{at:-5.8,w:1.45,h:1.4,y:.95},{at:5.8,w:1.45,h:1.4,y:.95}]
   }
  });
  klNewarRoof(0,yRoof,-3.9,22.8,10.8,3,{
   style:'ikki',mode:'hip',mk:'slate',over:.74,tierRise:1.08
  });

  klTarget(0,y1,7.8,'brotherhood-entry-colonnade',true);
  klTarget(-5.6,y1,4.8,'brotherhood-cloister-court',false);
  klTarget(-1.8,y1,-3.9,'brotherhood-ground-households',true);
  klTarget(-2.2,y2,-3.9,'brotherhood-upper-households',true);

  klFurnList([
   ['kulanewa_tea_samovar',0,y1,-4.2,0],
   ['kulanewa_cedar_settle',0,y1,-2.2,PI],
   ['kulanewa_covenant_lectern',-7.2,y1,-6.0,0],
   ['kulanewa_naruqqum_table',5.2,y1,-5.8,0],
   ['kulanewa_trundle_bunk',-7.8,y2,-6.4,0],
   ['kulanewa_trundle_bunk',-3.2,y2,-6.4,0],
   ['kulanewa_trundle_bunk',1.6,y2,-6.4,0],
   ['kulanewa_syndicate_brazier',-5.6,y1,4.8,0],
   ['kulanewa_covenant_bell_stand',5.6,y1,4.8,0]
  ]);
 }
});

/* 39. Two-Storey Cutler and Crossbow-Maker Shophouse (middle, dwelling-single) */
defBuilding({
 key:'kl_ikki_smith_shophouse',
 name:'Two-Storey Cutler and Crossbow-Maker Shophouse',
 seed:8139,w:16,d:20,h:14.6,budget:86000,cut:true,
 front:{x:0,z:8.8,yaw:0},
 tags:{style:'ikki',wealth:'middle',types:['dwelling-single','shop'],role:'shophouse',job:'smithing'},
 build(){
  const y1=.44,h1=3.55,y2=y1+h1,h2=3.2,yRoof=y2+h2;
  klFloorSlab(0,y1,0,13.2,16.8,{mk:'cobble',th:y1});
  klStair(0,0,8.9,0,y1,7.7,2.8,{mk:'sootstone',sideMk:'kura'});

  /* Covered front cutler & crossbow shopfront porch [z = 4.6..7.6] + small forge flue */
  klTimberColonnade(-5.6,7.4,5.6,7.4,y1,h1,{style:'ikki',n:4,skipMid:1.6,trimMk:'nickel'});
  klCeilingSlab(0,y2-.24,6.0,11.8,2.6,{mk:'darkcedar',trimMk:'cedar'});

  klWallRing(-5.8,-7.6,5.8,4.6,y1,h1,{
   style:'ikki',register:'kura',udatsu:'ew',udatsuD:1.25,
   holes:{
    s:[
     {at:-2.2,w:1.65,h:2.3,door:true,torana:true,leafMk:'darkcedar',name:'cutler-shop-door'},
     {at:2.6,w:1.25,h:1.3,y:1.05}
    ],
    n:[{at:0,w:1.35,h:2.2,door:true,torana:false,leafMk:'darkcedar',name:'cutler-back-door'}]
   }
  });
  svNoWalk(()=>{
   cyl('iron',-4.6,y1+h1+h2-.4,-6.2,.32,2.2,P('iron'),10);
  });
  smokeAt(-4.6,y1+h1+h2+1.9,-6.2,{r:.22,kind:'fire'});

  const st=klInteriorStair(3.4,-4.6,y1,y2,0,{w:1.15,riser:.18,going:.27,mk:'darkcedar',smk:'iron',col:P('darkcedar'),scol:P('iron'),rail:'both'});
  klFloorSlab(0,y2,-.2,12.0,15.0,{mk:'floor',th:.18,hole:st});
  klCeilingSlab(-1.4,y2-.28,-1.5,8.2,11.4,{mk:'darkcedar',trimMk:'cedar'});
  klParapet(-5.6,7.25,5.6,7.25,y2,{kind:'timber'});

  klWallRing(-5.6,-7.4,5.6,4.4,y2,h2,{
   style:'ikki',register:'brick',dadoMk:'celadon',
   holes:{
    s:[
     {at:-2.8,w:1.45,h:1.4,y:.95},
     {at:0,w:1.45,h:2.2,door:true,torana:false,leafMk:'darkcedar',name:'cutler-balcony-door'},
     {at:2.8,w:1.45,h:1.4,y:.95}
    ],
    n:[{at:-2.2,w:1.35,h:1.35,y:.95},{at:2.2,w:1.35,h:1.35,y:.95}]
   }
  });
  klNewarRoof(0,yRoof,-1.5,12.0,12.6,2,{
   style:'ikki',mode:'gable',gableAxis:'z',mk:'slate',over:.66,tierRise:1.12
  });

  klTarget(0,y1,6.0,'cutler-shop-porch',true);
  klTarget(-1.4,y1,-1.5,'crossbow-workshop-room',true);
  klTarget(-1.4,y2,-1.5,'artisan-family-loft',true);
  klTarget(0,y2,5.8,'cutler-front-balcony',false);

  klFurnList([
   ['kulanewa_trip_anvil',2.2,y1,1.8,0],
   ['kulanewa_pavise_rack',-3.6,y1,-4.8,0],
   ['kulanewa_mujinzo_chest',-3.6,y1,1.6,PI/2],
   ['kulanewa_trundle_bunk',-3.2,y2,-4.8,0],
   ['kulanewa_tea_samovar',-1.2,y2,-1.4,0],
   ['kulanewa_cedar_settle',-1.2,y2,.4,PI],
   ['kulanewa_oil_cresset',2.8,y1,6.0,0]
  ]);
 }
});

/* 40. Shared-Well Udatsu Artisan Terrace Apartments (middle, dwelling-multi) */
defBuilding({
 key:'kl_ikki_commune_row',
 name:'Shared-Well Udatsu Artisan Terrace Apartments',
 seed:8140,w:26,d:18,h:15.0,budget:102000,cut:true,
 front:{x:0,z:7.9,yaw:0},
 tags:{style:'ikki',wealth:'middle',types:['dwelling-multi'],role:'apartments'},
 build(){
  const y1=.46,h1=3.5,y2=y1+h1,h2=3.2,yRoof=y2+h2;
  klFloorSlab(0,y1,0,22.8,14.8,{mk:'paving',th:y1});
  klStair(0,0,8.0,0,y1,6.8,3.4,{mk:'sootstone',sideMk:'kura'});

  klTimberColonnade(-10.4,6.4,10.4,6.4,y1,h1,{style:'ikki',n:7,skipMid:1.8,trimMk:'nickel'});
  klCeilingSlab(0,y2-.24,5.0,21.6,2.6,{mk:'darkcedar',trimMk:'cedar'});

  /* Ground kura rowhouse [-10.6..10.6, -6.4..3.6] with 4 stepped slate Udatsu firewalls! */
  klWallRing(-10.6,-6.4,10.6,3.6,y1,h1,{
   style:'ikki',register:'kura',
   holes:{
    s:[
     {at:-6.8,w:1.45,h:2.2,door:true,torana:false,leafMk:'darkcedar',name:'commune-g1-door'},
     {at:0,w:1.55,h:2.25,door:true,torana:true,leafMk:'darkcedar',name:'commune-g2-door'},
     {at:6.8,w:1.45,h:2.2,door:true,torana:false,leafMk:'darkcedar',name:'commune-g3-door'}
    ],
    n:[{at:-6.6,w:1.15,h:1.25,y:1.05},{at:0,w:1.15,h:1.25,y:1.05},{at:6.6,w:1.15,h:1.25,y:1.05}]
   }
  });
  for(const ux of [-11.05,-3.5,3.5,11.05]){
   klUdatsuWall(ux,y1,3.1,0,1.3,h1+h2+.3,{style:'ikki',capMk:'slate'});
  }

  const st=klInteriorStair(8.0,-3.8,y1,y2,0,{w:1.2,riser:.18,going:.27,mk:'darkcedar',smk:'cedar',col:P('darkcedar'),scol:P('cedar'),rail:'both'});
  klFloorSlab(0,y2,.1,21.0,12.4,{mk:'floor',th:.18,hole:st});
  klCeilingSlab(-2.2,y2-.28,-1.4,15.6,9.2,{mk:'darkcedar',trimMk:'cedar'});

  klTimberColonnade(-10.2,6.1,10.2,6.1,y2,h2,{style:'ikki',n:7,trimMk:'nickel'});
  klParapet(-10.2,6.15,10.2,6.15,y2,{kind:'timber'});
  klCeilingSlab(0,yRoof-.08,4.9,21.0,2.4,{mk:'darkcedar',trimMk:'cedar'});

  klWallRing(-10.4,-6.2,10.4,3.6,y2,h2,{
   style:'ikki',register:'brick',dadoMk:'celadon',
   holes:{
    s:[
     {at:-6.8,w:1.4,h:2.15,door:true,torana:false,leafMk:'darkcedar',name:'commune-u1-door'},
     {at:0,w:1.45,h:2.15,door:true,torana:false,leafMk:'darkcedar',name:'commune-u2-door'},
     {at:5.0,w:1.4,h:2.15,door:true,torana:false,leafMk:'darkcedar',name:'commune-u3-door'}
    ],
    n:[{at:-6.4,w:1.4,h:1.4,y:.95},{at:0,w:1.4,h:1.4,y:.95},{at:6.4,w:1.4,h:1.4,y:.95}]
   }
  });
  klNewarRoof(0,yRoof,-1.3,21.4,10.6,2,{
   style:'ikki',mode:'gable',gableAxis:'x',mk:'slate',over:.68,tierRise:1.16
  });

  klTarget(0,y1,5.0,'commune-ground-veranda',true);
  klTarget(-2.2,y1,-1.4,'commune-ground-flats',true);
  klTarget(0,y2,4.9,'commune-upper-veranda',true);
  klTarget(-2.2,y2,-1.4,'commune-upper-flats',true);

  klFurnList([
   ['kulanewa_trundle_bunk',-7.8,y1,-4.2,0],
   ['kulanewa_tea_samovar',-1.2,y1,-2.6,0],
   ['kulanewa_mujinzo_chest',4.2,y1,-4.4,0],
   ['kulanewa_trundle_bunk',-7.6,y2,-4.0,0],
   ['kulanewa_tea_samovar',-1.4,y2,-2.2,0],
   ['kulanewa_cedar_settle',-1.4,y2,-.4,PI],
   ['kulanewa_covenant_bell_stand',-4.2,y1,5.0,0],
   ['kulanewa_oil_cresset',4.2,y1,5.0,0]
  ]);
 }
});

/* 41. Stone-and-Cedar Collier Cottage (poor, dwelling-single) */
defBuilding({
 key:'kl_ikki_smelter_hut',
 name:'Stone-and-Cedar Collier Cottage',
 seed:8141,w:15,d:15,h:10.4,budget:62000,cut:true,
 front:{x:0,z:6.4,yaw:0},
 tags:{style:'ikki',wealth:'poor',types:['dwelling-single'],role:'cottage',job:'mining'},
 build(){
  const y1=.64,gh=3.0,yRoof=y1+gh;
  klKuraPlinth(10.6,10.2,y1,{stepW:2.2,stepRun:1.35,socMk:'sootstone',topMk:'cobble'});

  /* Covered front fuel-wood porch [z = 2.2..4.8] + stone-socle cedar cottage [-4.8..4.8, -4.8..2.2] */
  klTimberColonnade(-4.4,4.6,4.4,4.6,y1,gh,{style:'ikki',n:3,skipMid:1.6,trimMk:'iron'});
  klCeilingSlab(0,yRoof-.12,3.4,9.6,2.2,{mk:'darkcedar',trimMk:'cedar'});

  klWallRing(-4.8,-4.8,4.8,2.2,y1,gh,{
   style:'ikki',register:'timber',mk:'plaster',
   holes:{
    s:[{at:-1.4,w:1.35,h:2.1,door:true,torana:false,leafMk:'cedar',name:'collier-hut-door'},{at:2.2,w:1.05,h:1.15,y:.95,flat:true}],
    e:[{at:-1.3,w:1.05,h:1.15,y:.95,flat:true}],
    w:[{at:-1.3,w:1.05,h:1.15,y:.95,flat:true}]
   }
  });
  klNewarRoof(0,yRoof,-.1,10.2,10.2,1,{
   style:'ikki',mode:'gable',gableAxis:'x',mk:'shingle',over:.58,tierRise:1.32
  });

  klTarget(0,y1,3.4,'collier-porch',true);
  klTarget(0,y1,-1.3,'collier-hearth-room',true);

  klFurnList([
   ['kulanewa_trundle_bunk',-2.4,y1,-3.2,0],
   ['kulanewa_tea_samovar',1.8,y1,-2.2,0],
   ['kulanewa_cedar_settle',1.8,y1,-.4,PI],
   ['kulanewa_grain_bin',3.4,y1,-3.4,0],
   ['kulanewa_oil_cresset',2.8,y1,3.4,0]
  ]);
 }
});

/* 42. Two-Storey Mill-Hand Gallery Tenement (poor, dwelling-multi) */
defBuilding({
 key:'kl_ikki_foundry_tenement',
 name:'Two-Storey Mill-Hand Gallery Tenement',
 seed:8142,w:22,d:19,h:14.6,budget:94000,cut:true,
 front:{x:0,z:8.4,yaw:0},
 tags:{style:'ikki',wealth:'poor',types:['dwelling-multi'],role:'tenement'},
 build(){
  const y1=.4,h1=3.35,y2=y1+h1,h2=3.05,yRoof=y2+h2;
  klFloorSlab(0,y1,0,19.2,16.2,{mk:'cobble',th:y1});
  klStair(0,0,8.5,0,y1,7.5,3.0,{mk:'sootstone',sideMk:'kura'});

  /* Communal parish cistern wellhead in West forecourt (svNoWalk + klWallBlock) */
  svNoWalk(()=>{
   cyl('sootstone',-4.4,y1+.01,5.2,.84,.7,P('sootstone'),12);
   cyl('kura',-4.4,y1+.71,5.2,.9,.12,P('kura'),12);
   cyl('water',-4.4,y1+.5,5.2,.64,.06,P('water'),10);
  });
  klWallBlock(-4.4,y1,5.2,1.7,.95,1.7,0);

  /* Ground fireproof kura mill-hand tenement flats [-8.8..8.8, -7.2..1.8] */
  klWallRing(-8.8,-7.2,8.8,1.8,y1,h1,{
   style:'ikki',register:'kura',udatsu:'ew',udatsuD:1.2,
   holes:{
    s:[
     {at:-5.6,w:1.35,h:2.15,door:true,torana:false,leafMk:'cedar',name:'millhand-g1-door'},
     {at:0,w:1.45,h:2.2,door:true,torana:false,leafMk:'cedar',name:'millhand-g2-door'},
     {at:5.6,w:1.35,h:2.15,door:true,torana:false,leafMk:'cedar',name:'millhand-g3-door'}
    ],
    n:[{at:-5.4,w:1.05,h:1.2,y:1.05},{at:0,w:1.05,h:1.2,y:1.05},{at:5.4,w:1.05,h:1.2,y:1.05}]
   }
  });

  /* Exterior east courtyard stair climbing y1 -> y2 open dark-cedar gallery */
  klFloorSlab(0,y2,-1.8,17.8,11.0,{mk:'floor',th:.18});
  klCeilingSlab(0,y2-.26,-2.7,17.2,8.4,{mk:'darkcedar',trimMk:'cedar'});
  klStair(5.8,y1,6.8,5.8,y2,3.6,1.8,{mk:'sootstone',cheek:'timber',openUnder:true});
  klParapet(-8.6,3.55,4.2,3.55,y2,{kind:'timber'});
  klTimberColonnade(-8.4,3.45,8.4,3.45,y2,h2,{style:'ikki',n:6,trimMk:'iron'});
  klCeilingSlab(0,yRoof-.08,2.6,17.4,2.0,{mk:'darkcedar',trimMk:'cedar'});

  klWallRing(-8.6,-7.0,8.6,1.6,y2,h2,{
   style:'ikki',register:'timber',mk:'cedar',
   holes:{
    s:[
     {at:-5.4,w:1.35,h:2.1,door:true,torana:false,leafMk:'cedar',name:'millhand-u1-door'},
     {at:0,w:1.35,h:2.1,door:true,torana:false,leafMk:'cedar',name:'millhand-u2-door'},
     {at:5.4,w:1.35,h:2.1,door:true,torana:false,leafMk:'cedar',name:'millhand-u3-door'}
    ],
    n:[{at:-5.2,w:1.15,h:1.25,y:.95,flat:true},{at:0,w:1.15,h:1.25,y:.95,flat:true},{at:5.2,w:1.15,h:1.25,y:.95,flat:true}]
   }
  });
  klNewarRoof(0,yRoof,-2.7,17.8,9.4,2,{
   style:'ikki',mode:'gable',gableAxis:'x',mk:'slate',over:.64,tierRise:1.12
  });

  klTarget(1.2,y1,5.2,'millhand-well-yard',false);
  klTarget(0,y1,-2.7,'ground-millhand-flats',true);
  klTarget(0,y2,2.6,'upper-millhand-gallery',true);
  klTarget(0,y2,-2.7,'upper-millhand-flats',true);

  klFurnList([
   ['kulanewa_trundle_bunk',-6.2,y1,-5.0,0],
   ['kulanewa_tea_samovar',0,y1,-3.8,0],
   ['kulanewa_pavise_rack',6.2,y1,-5.0,0],
   ['kulanewa_trundle_bunk',-6.0,y2,-4.8,0],
   ['kulanewa_trundle_bunk',.4,y2,-4.8,0],
   ['kulanewa_mujinzo_chest',6.0,y2,-4.8,-PI/2],
   ['kulanewa_oil_cresset',2.4,y1,5.4,0]
  ]);
 }
});
