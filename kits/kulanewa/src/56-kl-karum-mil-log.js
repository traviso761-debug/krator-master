// prefix: kl
// ================================================================= KARUM LEDGER-SYNDICATES — QUAYS, CARAVANSERAI & FORTIFICATIONS (8111..8115)
//   8111. kl_karum_crane_quay     — Kiyomizu Trestle Steelyard Wharf & Slewing Derrick Shed
//   8112. kl_karum_caravanserai   — Moleshelf-Trail Bullion Mule-Serai & Bonded Kura
//   8113. kl_karum_chain_boom     — Nickel-Hooped Frustum River-Boom & Tariff Chain-Gate
//   8114. kl_karum_mercenary_keep — Hired Crossbow Bastion & Kura Munition Vault
//   8115. kl_karum_watch_frustum  — Confluence Hooped-Cedar Signal & Beacon Frustum

/* 11. Kiyomizu Trestle Steelyard Wharf and Slewing Derrick Shed */
defBuilding({
 key:'kl_karum_crane_quay',
 name:'Kiyomizu Trestle Steelyard Wharf and Slewing Derrick Shed',
 seed:8111,w:26,d:21,h:15.4,budget:102000,cut:true,
 front:{x:-3.2,z:9.2,yaw:0},
 tags:{style:'karum',wealth:'middle',types:['infrastructure'],role:'wharf',job:'warehousing'},
 build(){
  const y1=.68,h1=3.65,y2=y1+h1,h2=3.15,yRoof=y2+h2;

  /* East river barge berth + interlocking dark-cedar Kiyomizu cargo trestle stepping out over water! */
  klWaterChannel(9.4,-.2,5.6,18.8,.3,.78,{river:{name:'karum-wharf-berth',axis:'z',speed:.46}});
  klFloorSlab(-3.8,y1,-.2,14.8,16.8,{mk:'paving',th:y1});
  klStair(-3.2,0,9.3,-3.2,y1,7.9,3.0,{mk:'sootstone',sideMk:'kura'});
  klKiyomizuTrestle(5.8,.4,4.8,14.8,0,y1,{rails:'ns'});

  /* Slewing quay cargo derrick crane + hanging bronze steelyard scale on wharf stage */
  klDerrickCrane(6.2,y1,3.8,PI/2,6.2,3.4);
  klSteelyard(6.2,y1+3.4,-3.6,PI/2,1.9,{bell:true});

  /* West 2-Storey Kura & Kilnbrick Wharf Tally Warehouse [-10.6..2.6, -7.8..6.4] */
  klWallRing(-10.6,-7.8,2.6,6.4,y1,h1,{
   style:'karum',register:'kura',udatsu:'ew',udatsuD:1.3,
   holes:{
    s:[
     {at:-4.0,w:1.75,h:2.35,door:true,torana:true,leafMk:'iron',name:'quay-tally-door'},
     {at:-8.2,w:1.15,h:1.3,y:1.05}
    ],
    e:[
     {at:1.8,w:1.75,h:2.35,door:true,torana:false,leafMk:'darkcedar',name:'quay-cargo-door'},
     {at:-3.2,w:1.2,h:1.3,y:1.05}
    ],
    n:[{at:-4.0,w:1.2,h:1.3,y:1.05}]
   }
  });

  const st=klInteriorStair(-7.8,-4.4,y1,y2,0,{w:1.2,riser:.18,going:.27,mk:'darkcedar',smk:'iron',col:P('darkcedar'),scol:P('iron'),rail:'both'});
  klFloorSlab(-4.0,y2,-.7,12.8,13.8,{mk:'floor',th:.18,hole:st});
  klCeilingSlab(-1.8,y2-.28,-.7,8.2,13.2,{mk:'darkcedar',trimMk:'cedar'});

  klWallRing(-10.4,-7.6,2.4,6.2,y2,h2,{
   style:'karum',register:'brick',dadoMk:'cobalt',
   holes:{
    s:[{at:-7.4,w:1.45,h:1.45,y:.95},{at:-4.0,w:1.55,h:1.5,y:.95},{at:-.6,w:1.45,h:1.45,y:.95}],
    e:[{at:-3.4,w:1.45,h:1.45,y:.95},{at:1.8,w:1.45,h:1.45,y:.95}],
    n:[{at:-4.0,w:1.45,h:1.45,y:.95}]
   }
  });
  klNewarRoof(-4.0,yRoof,-.7,13.4,14.4,2,{
   style:'karum',mode:'gable',gableAxis:'z',mk:'terracotta',over:.72,tierRise:1.22
  });

  klTarget(5.4,y1,-.8,'kiyomizu-wharf-apron',false);
  klTarget(-3.2,y1,-.7,'bonded-cargo-shed',true);
  klTarget(-2.4,y2,-.7,'harbour-tally-loft',true);

  klFurnList([
   ['kulanewa_grain_bin',-5.2,y1,-5.2,0],
   ['kulanewa_grain_bin',-2.4,y1,-5.2,0],
   ['kulanewa_amber_safe',.2,y1,-5.2,0],
   ['kulanewa_bullion_scale',-2.2,y1,3.2,PI],
   ['kulanewa_naruqqum_table',-2.4,y2,-1.4,0],
   ['kulanewa_tablet_rack',-4.2,y2,-5.4,0],
   ['kulanewa_oil_cresset',5.2,y1,6.4,0]
  ]);
 }
});

