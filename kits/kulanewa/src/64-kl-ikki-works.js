// prefix: kl
// ================================================================= KULA-NA IKKI COVENANT-COMMUNES — HYDRO-FORGES, FOUNDRIES & WORKS (8127..8130, 8136)
//   8127. kl_ikki_hydro_forge    — Undershot Dual-Wheel Trip-Hammer Iron & Arch-Nickel Finery Forge
//   8128. kl_ikki_bell_foundry   — Great Bronze Covenant-Bell & Crossbow-Prod Casting Hall
//   8129. kl_ikki_coke_kiln      — Coal-Measure Beehive Coking & Refractory Fireclay Crucible Works
//   8130. kl_ikki_timber_sawmill — Kiyomizu Flume-Wheel Cedar Stave & Hoop Sawmill
//   8136. kl_ikki_quarry_mason   — Soot-Stone Ashlar & Lime-Mortar Parish Yard

/* 27. Undershot Dual-Wheel Trip-Hammer Iron and Arch-Nickel Finery Forge */
defBuilding({
 key:'kl_ikki_hydro_forge',
 name:'Undershot Dual-Wheel Trip-Hammer Iron and Arch-Nickel Forge',
 seed:8127,w:28,d:21,h:17.8,budget:114000,cut:true,
 front:{x:-3.2,z:9.2,yaw:0},
 tags:{style:'ikki',wealth:'middle',types:['industry'],role:'hydro-forge',job:'smithing'},
 build(){
  const y1=.58,h1=3.85,y2=y1+h1,h2=3.15,yRoof=y2+h2;

  /* East fast mill-race flume turning TWO undershot Arch-nickel & dark-cedar trip-hammer waterwheels! */
  klWaterChannel(9.6,-.2,5.2,18.8,.32,.82,{river:{name:'ikki-forge-flume',axis:'z',speed:.78}});
  klMillWheel(6.55,1.55,3.4,PI/2,2.05,.82);
  klMillWheel(6.55,1.55,-3.6,PI/2,2.05,.82);

  klFloorSlab(-3.4,y1,-.2,17.8,16.8,{mk:'cobble',th:y1});
  klStair(-3.2,0,9.3,-3.2,y1,8.0,3.2,{mk:'sootstone',sideMk:'kura'});

  /* NW Finery Blast-Furnace Hooped Frustum Stack (-9.4, -4.4) + glowing hearth */
  klHoopedFrustum(-9.4,-4.4,2.35,1.45,y1,13.2,{hollow:false,hoops:5});
  smokeAt(-9.4,y1+13.5,-4.4,{r:.36,kind:'fire'});
  haloAt(-6.2,y1+1.2,-4.4,0xffa848,true);

  /* Main fireproof kura & sootstone trip-hammer forge hall [-6.8..5.2, -7.6..6.2] */
  klWallRing(-6.8,-7.6,5.2,6.2,y1,h1,{
   style:'ikki',register:'kura',udatsu:'ew',udatsuD:1.3,
   holes:{
    s:[
     {at:-.8,w:1.9,h:2.45,door:true,torana:true,leafMk:'iron',name:'forge-main-door'},
     {at:-4.4,w:1.15,h:1.25,y:1.15},
     {at:2.8,w:1.15,h:1.25,y:1.15}
    ],
    w:[{at:1.8,w:1.45,h:2.2,door:true,torana:false,leafMk:'iron',name:'forge-bunker-door'}],
    e:[{at:3.4,w:1.2,h:1.2,y:1.2},{at:-3.6,w:1.2,h:1.2,y:1.2}],
    n:[{at:-.8,w:1.2,h:1.25,y:1.15}]
   }
  });

  const st=klInteriorStair(1.4,-3.8,y1,y2,0,{w:1.2,riser:.18,going:.27,mk:'darkcedar',smk:'iron',col:P('darkcedar'),scol:P('iron'),rail:'both'});
  klFloorSlab(-.8,y2,-.7,11.6,13.4,{mk:'floor',th:.18,hole:st});
  klCeilingSlab(-3.4,y2-.28,-.7,6.2,12.8,{mk:'darkcedar',trimMk:'cedar'});

  klWallRing(-6.6,-7.4,5.0,6.0,y2,h2,{
   style:'ikki',register:'brick',dadoMk:'celadon',
   holes:{
    s:[{at:-4.2,w:1.45,h:1.4,y:.95},{at:-.8,w:1.55,h:1.45,y:.95},{at:2.6,w:1.45,h:1.4,y:.95}],
    n:[{at:-.8,w:1.45,h:1.4,y:.95}]
   }
  });
  klNewarRoof(-.8,yRoof,-.7,12.2,14.0,2,{
   style:'ikki',mode:'gable',gableAxis:'z',mk:'slate',over:.72,tierRise:1.22
  });

  klTarget(-9.4,y1,2.6,'coal-and-pig-iron-yard',false);
  klTarget(-1.6,y1,-.7,'trip-hammer-finery-hall',true);
  klTarget(-2.2,y2,-.7,'bellows-and-pattern-loft',true);

  klFurnList([
   ['kulanewa_trip_anvil',-1.2,y1,2.4,0],
   ['kulanewa_trip_anvil',-1.2,y1,-2.6,0],
   ['kulanewa_pavise_rack',-4.6,y1,-4.8,PI/2],
   ['kulanewa_bullion_scale',-4.4,y1,2.8,PI/2],
   ['kulanewa_naruqqum_table',-2.4,y2,-1.6,0],
   ['kulanewa_mujinzo_chest',-4.4,y2,-5.0,0],
   ['kulanewa_syndicate_brazier',-9.2,y1,3.8,0]
  ]);
 }
});

