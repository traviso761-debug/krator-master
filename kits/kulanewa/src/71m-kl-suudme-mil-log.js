// prefix: kl
// ================================================================= SUUDME-KAARUM ESTUARY TOWNS — QUAYS, WATER-GATES & BASTIONS (8153..8157)
//   8153. kl_suudme_tidal_wharf      — Kiyomizu-Travertine Macrotidal Bluff Wharf and Cliff-Hoist
//   8154. kl_suudme_ishtar_watergate — Glazed-Arch and Hooped-Pylon Canal Lock Water-Gate
//   8155. kl_suudme_caravanserai     — Travertine-Peristyle and Kura-Vault Bluff Caravanserai
//   8156. kl_suudme_strategion_keep  — Maleva-Strategion Glazed-and-Hooped Bluff Keep
//   8157. kl_suudme_beacon_frustum   — Estuary Pyatthat-Kellakoda Signal and Harbour Bastion

/* 53. Kiyomizu-Travertine Macrotidal Bluff Wharf and Cliff-Hoist */
defBuilding({
 key:'kl_suudme_tidal_wharf',
 name:'Kiyomizu-Travertine Macrotidal Bluff Wharf and Cliff-Hoist',
 seed:8153,w:28,d:22,h:17.6,budget:116000,cut:true,
 front:{x:-3.4,z:10.1,yaw:0},
 tags:{style:'suudme',wealth:'middle',types:['infrastructure'],role:'wharf',job:'warehousing'},
 build(){
  const yLow=.48,yHigh=1.18,h1=3.65,y2=yHigh+h1,h2=3.2,yRoof=y2+h2;

  /* East Sound macrotidal berth channel */
  klWaterChannel(9.8,0,5.2,19.2,.28,.82,{river:{name:'suudme-tidal-berth',axis:'z',speed:.48}});

  /* Combinator 2: Classical Travertine Round-Arch Quay + Low-Tide Dark-Cedar Kiyomizu Landing Stage! */
  klArcadeKiyomizu(-3.8,-.2,14.8,16.8,0,yHigh,{
   dir:'e',bays:4,trestleW:4.2,trestleD:13.8,yTrestle:yLow,rails:'ns'
  });
  klSuudmeStair(-3.4,0,10.0,-3.4,yHigh,8.0,3.2,{nagaScale:.72});

  /* Slewing paktong-hooped derrick crane & steelyard on the low-tide Kiyomizu trestle */
  klDerrickCrane(5.8,yLow,3.8,PI/2,6.4,3.2);
  klSteelyard(5.8,yLow+3.4,-3.6,PI/2,1.85,{bell:true});

  /* West 2-Storey Ishtar-Kura & Ruan-Teak Bonded Bluff Warehouse [-10.8..2.4, -7.8..6.2] */
  klIshtarKuraVault(-10.8,-7.8,2.4,6.2,yHigh,h1,{
   portalX:-4.2,portalW:1.85,portalH:2.4,buttW:1.05,udatsu:'ew',leafMk:'iron',
   portalName:'tidal-wharf-ishtar-door',
   holes:{
    s:[{at:-8.6,w:1.15,h:1.25,y:1.05}],
    e:[{at:2.2,w:1.7,h:2.3,door:true,torana:false,leafMk:'darkcedar',name:'tidal-wharf-cargo-door'},{at:-3.2,w:1.2,h:1.3,y:1.05}],
    n:[{at:-4.2,w:1.2,h:1.3,y:1.05}]
   }
  });

  const st=klInteriorStair(-8.0,-4.4,yHigh,y2,0,{w:1.2,riser:.18,going:.27,mk:'darkcedar',smk:'paktong',col:P('teak'),scol:P('paktong')});
  klFloorSlab(-4.2,y2,-.8,12.8,13.6,{mk:'floor',th:.18,hole:st});
  klCeilingSlab(-2.0,y2-.28,-.8,8.2,13.0,{mk:'darkcedar',col:P('teak'),trimMk:'brass',trimCol:P('gilt')});

  klTeakSanjhyaGallery(-10.6,-7.6,2.2,6.0,y2,h2,{
   friezePal:'saffron',
   holes:{
    s:[{at:-7.6,w:1.45,h:1.45,y:.95,roofMk:'terracotta'},{at:-4.2,w:1.6,h:1.5,y:.95,roofMk:'terracotta'},{at:-.8,w:1.45,h:1.45,y:.95,roofMk:'terracotta'}],
    e:[{at:-3.4,w:1.45,h:1.45,y:.95,roofMk:'terracotta'},{at:1.8,w:1.45,h:1.45,y:.95,roofMk:'terracotta'}],
    n:[{at:-4.2,w:1.45,h:1.45,y:.95,roofMk:'terracotta'}]
   }
  });
  klBellMondop(-4.2,yRoof,-.8,13.4,14.2,2,{
   mk:'terracotta',mode:'gable',gableAxis:'z',bell:false,over:.7,tierRise:1.22
  });

  klTarget(5.6,yLow,-.6,'kiyomizu-low-tide-stage',false);
  klTarget(-3.2,yHigh,-.8,'bonded-bluff-warehouse',true);
  klTarget(-2.4,y2,-.8,'harbour-hoist-tally-loft',true);

  klFurnList([
   ['kulanewa_grain_bin',-5.4,yHigh,-5.2,0],
   ['kulanewa_grain_bin',-2.6,yHigh,-5.2,0],
   ['kulanewa_amber_safe',.2,yHigh,-5.2,0],
   ['kulanewa_bullion_scale',-2.2,yHigh,3.0,PI],
   ['kulanewa_naruqqum_table',-2.4,y2,-1.4,0],
   ['kulanewa_tablet_rack',-4.4,y2,-5.4,0],
   ['kulanewa_oil_cresset',5.4,yLow,5.8,0]
  ]);
 }
});