/* 12. Moleshelf-Trail Bullion Mule-Serai and Bonded Kura */
defBuilding({
 key:'kl_karum_caravanserai',
 name:'Moleshelf-Trail Bullion Mule-Serai and Bonded Kura',
 seed:8112,w:28,d:24,h:15.8,budget:116000,cut:true,
 front:{x:0,z:10.8,yaw:0},
 tags:{style:'karum',wealth:'middle',types:['infrastructure','inn','tavern'],role:'caravanserai',job:'trading'},
 build(){
  const y1=.48,h1=3.6,y2=y1+h1,h2=3.25,yRoof=y2+h2;
  klFloorSlab(0,y1,0,24.4,20.4,{mk:'cobble',th:y1});
  klStair(0,0,10.9,0,y1,9.7,3.4,{mk:'sootstone',sideMk:'kura'});

  /* Fortified white-kura serai compound front wall & repousse bronze Torana caravan gate */
  klToranaDoor(0,y1,9.6,0,2.35,2.65,{register:'kura',torana:true,leafMk:'darkcedar',name:'serai-main-gate'});
  for(const s of [-1,1]){
   klWall(s<0?-11.8:1.6,9.6,s<0?-1.6:11.8,9.6,y1,2.85,{style:'karum',register:'kura'});
   klParapet(s<0?-11.8:1.6,9.6,s<0?-1.6:11.8,9.6,y1+2.85,{kind:'kura',h:.55,capMk:'terracotta'});
  }
  klWall(11.8,9.3,11.8,1.8,y1,2.85,{style:'karum',register:'kura'});
  klWall(-11.8,1.8,-11.8,9.3,y1,2.85,{style:'karum',register:'kura'});

  /* Stone mule-watering trough in the east side of the cobbled serai yard */
  klWaterChannel(6.8,5.6,4.4,2.4,y1+.34,.36,{curbMk:'sootstone',bedMk:'ashlar'});

  /* Rear Two-Storey Bonded Kura Vault & Drovers' Inn [-11.6..11.6, -9.6..1.6] */
  klTimberColonnade(-10.8,2.6,10.8,2.6,y1,h1,{style:'karum',n:7,skipMid:1.8,trimMk:'bronze'});
  klCeilingSlab(0,y2-.24,2.0,22.2,1.6,{mk:'darkcedar',trimMk:'cedar'});

  klWallRing(-11.6,-9.6,11.6,1.6,y1,h1,{
   style:'karum',register:'kura',udatsu:'ew',udatsuD:1.35,
   holes:{
    s:[
     {at:-6.6,w:1.55,h:2.3,door:true,torana:false,leafMk:'iron',name:'serai-vault-door'},
     {at:0,w:1.85,h:2.4,door:true,torana:true,leafMk:'darkcedar',name:'serai-taproom-door'},
     {at:6.6,w:1.55,h:2.3,door:true,torana:false,leafMk:'darkcedar',name:'serai-tack-door'}
    ],
    n:[{at:-6.2,w:1.2,h:1.3,y:1.05},{at:0,w:1.2,h:1.3,y:1.05},{at:6.2,w:1.2,h:1.3,y:1.05}]
   }
  });

  const st=klInteriorStair(8.4,-6.4,y1,y2,0,{w:1.25,riser:.18,going:.27,mk:'darkcedar',smk:'bronze',col:P('darkcedar'),scol:P('bronze'),rail:'both'});
  klFloorSlab(0,y2,-4.0,22.6,10.8,{mk:'floor',th:.18,hole:st});
  klCeilingSlab(-2.2,y2-.28,-4.0,17.8,10.2,{mk:'darkcedar',trimMk:'cedar'});

  klWallRing(-11.3,-9.4,11.3,1.4,y2,h2,{
   style:'karum',register:'brick',dadoMk:'cobalt',
   holes:{
    s:[{at:-7.2,w:1.45,h:1.45,y:.95},{at:-2.4,w:1.45,h:1.45,y:.95},{at:2.4,w:1.45,h:1.45,y:.95},{at:7.2,w:1.45,h:1.45,y:.95}],
    n:[{at:-5.8,w:1.4,h:1.4,y:.95},{at:5.8,w:1.4,h:1.4,y:.95}]
   }
  });
  klNewarRoof(0,yRoof,-4.0,23.2,11.4,2,{
   style:'karum',mode:'hip',mk:'terracotta',over:.76,tierRise:1.26
  });

  klTarget(-3.6,y1,5.6,'mule-serai-courtyard',false);
  klTarget(-1.8,y1,-4.0,'drover-taproom-and-kura',true);
  klTarget(-2.2,y2,-4.0,'drover-bunk-gallery',true);

  klFurnList([
   ['kulanewa_amber_safe',-8.4,y1,-6.8,0],
   ['kulanewa_grain_bin',-5.6,y1,-6.8,0],
   ['kulanewa_tea_samovar',0,y1,-4.2,0],
   ['kulanewa_cedar_settle',0,y1,-2.2,PI],
   ['kulanewa_trundle_bunk',-7.8,y2,-6.8,0],
   ['kulanewa_trundle_bunk',-3.6,y2,-6.8,0],
   ['kulanewa_trundle_bunk',1.2,y2,-6.8,0],
   ['kulanewa_syndicate_brazier',-4.2,y1,5.6,0]
  ]);
 }
});