/* 28. Great Bronze Covenant-Bell and Crossbow-Prod Casting Hall */
defBuilding({
 key:'kl_ikki_bell_foundry',
 name:'Great Bronze Covenant-Bell and Crossbow-Prod Casting Hall',
 seed:8128,w:24,d:20,h:18.4,budget:106000,cut:true,
 front:{x:1.8,z:8.8,yaw:0},
 tags:{style:'ikki',wealth:'middle',types:['industry'],role:'bell-foundry',job:'smithing'},
 build(){
  const y1=.56,h1=3.9,y2=y1+h1,h2=3.3,yRoof=y2+h2;
  klFloorSlab(0,y1,-.2,20.4,16.2,{mk:'cobble',th:y1});
  klStair(1.8,0,8.9,1.8,y1,7.7,3.0,{mk:'sootstone',sideMk:'kura'});

  /* West Forecourt Timber Testing-Gantry hanging a newly cast Great Bronze Covenant Bell + Reverberatory Stack! */
  klHoopedFrustum(-7.4,-4.4,2.2,1.35,y1,13.4,{hollow:false,hoops:5});
  smokeAt(-7.4,y1+13.7,-4.4,{r:.34,kind:'fire'});
  haloAt(-7.4,y1+1.1,-2.0,0xffad4a,true);
  svNoWalk(()=>{
   for(const sx of [-8.6,-5.8]){
    box('sootstone',sx,y1+.01,3.6,.48,.24,.64,P('sootstone'));
    box('darkcedar',sx,y1+.25,3.6,.26,3.45,.26,P('darkcedar'));
   }
   box('darkcedar',-7.2,y1+3.7,3.6,3.5,.28,.34,P('darkcedar'));
   box('nickel',-7.2,y1+3.45,3.6,.42,.25,.38,P('nickel'));
   cyl('bronze',-7.2,y1+2.25,3.6,.56,1.2,P('bronze'),14,.44);
   cyl('bronze',-7.2,y1+1.98,3.6,.68,.27,P('bronze'),14,.56);
  });
  klWallBlock(-7.2,y1,3.6,3.4,3.8,1.0,0);

  /* Main kura & kilnbrick casting hall [-4.2..9.4, -7.2..6.0] */
  klWallRing(-4.2,-7.2,9.4,6.0,y1,h1,{
   style:'ikki',register:'kura',udatsu:'ew',udatsuD:1.3,
   holes:{
    s:[
     {at:2.6,w:2.0,h:2.5,door:true,torana:true,leafMk:'iron',name:'foundry-bell-door'},
     {at:-1.4,w:1.15,h:1.3,y:1.15},
     {at:6.8,w:1.15,h:1.3,y:1.15}
    ],
    w:[{at:1.4,w:1.45,h:2.25,door:true,torana:false,leafMk:'iron',name:'foundry-yard-door'}],
    n:[{at:2.6,w:1.2,h:1.3,y:1.15}]
   }
  });

  const st=klInteriorStair(6.6,-3.8,y1,y2,0,{w:1.2,riser:.18,going:.27,mk:'darkcedar',smk:'iron',col:P('darkcedar'),scol:P('iron'),rail:'both'});
  klFloorSlab(2.6,y2,-.6,13.2,12.8,{mk:'floor',th:.18,hole:st});
  klCeilingSlab(.6,y2-.28,-.6,9.0,12.2,{mk:'darkcedar',trimMk:'cedar'});

  klWallRing(-4.0,-7.0,9.2,5.8,y2,h2,{
   style:'ikki',register:'brick',dadoMk:'celadon',
   holes:{
    s:[{at:-1.0,w:1.45,h:1.4,y:.95},{at:2.6,w:1.6,h:1.45,y:.95},{at:6.4,w:1.45,h:1.4,y:.95}],
    n:[{at:2.6,w:1.45,h:1.4,y:.95}]
   }
  });
  klNewarRoof(2.6,yRoof,-.6,13.8,13.4,2,{
   style:'ikki',mode:'hip',mk:'slate',over:.74,tierRise:1.24,cupola:true,cupolaR:1.95,cupolaH:3.6
  });

  klTarget(-7.2,y1,6.2,'bell-testing-forecourt',false);
  klTarget(1.8,y1,-.6,'bronze-mould-casting-floor',true);
  klTarget(1.2,y2,-.6,'crossbow-prod-tuning-loft',true);

  klFurnList([
   ['kulanewa_trip_anvil',.2,y1,1.8,0],
   ['kulanewa_covenant_bell_stand',4.4,y1,2.0,PI],
   ['kulanewa_bullion_scale',-.8,y1,-4.2,0],
   ['kulanewa_pavise_rack',2.8,y1,-4.8,0],
   ['kulanewa_naruqqum_table',1.2,y2,-1.4,0],
   ['kulanewa_pavise_rack',-1.6,y2,-4.8,0]
  ]);
 }
});