/* 54. Glazed-Arch and Hooped-Pylon Canal Lock Water-Gate */
defBuilding({
 key:'kl_suudme_ishtar_watergate',
 name:'Glazed-Arch and Hooped-Pylon Canal Lock Water-Gate',
 seed:8154,w:28,d:22,h:20.6,budget:122000,cut:true,
 front:{x:8.4,z:9.7,yaw:0},
 tags:{style:'suudme',wealth:'rich',types:['infrastructure','military'],role:'water-gate',job:'customs'},
 build(){
  const yQuay=.62,yBridge=4.65,hUpper=3.25,yRoof=yBridge+hUpper;

  /* Central navigable Sound lock-canal + forged paktong-and-iron harbour boom-chain */
  klWaterChannel(0,0,8.2,19.6,.3,.84,{river:{name:'suudme-lock-gate',axis:'z',speed:.5}});
  svNoWalk(()=>{
   beam('iron',[-5.2,1.15,2.2],[0,.62,2.2],.11,P('iron'),true,8);
   beam('iron',[0,.62,2.2],[5.2,1.15,2.2],.11,P('iron'),true,8);
   for(const cx of [-2.4,0,2.4])cyl('paktong',cx,.52,2.2,.24,.18,P('paktong'),10);
  });

  /* West Bank: Monumental Inhabited Travertine-and-Cobalt Glazed Paktong-Hooped Capstan Pylon! */
  klFloorSlab(-8.4,yQuay,0,8.4,16.8,{mk:'paving',col:P('travertine'),th:yQuay});
  klSuudmeStair(-8.4,0,9.6,-8.4,yQuay,8.3,2.8,{nagaScale:.68});
  klHoopedGlazePylon(-8.4,0,3.55,2.35,yQuay,15.2,{
   hoops:5,midY:yBridge,
   opens:[
    {a:PI/2,y:0,w:1.5,h:2.25,door:true,name:'watergate-pylon-door'},
    {a:0,y:yBridge-yQuay,w:1.55,h:2.25,door:true,open:true},
    {a:PI,y:2.8,w:.95,h:1.2},
    {a:-PI/2,y:8.2,w:.95,h:1.2}
   ]
  });

  /* East Bank: Babylonian Ishtar-Kura Lock Guardhouse + exterior travertine stair to bridge gallery */
  klFloorSlab(8.5,yQuay,0,8.4,16.8,{mk:'paving',col:P('travertine'),th:yQuay});
  klSuudmeStair(8.4,0,9.6,8.4,yQuay,8.3,2.8,{nagaScale:.68});
  klIshtarKuraVault(5.2,-4.8,11.6,3.4,yQuay,yBridge-yQuay-.22,{
   portalX:8.4,portalW:1.75,portalH:2.35,buttW:.92,leafMk:'iron',
   portalName:'watergate-ishtar-door',
   holes:{n:[{at:8.4,w:1.15,h:1.25,y:1.05}]}
  });
  klCeilingSlab(8.4,yBridge-.24,-.7,5.8,7.6,{mk:'darkcedar',col:P('teak'),trimMk:'brass',trimCol:P('gilt')});
  klFloorSlab(8.4,yBridge,-.2,6.4,9.2,{mk:'paving',col:P('travertine'),th:.2});
  klStair(10.1,yQuay,8.0,10.1,yBridge,4.2,1.65,{
   mk:'ashlar',col:P('travertine'),sideMk:'cobalt',sideCol:P('cobalt'),openUnder:true
  });

  klTeakSanjhyaGallery(5.4,-4.6,11.4,2.8,yBridge,hUpper,{
   friezePal:'saffron',
   holes:{
    w:[{at:0,w:1.65,h:2.25,door:true,open:true}],
    s:[{at:9.8,w:1.45,h:2.2,door:true,torana:false,leafMk:'lacquer',name:'watergate-upper-door'},{at:6.8,w:1.3,h:1.35,y:.9,roofMk:'celadon'}],
    e:[{at:-.9,w:1.45,h:1.4,y:.9,roofMk:'celadon'}]
   }
  });
  klBellMondop(8.4,yRoof,-.9,6.4,8.0,2,{
   mk:'celadon',bell:false,over:.62,tierRise:1.08
  });

  /* Classical travertine arch viaduct + Gilt Pyatthat-roofed Skywalk spanning the lock-canal! */
  klRoundArcade(-4.8,1.2,4.8,1.2,yQuay,yBridge-yQuay-.22,{bays:2,spandrelPal:'cobalt'});
  klRoundArcade(4.8,-1.2,-4.8,-1.2,yQuay,yBridge-yQuay-.22,{bays:2,spandrelPal:'cobalt'});
  klPyatthatSkywalk(5.4,0,-6.4,0,yBridge,2.2,{roofMk:'brass'});
  klSteelyard(2.2,yBridge-.12,1.35,0,1.65,{bell:true});

  klTarget(8.4,yQuay,-.7,'east-ishtar-tariff-vault',true);
  klTarget(8.4,yBridge,-.9,'upper-lock-watchroom',true);
  klTarget(-8.4,yQuay,0,'west-glaze-pylon-ground',true);
  klTarget(-8.4,yBridge,0,'west-glaze-pylon-winch-deck',true);

  klFurnList([
   ['kulanewa_naruqqum_table',8.4,yQuay,-1.6,0],
   ['kulanewa_amber_safe',10.0,yQuay,-3.2,-PI/2],
   ['kulanewa_bullion_scale',6.8,yQuay,1.2,0],
   ['kulanewa_pavise_rack',8.4,yBridge,-3.0,0],
   ['kulanewa_amber_safe',-8.4,yQuay,-1.4,0],
   ['kulanewa_uktena_brazier',-8.4,yBridge,1.2,0],
   ['kulanewa_oil_cresset',6.4,yQuay,6.8,0]
  ]);
 }
});