/* 13. Nickel-Hooped Frustum River-Boom and Tariff Chain-Gate */
defBuilding({
 key:'kl_karum_chain_boom',
 name:'Nickel-Hooped Frustum River-Boom and Tariff Chain-Gate',
 seed:8113,w:28,d:22,h:19.2,budget:118000,cut:true,
 front:{x:8.4,z:9.4,yaw:0},
 tags:{style:'karum',wealth:'middle',types:['military','infrastructure'],role:'chain-boom',job:'customs'},
 build(){
  const yQuay=.62,yBridge=4.55,hUpper=3.2,yRoof=yBridge+hUpper;

  /* Central navigable river channel [-4.1..4.1] spanned by iron boom-chain AND elevated sky-walk bridge! */
  klWaterChannel(0,0,8.2,19.6,.3,.82,{river:{name:'karum-boom-channel',axis:'z',speed:.52}});

  /* Heavy forged black-iron & Arch-nickel river boom-chain slung across channel at water level (svNoWalk) */
  svNoWalk(()=>{
   beam('iron',[-5.2,1.15,2.2],[0,.62,2.2],.11,P('iron'),true,8);
   beam('iron',[0,.62,2.2],[5.2,1.15,2.2],.11,P('iron'),true,8);
   for(const cx of [-2.4,0,2.4])cyl('nickel',cx,.52,2.2,.24,.18,P('nickel'),10);
  });

  /* West Bank: Inhabited Arch-Nickel-Hooped Slatted-Cedar Capstan Frustum Tower (-8.4, 0) */
  klFloorSlab(-8.4,yQuay,0,8.4,16.8,{mk:'paving',th:yQuay});
  klStair(-8.4,0,9.5,-8.4,yQuay,8.2,2.8,{mk:'sootstone',sideMk:'kura'});
  klHoopedFrustum(-8.4,0,3.55,2.35,yQuay,15.6,{
   hoops:5,midY:yBridge,
   opens:[
    {a:PI/2,y:0,w:1.5,h:2.25,door:true,name:'boom-frustum-ground-door'},
    {a:0,y:yBridge-yQuay,w:1.55,h:2.25,door:true,open:true},
    {a:PI,y:2.8,w:.95,h:1.2},
    {a:-PI/2,y:8.2,w:.95,h:1.2}
   ]
  });

  /* East Bank: Kura & Kilnbrick Tariff Guardhouse [5.2..11.6, -4.8..3.4] + exterior stair to boom-walk */
  klFloorSlab(8.5,yQuay,0,8.4,16.8,{mk:'paving',th:yQuay});
  klStair(8.4,0,9.5,8.4,yQuay,8.2,2.8,{mk:'sootstone',sideMk:'kura'});
  klWallRing(5.2,-4.8,11.6,3.4,yQuay,yBridge-yQuay-.2,{
   style:'karum',register:'kura',
   holes:{
    s:[{at:7.2,w:1.6,h:2.3,door:true,torana:true,leafMk:'iron',name:'boom-tariff-door'}],
    n:[{at:8.4,w:1.15,h:1.25,y:1.05}]
   }
  });
  klCeilingSlab(8.4,yBridge-.24,-.7,5.8,7.6,{mk:'darkcedar',trimMk:'cedar'});
  klFloorSlab(8.4,yBridge,-.2,6.4,9.2,{mk:'floor',th:.2});
  klStair(10.0,yQuay,8.0,10.0,yBridge,4.2,1.65,{mk:'sootstone',sideMk:'kura',openUnder:true});

  /* Upper kilnbrick crossbow & customs gallery on East bank + Sky-Walk spanning across river into West Frustum! */
  klWallRing(5.4,-4.6,11.4,2.8,yBridge,hUpper,{
   style:'karum',register:'brick',dadoMk:'cobalt',
   holes:{
    w:[{at:0,w:1.65,h:2.25,door:true,open:true}],
    s:[{at:9.8,w:1.45,h:2.2,door:true,torana:false,leafMk:'darkcedar',name:'boom-upper-door'},{at:6.8,w:1.3,h:1.35,y:.95}],
    e:[{at:-.9,w:1.45,h:1.4,y:.95}]
   }
  });
  klNewarRoof(8.4,yRoof,-.9,6.4,8.0,2,{
   style:'karum',mode:'hip',mk:'slate',over:.64,tierRise:1.12
  });
  klSkywalk(5.4,0,-6.4,0,yBridge,2.15);
  klSteelyard(2.2,yBridge-.12,1.2,0,1.65,{bell:true});

  klTarget(8.4,yQuay,-.6,'east-tariff-customs-vault',true);
  klTarget(8.4,yBridge,-.9,'upper-tariff-watchroom',true);
  klTarget(-8.4,yQuay,0,'west-capstan-frustum-ground',true);
  klTarget(-8.4,yBridge,0,'west-frustum-winch-deck',true);

  klFurnList([
   ['kulanewa_naruqqum_table',8.4,yQuay,-1.6,0],
   ['kulanewa_amber_safe',10.0,yQuay,-3.2,-PI/2],
   ['kulanewa_bullion_scale',6.8,yQuay,1.4,0],
   ['kulanewa_pavise_rack',8.4,yBridge,-3.0,0],
   ['kulanewa_amber_safe',-8.4,yQuay,-1.4,0],
   ['kulanewa_syndicate_brazier',-8.4,yBridge,1.2,0],
   ['kulanewa_oil_cresset',6.4,yQuay,6.8,0]
  ]);
 }
});