/* 29. Coal-Measure Beehive Coking and Refractory Fireclay Crucible Works */
defBuilding({
 key:'kl_ikki_coke_kiln',
 name:'Coal-Measure Beehive Coking and Fireclay Crucible Works',
 seed:8129,w:22,d:19,h:15.2,budget:92000,cut:true,
 front:{x:2.4,z:8.2,yaw:0},
 tags:{style:'ikki',wealth:'poor',types:['industry'],role:'coke-kiln',job:'mining'},
 build(){
  const y1=.48,h1=3.55,y2=y1+h1,h2=3.0,yRoof=y2+h2;
  klFloorSlab(0,y1,-.2,18.8,15.6,{mk:'cobble',th:y1});
  klStair(2.4,0,8.3,2.4,y1,7.2,2.8,{mk:'sootstone',sideMk:'kura'});

  /* West Twin Soot-Stone & Kilnbrick Beehive Coking Ovens + Anthracite Coal Bunker! */
  svNoWalk(()=>{
   for(const kz of [-3.4,1.4]){
    cyl('sootstone',-6.2,y1+.01,kz,1.85,.42,P('sootstone'),16);
    lathe('kilnbrick',-6.2,kz,[[1.78,y1+.43],[1.42,y1+1.75],[.52,y1+2.75]],16,P('kilnbrick'),{uv:'cone'});
    cyl('iron',-6.2,y1+2.75,kz,.42,.48,P('iron'),10);
   }
   /* Coal-measure bunker crib at SW corner */
   box('darkcedar',-6.2,y1+.01,5.2,3.4,.58,2.4,P('darkcedar'));
   ellip('coal',-6.2,y1+.68,5.2,1.45,.42,.95,P('coal'),0,10);
  });
  klWallBlock(-6.2,y1,-1.0,3.6,2.8,8.6,0);
  klWallBlock(-6.2,y1,5.2,3.4,.85,2.4,0);
  smokeAt(-6.2,y1+3.3,-3.4,{r:.3,kind:'fire'});
  smokeAt(-6.2,y1+3.3,1.4,{r:.28,kind:'fire'});
  haloAt(-6.2,y1+.7,1.4,0xffa240,true);

  /* East Fireclay Crucible-Moulding Shed [-2.2..8.8, -6.8..5.8] */
  klWallRing(-2.2,-6.8,8.8,5.8,y1,h1,{
   style:'ikki',register:'kura',
   holes:{
    s:[{at:3.3,w:1.65,h:2.3,door:true,torana:false,leafMk:'iron',name:'coke-crucible-door'}],
    w:[{at:1.8,w:1.4,h:2.2,door:true,torana:false,leafMk:'darkcedar',name:'coke-oven-door'}],
    n:[{at:3.3,w:1.15,h:1.25,y:1.05}]
   }
  });

  const st=klInteriorStair(6.2,-3.6,y1,y2,0,{w:1.15,riser:.18,going:.27,mk:'darkcedar',smk:'iron',col:P('darkcedar'),scol:P('iron'),rail:'both'});
  klFloorSlab(3.3,y2,-.5,10.6,12.2,{mk:'floor',th:.18,hole:st});
  klCeilingSlab(1.4,y2-.28,-.5,6.6,11.6,{mk:'darkcedar',trimMk:'cedar'});

  klWallRing(-2.0,-6.6,8.6,5.6,y2,h2,{
   style:'ikki',register:'timber',mk:'kilnbrick',
   holes:{
    s:[{at:1.0,w:1.35,h:1.3,y:.9,flat:true},{at:5.6,w:1.35,h:1.3,y:.9,flat:true}],
    n:[{at:3.3,w:1.35,h:1.3,y:.9,flat:true}]
   }
  });
  klNewarRoof(3.3,yRoof,-.5,11.2,12.8,2,{
   style:'ikki',mode:'gable',gableAxis:'z',mk:'slate',over:.66,tierRise:1.14
  });

  klTarget(-2.4,y1,6.4,'coking-coal-apron',false);
  klTarget(2.2,y1,-.5,'fireclay-crucible-room',true);
  klTarget(1.8,y2,-.5,'crucible-drying-loft',true);

  klFurnList([
   ['kulanewa_trip_anvil',1.6,y1,2.0,0],
   ['kulanewa_grain_bin',.2,y1,-4.4,0],
   ['kulanewa_grain_bin',2.8,y1,-4.4,0],
   ['kulanewa_naruqqum_table',1.8,y2,-1.6,0],
   ['kulanewa_trundle_bunk',.2,y2,2.4,PI/2],
   ['kulanewa_oil_cresset',-2.6,y1,6.2,0]
  ]);
 }
});