/* 55. Travertine-Peristyle and Kura-Vault Bluff Caravanserai */
defBuilding({
 key:'kl_suudme_caravanserai',
 name:'Travertine-Peristyle and Kura-Vault Bluff Caravanserai',
 seed:8155,w:28,d:24,h:17.8,budget:118000,cut:true,
 front:{x:0,z:11.0,yaw:0},
 tags:{style:'suudme',wealth:'middle',types:['infrastructure','inn','tavern'],role:'caravanserai',job:'trading'},
 build(){
  const y1=.5,h1=3.65,y2=y1+h1,h2=3.25,yRoof=y2+h2;
  klFloorSlab(0,y1,0,24.4,20.4,{mk:'cobble',th:y1});
  klSuudmeStair(0,0,10.9,0,y1,9.6,3.4,{nagaScale:.72});

  /* Fortified front Ishtar Gatehouse + kura-and-cobalt compound walls with Babylonian crow-step merlons! */
  klIshtarPortal(0,y1,9.5,0,2.35,2.65,{buttW:1.18,d:.96,hTot:3.75,name:'serai-ishtar-gate'});
  for(const s of [-1,1]){
   const xa=s<0?-11.8:2.45,xb=s<0?-2.45:11.8;
   klWall(xa,9.5,xb,9.5,y1,2.8,{style:'suudme',register:'kura',dadoMk:'cobalt'});
   klMerlonParapet(xa,9.5,xb,9.5,y1+2.8,{pal:'cobalt',bandPal:'saffron',accPal:'emerald'});
  }
  klWall(11.8,9.2,11.8,1.8,y1,2.8,{style:'suudme',register:'kura',dadoMk:'cobalt'});
  klWall(-11.8,1.8,-11.8,9.2,y1,2.8,{style:'suudme',register:'kura',dadoMk:'cobalt'});

  /* Lotus watering basin in east serai courtyard */
  klLotusBasin(6.6,5.6,4.6,2.6,y1+.3,.42,{lotus:4});
  klWallBlock(6.6,y1,5.6,4.6,.9,2.6,0);

  /* Rear Two-Storey Classical Travertine Arcade, Kura Vault & Ruan-Thai Inn [-11.6..11.6, -9.6..1.4] */
  klRoundArcade(-10.8,2.6,10.8,2.6,y1,h1,{bays:6,spandrelPal:'cobalt'});
  klCeilingSlab(0,y2-.24,1.95,22.0,1.5,{mk:'darkcedar',col:P('teak'),trimMk:'brass',trimCol:P('gilt')});

  klWallRing(-11.6,-9.6,11.6,1.4,y1,h1,{
   style:'suudme',register:'kura',dadoMk:'cobalt',udatsu:'ew',udatsuD:1.35,
   holes:{
    s:[
     {at:-6.6,w:1.55,h:2.3,door:true,torana:false,leafMk:'iron',name:'serai-kura-vault-door'},
     {at:0,w:1.85,h:2.4,door:true,torana:true,leafMk:'lacquer',name:'serai-taproom-door'},
     {at:6.6,w:1.55,h:2.3,door:true,torana:false,leafMk:'darkcedar',name:'serai-tack-door'}
    ],
    n:[{at:-6.2,w:1.2,h:1.3,y:1.05},{at:0,w:1.2,h:1.3,y:1.05},{at:6.2,w:1.2,h:1.3,y:1.05}]
   }
  });

  const st=klInteriorStair(8.4,-6.4,y1,y2,0,{w:1.25,riser:.18,going:.27,mk:'darkcedar',smk:'brass',col:P('teak'),scol:P('gilt')});
  klFloorSlab(0,y2,-4.1,22.6,10.8,{mk:'floor',th:.18,hole:st});
  klCeilingSlab(-2.2,y2-.28,-4.1,17.8,10.2,{mk:'darkcedar',col:P('teak'),trimMk:'brass',trimCol:P('gilt')});

  klTeakSanjhyaGallery(-11.3,-9.4,11.3,1.2,y2,h2,{
   friezePal:'saffron',
   holes:{
    s:[{at:-7.2,w:1.45,h:1.45,y:.95,roofMk:'terracotta'},{at:-2.4,w:1.45,h:1.45,y:.95,roofMk:'terracotta'},{at:2.4,w:1.45,h:1.45,y:.95,roofMk:'terracotta'},{at:7.2,w:1.45,h:1.45,y:.95,roofMk:'terracotta'}],
    n:[{at:-5.8,w:1.4,h:1.4,y:.95,roofMk:'terracotta'},{at:5.8,w:1.4,h:1.4,y:.95,roofMk:'terracotta'}]
   }
  });
  klBellMondop(0,yRoof,-4.1,23.0,11.2,2,{
   mk:'terracotta',over:.76,tierRise:1.22,neckH:.36,bell:true,cupolaR:1.95,cupolaH:3.55,cupolaMk:'celadon'
  });

  klTarget(-3.6,y1,5.6,'bluff-serai-peristyle-yard',false);
  klTarget(-1.8,y1,-4.1,'serai-taproom-and-kura',true);
  klTarget(-2.2,y2,-4.1,'upper-factor-bunk-gallery',true);

  klFurnList([
   ['kulanewa_amber_safe',-8.4,y1,-6.8,0],
   ['kulanewa_grain_bin',-5.6,y1,-6.8,0],
   ['kulanewa_tea_samovar',0,y1,-4.2,0],
   ['kulanewa_lotus_divan',0,y1,-2.2,PI],
   ['kulanewa_trundle_bunk',-7.8,y2,-6.8,0],
   ['kulanewa_trundle_bunk',-3.6,y2,-6.8,0],
   ['kulanewa_trundle_bunk',1.2,y2,-6.8,0],
   ['kulanewa_uktena_brazier',-4.2,y1,5.6,0]
  ]);
 }
});