/* 14. Hired Crossbow Bastion and Kura Munition Vault */
defBuilding({
 key:'kl_karum_mercenary_keep',
 name:'Hired Crossbow Bastion and Kura Munition Vault',
 seed:8114,w:24,d:22,h:19.0,budget:112000,cut:true,
 front:{x:0,z:9.6,yaw:0},
 tags:{style:'karum',wealth:'middle',types:['military'],role:'bastion'},
 build(){
  const y1=.82,h1=3.85,y2=y1+h1,h2=3.45,yRoof=y2+h2;
  klKuraPlinth(19.6,17.2,y1,{stepW:3.2,stepRun:1.7,socMk:'sootstone'});

  /* Battered white-kura mercenary garrison vault [-8.8..8.8, -7.4..6.6] with 4 corner udatsu firewall wings */
  klWallRing(-8.8,-7.4,8.8,6.6,y1,h1,{
   style:'karum',register:'kura',udatsu:'all',udatsuD:1.25,
   holes:{
    s:[
     {at:0,w:1.9,h:2.45,door:true,torana:true,leafMk:'iron',name:'keep-iron-gate'},
     {at:-5.2,w:1.1,h:1.25,y:1.2},
     {at:5.2,w:1.1,h:1.25,y:1.2}
    ],
    n:[{at:-4.6,w:1.1,h:1.25,y:1.2},{at:4.6,w:1.1,h:1.25,y:1.2}],
    e:[{at:-.4,w:1.1,h:1.25,y:1.2}],
    w:[{at:-.4,w:1.1,h:1.25,y:1.2}]
   }
  });

  const st=klInteriorStair(5.8,-4.2,y1,y2,0,{w:1.25,riser:.18,going:.27,mk:'darkcedar',smk:'iron',col:P('darkcedar'),scol:P('iron'),rail:'both'});
  klFloorSlab(0,y2,-.4,17.2,13.6,{mk:'floor',th:.18,hole:st});
  klCeilingSlab(-2.0,y2-.28,-.4,12.8,13.0,{mk:'darkcedar',trimMk:'cedar'});

  /* Second-storey kilnbrick & cobalt-dado Crossbow Gallery + NW Hooped Watch-Turret */
  klWallRing(-8.5,-7.2,8.5,6.4,y2,h2,{
   style:'karum',register:'brick',dadoMk:'cobalt',
   holes:{
    s:[{at:-4.8,w:1.4,h:1.4,y:.95},{at:0,w:1.55,h:1.45,y:.95},{at:4.8,w:1.4,h:1.4,y:.95}],
    n:[{at:-4.2,w:1.35,h:1.35,y:.95},{at:4.2,w:1.35,h:1.35,y:.95}],
    e:[{at:-.4,w:1.35,h:1.35,y:.95}],
    w:[{at:-.4,w:1.35,h:1.35,y:.95}]
   }
  });
  klNewarRoof(0,yRoof,-.4,17.6,14.0,2,{
   style:'karum',mode:'hip',mk:'slate',over:.74,tierRise:1.22,cupola:true,cupolaR:2.0,cupolaH:3.7
  });

  klTarget(-1.8,y1,-.4,'munition-kura-vault',true);
  klTarget(-1.8,y2,-.4,'crossbow-garrison-hall',true);

  klFurnList([
   ['kulanewa_pavise_rack',-5.6,y1,-5.0,0],
   ['kulanewa_pavise_rack',-2.2,y1,-5.0,0],
   ['kulanewa_amber_safe',2.2,y1,-5.0,0],
   ['kulanewa_naruqqum_table',-1.8,y1,1.6,0],
   ['kulanewa_trundle_bunk',-5.8,y2,-4.6,0],
   ['kulanewa_trundle_bunk',-5.8,y2,1.6,0],
   ['kulanewa_pavise_rack',1.6,y2,-4.8,0],
   ['kulanewa_syndicate_brazier',0,y2,2.4,0]
  ]);
 }
});