/* 30. Kiyomizu Flume-Wheel Cedar Stave and Hoop Sawmill */
defBuilding({
 key:'kl_ikki_timber_sawmill',
 name:'Kiyomizu Flume-Wheel Cedar Stave and Hoop Sawmill',
 seed:8130,w:26,d:20,h:14.6,budget:96000,cut:true,
 front:{x:2.2,z:8.6,yaw:0},
 tags:{style:'ikki',wealth:'middle',types:['industry','infrastructure'],role:'sawmill',job:'carpentry'},
 build(){
  const yDeck=1.18,gh=3.65,yRoof=yDeck+gh;

  /* West hydro-flume raceway + undershot waterwheel driving the reciprocating stave-saw! */
  klWaterChannel(-9.2,-.2,5.0,17.8,.3,.76,{river:{name:'ikki-sawmill-flume',axis:'z',speed:.72}});
  klMillWheel(-6.2,1.52,1.2,-PI/2,1.95,.78);

  /* Interlocking dark-cedar Kiyomizu timber log-deck [-6.2..10.4, -7.2..6.6] + front wide ramp/stair */
  klKiyomizuTrestle(2.1,-.3,16.6,13.8,0,yDeck,{rails:'nw',nx:6,nz:5});
  klStair(2.2,0,8.6,2.2,yDeck,6.4,3.2,{mk:'darkcedar',cheek:'timber',openUnder:true});

  /* Stacked cedar logs on East open log-yard (svNoWalk + klWallBlock) */
  svNoWalk(()=>{
   for(let row=0;row<2;row++)for(let k=0;k<3;k++){
    const lx=7.6+k*.52-row*.26,ly=yDeck+.24+row*.44;
    WX(lx,ly,1.6,0,PI/2,0,()=>cyl('cedar',0,-2.2,0,.22,4.4,P('cedar'),10));
   }
  });
  klWallBlock(8.1,yDeck,1.6,1.8,1.1,4.5,0);

  /* Covered Cedar Stave & Frustum-Hoop Cooperage Hall [-5.8..5.6, -6.8..4.2] */
  klTimberColonnade(-5.4,5.8,5.2,5.8,yDeck,gh,{style:'ikki',n:5,skipMid:1.8,trimMk:'nickel'});
  klCeilingSlab(-.1,yRoof-.12,4.9,11.2,1.8,{mk:'darkcedar',trimMk:'cedar'});

  klWallRing(-5.8,-6.8,5.6,4.0,yDeck,gh,{
   style:'ikki',register:'timber',mk:'cedar',
   holes:{
    s:[{at:0,w:1.85,h:2.35,door:true,torana:false,leafMk:'darkcedar',name:'sawmill-front-door'},{at:-3.4,w:1.2,h:1.3,y:1.0,flat:true}],
    e:[{at:-1.4,w:1.6,h:2.25,door:true,torana:false,leafMk:'darkcedar',name:'sawmill-logyard-door'}],
    n:[{at:-2.6,w:1.2,h:1.3,y:1.0,flat:true},{at:2.6,w:1.2,h:1.3,y:1.0,flat:true}]
   }
  });
  klNewarRoof(-.1,yRoof,-1.2,12.0,13.6,2,{
   style:'ikki',mode:'gable',gableAxis:'z',mk:'shingle',over:.7,tierRise:1.24
  });

  klTarget(7.8,yDeck,-3.2,'kiyomizu-log-deck',false);
  klTarget(0,yDeck,4.9,'sawmill-covered-porch',true);
  klTarget(0,yDeck,-1.4,'stave-and-hoop-saw-hall',true);

  klFurnList([
   ['kulanewa_trip_anvil',-3.2,yDeck,1.2,0],
   ['kulanewa_naruqqum_table',1.8,yDeck,1.2,0],
   ['kulanewa_grain_bin',-3.4,yDeck,-4.4,0],
   ['kulanewa_pavise_rack',1.8,yDeck,-4.6,0],
   ['kulanewa_mujinzo_chest',-3.4,yDeck,-1.6,PI/2],
   ['kulanewa_oil_cresset',5.8,yDeck,5.2,0]
  ]);
 }
});