/* 56. Maleva-Strategion Glazed-and-Hooped Bluff Keep */
defBuilding({
 key:'kl_suudme_strategion_keep',
 name:'Maleva-Strategion Glazed-and-Hooped Bluff Keep',
 seed:8156,w:26,d:22,h:20.2,budget:118000,cut:true,
 front:{x:2.4,z:10.2,yaw:0},
 tags:{style:'suudme',wealth:'middle',types:['military'],role:'bastion'},
 build(){
  const y1=.86,h1=3.85,y2=y1+h1,h2=3.45,yRoof=y2+h2;
  klSuudmePlinth(22.2,16.8,y1,{stepX:2.4,stepW:3.2,stepRun:1.65,nagaScale:.74});

  /* SW Inhabited Glazed Paktong-Hooped Garrison Pylon linked by Pyatthat Skywalk! */
  klHoopedGlazePylon(-8.6,1.6,2.95,2.0,y1,14.2,{
   hoops:5,midY:y2,
   opens:[
    {a:PI/2,y:0,w:1.4,h:2.2,door:true,name:'strategion-pylon-door'},
    {a:0,y:y2-y1,w:1.45,h:2.2,door:true,open:true},
    {a:PI,y:3.8,w:.9,h:1.15}
   ]
  });

  /* Main Battered Ishtar-Kura Bastion Keep [-3.8..10.2, -7.4..6.0] */
  klIshtarKuraVault(-3.8,-7.4,10.2,6.0,y1,h1,{
   portalX:3.2,portalW:1.95,portalH:2.45,buttW:1.08,udatsu:'all',leafMk:'iron',
   portalName:'strategion-ishtar-gate',
   holes:{
    s:[{at:-1.2,w:1.1,h:1.25,y:1.2},{at:7.6,w:1.1,h:1.25,y:1.2}],
    n:[{at:0,w:1.1,h:1.25,y:1.2},{at:6.4,w:1.1,h:1.25,y:1.2}],
    e:[{at:-.7,w:1.1,h:1.25,y:1.2}]
   }
  });

  const st=klInteriorStair(7.4,-4.2,y1,y2,0,{w:1.25,riser:.18,going:.27,mk:'darkcedar',smk:'paktong',col:P('teak'),scol:P('paktong')});
  klFloorSlab(3.2,y2,-.7,13.6,13.0,{mk:'floor',th:.18,hole:st});
  klCeilingSlab(1.2,y2-.28,-.7,9.2,12.4,{mk:'darkcedar',col:P('teak'),trimMk:'paktong',trimCol:P('paktong')});

  klTeakSanjhyaGallery(-3.6,-7.2,10.0,5.8,y2,h2,{
   mk:'kilnbrick',pal:'kilnbrick',friezePal:'saffron',
   holes:{
    w:[{at:1.6,w:1.45,h:2.2,door:true,open:true},{at:-3.6,w:1.35,h:1.35,y:.95,roofMk:'slate'}],
    s:[{at:-.4,w:1.4,h:1.4,y:.95,roofMk:'slate'},{at:3.2,w:1.55,h:1.45,y:.95,roofMk:'slate'},{at:6.8,w:1.4,h:1.4,y:.95,roofMk:'slate'}],
    n:[{at:.4,w:1.35,h:1.35,y:.95,roofMk:'slate'},{at:6.0,w:1.35,h:1.35,y:.95,roofMk:'slate'}]
   }
  });
  klPyatthatSkywalk(-3.6,1.6,-6.9,1.6,y2,1.85,{roofMk:'slate'});

  klBellMondop(3.2,yRoof,-.7,14.2,13.6,2,{
   mk:'slate',over:.74,tierRise:1.2,neckH:.36,bell:true,cupolaR:1.95,cupolaH:3.6,cupolaMk:'brass'
  });

  klTarget(2.2,y1,-.7,'strategion-munition-vault',true);
  klTarget(1.8,y2,-.7,'maleva-crossbow-gallery',true);
  klTarget(-8.6,y1,1.6,'strategion-pylon-guardroom',true);
  klTarget(-8.6,y2,1.6,'strategion-pylon-watchdeck',true);

  klFurnList([
   ['kulanewa_pavise_rack',-.6,y1,-5.0,0],
   ['kulanewa_pavise_rack',2.8,y1,-5.0,0],
   ['kulanewa_amber_safe',6.2,y1,-5.0,0],
   ['kulanewa_naruqqum_table',1.8,y1,1.6,0],
   ['kulanewa_trundle_bunk',-.8,y2,-4.6,0],
   ['kulanewa_pavise_rack',3.2,y2,-4.8,0],
   ['kulanewa_amber_safe',-8.6,y1,.6,0],
   ['kulanewa_uktena_brazier',-8.6,y2,.6,0]
  ]);
 }
});