/* 15. Confluence Hooped-Cedar Signal and Beacon Frustum */
defBuilding({
 key:'kl_karum_watch_frustum',
 name:'Confluence Hooped-Cedar Signal and Beacon Frustum',
 seed:8115,w:18,d:18,h:20.2,budget:86000,cut:true,
 front:{x:0,z:7.9,yaw:0},
 tags:{style:'karum',wealth:'middle',types:['military','infrastructure'],role:'beacon'},
 build(){
  const y1=.92,yMid=y1+4.1;
  klKuraPlinth(13.8,13.8,y1,{stepW:2.8,stepRun:1.8,socMk:'sootstone'});
  klParapet(-6.6,6.6,-2.0,6.6,y1,{kind:'kura',h:.68,capMk:'slate'});
  klParapet(2.0,6.6,6.6,6.6,y1,{kind:'kura',h:.68,capMk:'slate'});
  klParapet(6.6,-6.6,-6.6,-6.6,y1,{kind:'kura',h:.68,capMk:'slate'});
  klParapet(-6.6,-6.3,-6.6,6.3,y1,{kind:'kura',h:.68,capMk:'slate'});
  klParapet(6.6,6.3,6.6,-6.3,y1,{kind:'kura',h:.68,capMk:'slate'});

  /* Monumental Inhabited Arch-Nickel & Black-Iron-Hooped Slatted-Cedar Signal Frustum + exterior stair to mid-deck! */
  klHoopedFrustum(0,0,4.15,2.55,y1,14.8,{
   hoops:6,midY:yMid,
   opens:[
    {a:PI/2,y:0,w:1.55,h:2.3,door:true,name:'beacon-frustum-door'},
    {a:0,y:yMid-y1,w:1.5,h:2.25,door:true,open:true},
    {a:PI,y:5.2,w:.95,h:1.2},
    {a:-PI/2,y:9.4,w:.95,h:1.2}
   ]
  });
  /* Exterior timber-and-stone signal stair on east side of podium climbing y1 -> yMid + landing bridge */
  klStair(5.1,y1,4.6,5.1,yMid,.4,1.55,{mk:'sootstone',cheek:'timber',openUnder:true});
  klSkywalk(5.1,0,2.1,0,yMid,1.65);

  /* Crown beacon cresset fire & smoke above nickel rim */
  svNoWalk(()=>{
   cyl('bronze',0,y1+14.88,0,.95,.28,P('bronze'),12);
   cyl('glow',0,y1+15.16,0,.72,.08,P('flame'),10);
  });
  smokeAt(0,y1+15.5,0,{r:.35,kind:'fire'});
  haloAt(0,y1+15.3,0,0xffbc58,true);

  klTarget(0,y1,0,'signal-frustum-guardroom',true);
  klTarget(0,yMid,0,'signal-frustum-watchdeck',true);

  klFurnList([
   ['kulanewa_naruqqum_table',-1.2,y1,-1.4,0],
   ['kulanewa_amber_safe',1.4,y1,-1.4,0],
   ['kulanewa_pavise_rack',0,y1,-2.5,0],
   ['kulanewa_syndicate_brazier',0,yMid,-1.1,0],
   ['kulanewa_oil_cresset',-4.8,y1,4.8,0],
   ['kulanewa_oil_cresset',4.8,y1,-4.8,0]
  ]);
 }
});