/* 36. Soot-Stone Ashlar and Lime-Mortar Parish Yard */
defBuilding({
 key:'kl_ikki_quarry_mason',
 name:'Soot-Stone Ashlar and Lime-Mortar Parish Yard',
 seed:8136,w:22,d:18,h:13.8,budget:86000,cut:true,
 front:{x:-2.2,z:7.8,yaw:0},
 tags:{style:'ikki',wealth:'poor',types:['industry','shop'],role:'workshop',job:'masonry'},
 build(){
  const y1=.44,gh=3.6,yRoof=y1+gh;
  klFloorSlab(0,y1,-.2,18.8,14.8,{mk:'cobble',th:y1});
  klStair(-2.2,0,7.9,-2.2,y1,6.8,2.8,{mk:'sootstone',sideMk:'kura'});

  /* East Soot-Stone Block-Dressing Yard + Slewing Stone Derrick Crane + Kura Lime-Slaking Vat */
  klDerrickCrane(6.2,y1,2.2,-PI/2,5.8,3.1);
  svNoWalk(()=>{
   box('sootstone',6.4,y1+.01,-3.8,3.2,.42,2.6,P('sootstone'));
   box('kura',6.4,y1+.43,-3.8,2.8,.12,2.2,P('kura'));
   box('sootstone',3.2,y1+.01,3.8,1.3,.78,1.1,P('sootstone'));
   box('ashlar',3.2,y1+.79,3.8,1.05,.56,.9,P('ashlar'));
  });
  klWallBlock(6.4,y1,-3.8,3.2,.85,2.6,0);
  klWallBlock(3.2,y1,3.8,1.3,1.35,1.1,0);

  /* West Kura & Timber Parish Stonecutter Lodge [-8.8..1.6, -6.6..5.4] */
  klTimberColonnade(-8.2,5.6,1.0,5.6,y1,gh,{style:'ikki',n:4,trimMk:'iron'});
  klCeilingSlab(-3.6,yRoof-.12,4.8,9.8,1.8,{mk:'darkcedar',trimMk:'cedar'});

  klWallRing(-8.8,-6.6,1.6,4.0,y1,gh,{
   style:'ikki',register:'kura',udatsu:'ew',udatsuD:1.2,
   holes:{
    s:[{at:-3.6,w:1.65,h:2.3,door:true,torana:false,leafMk:'darkcedar',name:'mason-lodge-door'},{at:-7.0,w:1.15,h:1.25,y:1.05}],
    e:[{at:-1.3,w:1.5,h:2.2,door:true,torana:false,leafMk:'darkcedar',name:'mason-yard-door'}],
    n:[{at:-3.6,w:1.2,h:1.25,y:1.05}]
   }
  });
  klNewarRoof(-3.6,yRoof,-.5,11.0,12.8,2,{
   style:'ikki',mode:'gable',gableAxis:'z',mk:'slate',over:.66,tierRise:1.16
  });

  klTarget(4.8,y1,-.6,'ashlar-dressing-yard',false);
  klTarget(-3.6,y1,4.8,'mason-chiselling-porch',true);
  klTarget(-3.6,y1,-1.3,'mason-template-lodge',true);

  klFurnList([
   ['kulanewa_trip_anvil',-5.8,y1,1.2,0],
   ['kulanewa_naruqqum_table',-2.2,y1,1.2,0],
   ['kulanewa_grain_bin',-6.4,y1,-4.2,0],
   ['kulanewa_mujinzo_chest',-2.4,y1,-4.4,0],
   ['kulanewa_cedar_settle',-.2,y1,-1.6,-PI/2],
   ['kulanewa_oil_cresset',2.2,y1,5.6,0]
  ]);
 }
});