/* 57. Estuary Pyatthat-Kellakoda Signal and Harbour Bastion */
defBuilding({
 key:'kl_suudme_beacon_frustum',
 name:'Estuary Pyatthat-Kellakoda Signal and Harbour Bastion',
 seed:8157,w:20,d:20,h:21.8,budget:98000,cut:true,
 front:{x:0,z:9.4,yaw:0},
 tags:{style:'suudme',wealth:'middle',types:['military','infrastructure'],role:'beacon'},
 build(){
  const y1=.96,yMid=y1+4.1;
  klSuudmePlinth(15.2,15.2,y1,{stepW:2.8,stepRun:1.65,nagaScale:.72});

  /* Babylonian crow-step merlon parapets framing the square headland signal bastion */
  klMerlonParapet(-7.25,7.25,-2.1,7.25,y1,{pal:'cobalt',bandPal:'saffron',accPal:'emerald'});
  klMerlonParapet(2.1,7.25,7.25,7.25,y1,{pal:'cobalt',bandPal:'saffron',accPal:'emerald'});
  klMerlonParapet(7.25,-7.25,-7.25,-7.25,y1,{pal:'cobalt',bandPal:'saffron',accPal:'emerald'});
  klMerlonParapet(-7.25,-6.95,-7.25,6.95,y1,{pal:'cobalt',bandPal:'saffron',accPal:'emerald'});
  klMerlonParapet(7.25,6.95,7.25,-6.95,y1,{pal:'cobalt',bandPal:'saffron',accPal:'emerald'});

  /* Monumental Inhabited Travertine-and-Cobalt Glazed Paktong-Hooped Signal Pylon crowned by Gilt Bell-Cupola! */
  klHoopedGlazePylon(0,0,4.2,2.65,y1,13.6,{
   hoops:6,midY:yMid,bell:true,bellR:2.15,bellH:3.9,bellMk:'brass',
   opens:[
    {a:PI/2,y:0,w:1.55,h:2.3,door:true,name:'suudme-beacon-door'},
    {a:0,y:yMid-y1,w:1.5,h:2.25,door:true,open:true},
    {a:PI,y:5.2,w:.95,h:1.2},
    {a:-PI/2,y:9.2,w:.95,h:1.2}
   ]
  });

  /* Exterior travertine-and-teak signal stair on East flank climbing y1 -> yMid + landing skywalk */
  klStair(5.4,y1,4.8,5.4,yMid,.4,1.55,{mk:'ashlar',col:P('travertine'),cheek:'timber',openUnder:true});
  klSkywalk(5.4,0,2.2,0,yMid,1.65);

  /* SW bastion corner harbour signal cresset fire */
  svNoWalk(()=>{
   cyl('cobalt',-5.2,y1+.01,5.2,.86,.52,P('cobalt'),12);
   cyl('brass',-5.2,y1+.534,5.2,.92,.26,P('gilt'),12);
   cyl('glow',-5.2,y1+.798,5.2,.68,.08,P('flame'),10);
  });
  klWallBlock(-5.2,y1,5.2,1.7,.95,1.7,0);
  smokeAt(-5.2,y1+1.15,5.2,{r:.34,kind:'fire'});
  haloAt(-5.2,y1+.95,5.2,0xffbc58,true);

  klTarget(0,y1,0,'estuary-beacon-guardroom',true);
  klTarget(0,yMid,0,'estuary-beacon-watchdeck',true);

  klFurnList([
   ['kulanewa_naruqqum_table',-1.2,y1,-1.4,0],
   ['kulanewa_amber_safe',1.4,y1,-1.4,0],
   ['kulanewa_pavise_rack',0,y1,-2.5,0],
   ['kulanewa_flux_binnacle',1.2,yMid,-1.0,0],
   ['kulanewa_uktena_brazier',-1.0,yMid,1.0,0],
   ['kulanewa_oil_cresset',5.2,y1,-5.2,0]
  ]);
 }
});
