// prefix: kl
// ================================================================= SUUDME-KAARUM ESTUARY TOWNS — BRAZIERIES, KILNS, ATELIERS & GRANARIES (8148..8152)
//   8148. kl_suudme_paktong_braziery — Valge-Vask Marine Fittings and Uktena Bell-Casting Mill
//   8149. kl_suudme_glaze_kilnworks  — Polychrome Piliika Beehive Glaze-Tile and Celadon Kiln Yard
//   8150. kl_suudme_compass_atelier  — Amber-Seal and Flux-Compass Binnacle Workshop
//   8151. kl_suudme_silk_dyeworks    — Estuary Sea-Byssus and Saffron-Silk Drying Gallery
//   8152. kl_suudme_ziggurat_granary — Stepped Kura-and-Cobalt Ziggurat Bluff Granary and Assay Vault

/* 48. Valge-Vask Marine Fittings and Uktena Bell-Casting Mill */
defBuilding({
 key:'kl_suudme_paktong_braziery',
 name:'Valge-Vask Marine Fittings and Uktena Bell-Casting Mill',
 seed:8148,w:26,d:20,h:18.2,budget:112000,cut:true,
 front:{x:2.4,z:9.0,yaw:0},
 tags:{style:'suudme',wealth:'middle',types:['industry'],role:'braziery',job:'smithing'},
 build(){
  const y1=.56,h1=3.7,y2=y1+h1,h2=3.25,yRoof=y2+h2;

  /* West tidal mill-race driving an undershot paktong-rimmed trip-hammer & bellows wheel */
  klWaterChannel(-9.6,0,4.8,18.4,.3,.78,{river:{name:'suudme-braziery-race',axis:'z',speed:.66}});
  klMillWheel(-7.65,1.45,2.2,0,1.95,.78);

  klFloorSlab(1.8,y1,-.2,17.6,16.4,{mk:'cobble',th:y1});
  klSuudmeStair(2.4,0,8.9,2.4,y1,7.6,3.0,{nagaScale:.68});

  /* Solid glazed & paktong-hooped blast-cupola stack in NW foundry yard */
  klHoopedGlazePylon(-4.8,-4.2,2.05,1.35,y1,12.0,{hollow:false,hoops:5});
  smokeAt(-4.8,y1+12.3,-4.2,{r:.34,kind:'fire'});
  haloAt(-4.8,y1+1.3,-1.8,0xffa848,true);

  /* Ground Ishtar-Kura casting & marine fittings foundry [-1.8..10.2, -7.2..5.8] */
  klIshtarKuraVault(-1.8,-7.2,10.2,5.8,y1,h1,{
   portalX:4.2,portalW:1.85,portalH:2.4,buttW:1.05,udatsu:'ew',
   portalName:'braziery-ishtar-door',leafMk:'iron',
   holes:{
    s:[{at:.4,w:1.15,h:1.3,y:1.1},{at:8.0,w:1.15,h:1.3,y:1.1}],
    w:[{at:1.8,w:1.4,h:2.2,door:true,torana:false,leafMk:'iron',name:'braziery-yard-door'}],
    n:[{at:1.8,w:1.15,h:1.3,y:1.1},{at:6.6,w:1.15,h:1.3,y:1.1}]
   }
  });

  const st=klInteriorStair(7.4,-4.0,y1,y2,0,{w:1.2,riser:.18,going:.27,mk:'darkcedar',smk:'paktong',col:P('teak'),scol:P('paktong')});
  klFloorSlab(4.2,y2,-.7,11.6,12.6,{mk:'floor',th:.18,hole:st});
  klCeilingSlab(2.2,y2-.28,-.7,7.6,12.0,{mk:'darkcedar',col:P('teak'),trimMk:'paktong',trimCol:P('paktong')});

  /* Upper Ruan-Teak & Sanjhya Uktena-mould & bell-tuning loft + 2-tier Slate & Gilt Bell-Mondop! */
  klTeakSanjhyaGallery(-1.6,-7.0,10.0,5.6,y2,h2,{
   friezePal:'saffron',
   holes:{
    s:[{at:.8,w:1.45,h:1.45,y:.95,roofMk:'celadon'},{at:4.2,w:1.6,h:1.5,y:.95,roofMk:'celadon'},{at:7.6,w:1.45,h:1.45,y:.95,roofMk:'celadon'}],
    e:[{at:-.7,w:1.4,h:1.4,y:.95,roofMk:'celadon'}],
    n:[{at:4.2,w:1.45,h:1.45,y:.95,roofMk:'celadon'}]
   }
  });
  klBellMondop(4.2,yRoof,-.7,12.2,13.2,2,{
   mk:'slate',over:.72,tierRise:1.18,neckH:.36,bell:true,cupolaR:1.72,cupolaH:3.25,cupolaMk:'brass'
  });

  klTarget(-4.6,y1,2.6,'braziery-cupola-yard',false);
  klTarget(3.6,y1,-.7,'paktong-casting-floor',true);
  klTarget(2.8,y2,-.7,'uktena-mould-loft',true);

  klFurnList([
   ['kulanewa_trip_anvil',1.2,y1,1.6,0],
   ['kulanewa_bullion_scale',5.6,y1,1.8,PI],
   ['kulanewa_amber_safe',1.2,y1,-4.4,0],
   ['kulanewa_covenant_bell_stand',5.6,y1,-4.4,0],
   ['kulanewa_naruqqum_table',2.8,y2,-1.4,0],
   ['kulanewa_flux_binnacle',.4,y2,2.2,0],
   ['kulanewa_uktena_brazier',-4.6,y1,3.6,0]
  ]);
 }
});

/* 49. Polychrome Piliika Beehive Glaze-Tile and Celadon Kiln Yard */
defBuilding({
 key:'kl_suudme_glaze_kilnworks',
 name:'Polychrome Piliika Beehive Glaze-Tile and Celadon Kiln Yard',
 seed:8149,w:24,d:20,h:15.8,budget:104000,cut:true,
 front:{x:2.6,z:8.9,yaw:0},
 tags:{style:'suudme',wealth:'middle',types:['industry'],role:'kiln-yard',job:'pottery'},
 build(){
  const y1=.48,h1=3.55,y2=y1+h1,h2=3.15,yRoof=y2+h2;
  klFloorSlab(0,y1,-.2,20.6,16.0,{mk:'cobble',th:y1});
  klSuudmeStair(2.6,0,8.8,2.6,y1,7.5,2.8,{nagaScale:.66});

  /* Twin Babylonian polychrome cobalt-saffron-celadon beehive glaze kilns in west yard */
  for(const kz of [-2.8,2.8]){
   svNoWalk(()=>{
    cyl('ashlar',-6.8,y1+.01,kz,1.65,.34,P('travertine'),14);
    cyl('cobalt',-6.8,y1+.354,kz,1.56,.22,P(kz<0?'cobalt':'saffron'),14);
    lathe('kilnbrick',-6.8,kz,[[1.48,y1+.578],[1.28,y1+1.75],[.48,y1+2.75]],14,P('kilnbrick'),{uv:'cone'});
    cyl('celadon',-6.8,y1+2.754,kz,.42,.62,P('celadon'),10);
   });
   klWallBlock(-6.8,y1,kz,3.0,2.8,3.0,0);
   smokeAt(-6.8,y1+3.45,kz,{r:.25,kind:'fire'});
  }
  haloAt(-6.8,y1+.8,2.8,0xffa644,true);

  /* East 2-storey tile-moulding & celadon glazing workshop [-2.4..9.6, -7.0..5.2] + travertine arcade porch */
  klRoundArcade(-2.0,6.8,9.2,6.8,y1,h1,{bays:3,spandrelPal:'saffron'});
  klCeilingSlab(3.6,y2-.24,6.0,11.4,1.5,{mk:'darkcedar',col:P('teak'),trimMk:'brass',trimCol:P('gilt')});

  klWallRing(-2.4,-7.0,9.6,5.2,y1,h1,{
   style:'suudme',register:'kura',dadoMk:'cobalt',
   holes:{
    s:[{at:3.6,w:1.75,h:2.35,door:true,torana:true,leafMk:'lacquer',name:'kilnworks-shop-door'},{at:7.4,w:1.2,h:1.3,y:1.05}],
    w:[{at:0,w:1.4,h:2.2,door:true,torana:false,leafMk:'darkcedar',name:'kilnworks-yard-door'}],
    n:[{at:3.6,w:1.2,h:1.3,y:1.05}]
   }
  });

  const st=klInteriorStair(6.8,-4.0,y1,y2,0,{w:1.15,riser:.18,going:.27,mk:'darkcedar',smk:'brass',col:P('teak'),scol:P('gilt')});
  klFloorSlab(3.6,y2,-.9,11.6,11.8,{mk:'floor',th:.18,hole:st});
  klCeilingSlab(1.6,y2-.28,-.9,7.4,11.2,{mk:'darkcedar',col:P('teak'),trimMk:'brass',trimCol:P('gilt')});

  klTeakSanjhyaGallery(-2.2,-6.8,9.4,5.0,y2,h2,{
   friezePal:'emerald',
   holes:{
    s:[{at:1.0,w:1.45,h:1.4,y:.9,roofMk:'celadon'},{at:6.2,w:1.45,h:1.4,y:.9,roofMk:'celadon'}],
    w:[{at:-.9,w:1.4,h:1.4,y:.9,roofMk:'celadon'}],
    n:[{at:3.6,w:1.4,h:1.4,y:.9,roofMk:'celadon'}]
   }
  });
  klBellMondop(3.6,yRoof,-.9,12.2,12.4,2,{
   mk:'celadon',mode:'gable',gableAxis:'z',bell:false,over:.68,tierRise:1.18
  });

  klTarget(-3.6,y1,6.0,'beehive-glaze-kiln-yard',false);
  klTarget(2.6,y1,-.9,'piliika-glaze-workshop',true);
  klTarget(2.2,y2,-.9,'celadon-drying-loft',true);

  klFurnList([
   ['kulanewa_naruqqum_table',2.2,y1,1.6,0],
   ['kulanewa_grain_bin',.2,y1,-4.4,0],
   ['kulanewa_tablet_rack',3.8,y1,-4.6,0],
   ['kulanewa_tea_samovar',2.2,y2,-1.6,0],
   ['kulanewa_lotus_divan',2.2,y2,.6,PI],
   ['kulanewa_oil_cresset',-3.6,y1,6.2,0]
  ]);
 }
});

/* 50. Amber-Seal and Flux-Compass Binnacle Workshop */
defBuilding({
 key:'kl_suudme_compass_atelier',
 name:'Amber-Seal and Flux-Compass Binnacle Workshop',
 seed:8150,w:22,d:19,h:15.8,budget:98000,cut:true,
 front:{x:0,z:8.9,yaw:0},
 tags:{style:'suudme',wealth:'middle',types:['industry','shop'],role:'atelier',job:'lampmaking'},
 build(){
  const y1=.54,h1=3.55,y2=y1+h1,h2=3.2,yRoof=y2+h2;
  klSuudmePlinth(18.2,14.8,y1,{stepW:2.8,stepRun:1.35,nagaScale:.66});

  /* Forecourt magnetic lodestone-and-paktong compass calibration obelisk */
  svNoWalk(()=>{
   box('cobalt',-6.8,y1+.01,5.6,1.18,.28,1.18,P('cobalt'));
   box('ashlar',-6.8,y1+.294,5.6,.92,.95,.92,P('travertine'));
   box('paktong',-6.8,y1+1.248,5.6,.74,.78,.74,P('paktong'));
   cone('sootstone',-6.8,y1+2.032,5.6,.48,.62,P('sootstone'),4);
   cyl('brass',-6.8,y1+2.656,5.6,.05,.24,P('gilt'),6);
  });
  klWallBlock(-6.8,y1,5.6,1.2,2.6,1.2,0);

  /* Classical travertine round-arch shopfront arcade [z = 3.8..6.6] */
  klRoundArcade(-7.8,6.6,7.8,6.6,y1,h1,{bays:4,spandrelPal:'cobalt'});
  klCeilingSlab(0,y2-.24,5.2,16.0,2.6,{mk:'darkcedar',col:P('teak'),trimMk:'brass',trimCol:P('gilt')});

  /* Ground kura & cobalt-dado instrument & amber-seal engraving hall [-8.0..8.0, -6.8..3.8] */
  klWallRing(-8.0,-6.8,8.0,3.8,y1,h1,{
   style:'suudme',register:'kura',dadoMk:'cobalt',
   holes:{
    s:[
     {at:0,w:1.8,h:2.35,door:true,torana:true,leafMk:'lacquer',name:'atelier-front-door'},
     {at:-4.6,w:1.2,h:1.3,y:1.05},
     {at:4.6,w:1.2,h:1.3,y:1.05}
    ],
    n:[{at:-3.8,w:1.15,h:1.3,y:1.05},{at:3.8,w:1.15,h:1.3,y:1.05}]
   }
  });

  const st=klInteriorStair(5.2,-4.0,y1,y2,0,{w:1.15,riser:.18,going:.27,mk:'darkcedar',smk:'paktong',col:P('teak'),scol:P('paktong')});
  klFloorSlab(0,y2,-1.5,15.6,10.2,{mk:'floor',th:.18,hole:st});
  klCeilingSlab(-1.8,y2-.28,-1.5,11.2,9.6,{mk:'darkcedar',col:P('teak'),trimMk:'brass',trimCol:P('gilt')});

  /* Upper Ruan-Teak & overhanging Sanjhya flux-compass binnacle loft + 2-tier Celadon Mondop roof! */
  klTeakSanjhyaGallery(-7.8,-6.6,7.8,3.6,y2,h2,{
   friezePal:'saffron',
   holes:{
    s:[{at:-4.4,w:1.45,h:1.45,y:.95,roofMk:'celadon'},{at:0,w:1.65,h:1.5,y:.95,roofMk:'celadon'},{at:4.4,w:1.45,h:1.45,y:.95,roofMk:'celadon'}],
    e:[{at:-1.5,w:1.4,h:1.4,y:.95,roofMk:'celadon'}],
    w:[{at:-1.5,w:1.4,h:1.4,y:.95,roofMk:'celadon'}],
    n:[{at:0,w:1.45,h:1.45,y:.95,roofMk:'celadon'}]
   }
  });
  klBellMondop(0,yRoof,-1.5,16.2,10.8,2,{
   mk:'celadon',bell:false,over:.7,tierRise:1.18,neckH:.36
  });

  klTarget(1.2,y1,5.2,'atelier-arcade-porch',true);
  klTarget(-1.6,y1,-1.5,'amber-seal-engraving-room',true);
  klTarget(-1.8,y2,-1.5,'flux-compass-binnacle-loft',true);

  klFurnList([
   ['kulanewa_flux_binnacle',-3.6,y1,1.4,0],
   ['kulanewa_naruqqum_table',0,y1,-1.6,0],
   ['kulanewa_tablet_rack',-5.6,y1,-4.4,0],
   ['kulanewa_amber_safe',2.4,y1,-4.4,0],
   ['kulanewa_flux_binnacle',-3.8,y2,-1.2,0],
   ['kulanewa_naruqqum_table',-.6,y2,-1.8,0],
   ['kulanewa_lotus_divan',-1.2,y2,.8,PI]
  ]);
 }
});

/* 51. Estuary Sea-Byssus and Saffron-Silk Drying Gallery */
defBuilding({
 key:'kl_suudme_silk_dyeworks',
 name:'Estuary Sea-Byssus and Saffron-Silk Drying Gallery',
 seed:8151,w:24,d:20,h:15.8,budget:102000,cut:true,
 front:{x:-2.2,z:8.9,yaw:0},
 tags:{style:'suudme',wealth:'middle',types:['industry','shop'],role:'dyeworks',job:'dyeing'},
 build(){
  const y1=.52,h1=3.55,y2=y1+h1,h2=3.2,yRoof=y2+h2;

  /* East rinsing stream + interlocking dark-cedar Kiyomizu silk-rinsing trestle! */
  klWaterChannel(9.0,0,3.6,16.8,.28,.68,{river:{name:'suudme-dye-rinse',axis:'z',speed:.44}});
  klFloorSlab(-2.4,y1,-.2,14.6,15.8,{mk:'paving',col:P('travertine'),th:y1});
  klSuudmeStair(-2.2,0,8.8,-2.2,y1,7.4,2.8,{nagaScale:.66});
  klKiyomizuTrestle(6.4,.6,3.6,11.6,0,y1,{rails:'ns'});

  /* Three polychrome glazed stone saffron/crimson/cobalt dye-vats on SE rinsing apron */
  for(let i=0;i<3;i++){
   const vz=-3.4+i*2.6,vPal=i===0?'saffron':i===1?'crimson':'cobalt';
   svNoWalk(()=>{
    cyl('ashlar',6.4,y1+.01,vz,.82,.58,P('travertine'),12);
    cyl('cobalt',6.4,y1+.594,vz,.86,.12,P(vPal),12);
    cyl(i===1?'lacquer':'cobalt',6.4,y1+.48,vz,.68,.06,P(vPal),10);
   });
   klWallBlock(6.4,y1,vz,1.65,.88,1.65,0);
  }

  /* Ground Ishtar-Kura mordant & sea-byssus weaving vault [-9.0,-7.2..4.4,4.8] */
  klIshtarKuraVault(-9.0,-7.2,4.4,4.8,y1,h1,{
   portalX:-2.3,portalW:1.8,portalH:2.35,buttW:1.0,
   portalName:'dyeworks-ishtar-door',
   holes:{
    s:[{at:-6.6,w:1.15,h:1.25,y:1.05},{at:2.0,w:1.15,h:1.25,y:1.05}],
    e:[{at:1.2,w:1.4,h:2.2,door:true,torana:false,leafMk:'darkcedar',name:'dyeworks-trestle-door'}],
    n:[{at:-4.8,w:1.15,h:1.25,y:1.05},{at:.2,w:1.15,h:1.25,y:1.05}]
   }
  });

  const st=klInteriorStair(-6.6,-4.6,y1,y2,PI/2,{w:1.15,riser:.18,going:.26,mk:'darkcedar',smk:'brass',col:P('teak'),scol:P('gilt')});
  klFloorSlab(-2.3,y2,-1.2,13.0,11.6,{mk:'floor',th:.18,hole:st});
  klCeilingSlab(-2.3,y2-.28,.8,12.2,6.8,{mk:'darkcedar',col:P('teak'),trimMk:'brass',trimCol:P('gilt')});

  /* Upper Ruan-Thai loom chamber [-8.8..4.2, -7.0..1.4] + open south saffron-silk drying veranda [z = 1.4..4.6]! */
  klTeakSanjhyaGallery(-8.8,-7.0,4.2,1.4,y2,h2,{
   friezePal:'saffron',
   holes:{
    s:[
     {at:-2.3,w:1.5,h:2.2,door:true,torana:false,leafMk:'lacquer',name:'dyeworks-gallery-door'},
     {at:-6.2,w:1.35,h:1.35,y:.9,roofMk:'terracotta'},
     {at:1.6,w:1.35,h:1.35,y:.9,roofMk:'terracotta'}
    ],
    n:[{at:-2.3,w:1.45,h:1.4,y:.9,roofMk:'terracotta'}]
   }
  });
  klPeristyle(-8.6,4.4,4.0,4.4,y2,h2,{n:5,friezePal:'saffron'});
  klParapet(-8.6,4.48,4.0,4.48,y2,{kind:'timber'});
  svNoWalk(()=>{
   const cols=['silkSaffron','silkCrimson','silkIndigo'];
   for(let i=0;i<3;i++){
    const bx=-6.0+i*3.7;
    withCloth(clothHang(1.65,.08),()=>{
     quad('silk',bx,y2+2.15,4.55,1.25,1.65,P(cols[i]),0);
    });
   }
  });
  klBellMondop(-2.3,yRoof,-1.2,13.6,12.2,2,{
   mk:'terracotta',mode:'gable',gableAxis:'x',bell:false,over:.68,tierRise:1.18
  });

  klTarget(5.2,y1,5.2,'kiyomizu-dye-rinsing-deck',false);
  klTarget(-.8,y1,.6,'sea-byssus-mordant-hall',true);
  klTarget(1.2,y2,-2.2,'upper-silk-loom-chamber',true);
  klTarget(-2.3,y2,3.0,'saffron-silk-drying-veranda',true);

  klFurnList([
   ['kulanewa_naruqqum_table',-.8,y1,1.4,0],
   ['kulanewa_grain_bin',1.8,y1,-2.2,0],
   ['kulanewa_grain_bin',1.8,y1,-4.6,0],
   ['kulanewa_tablet_rack',1.4,y2,-4.8,0],
   ['kulanewa_lotus_divan',1.8,y2,-1.8,-PI/2],
   ['kulanewa_tea_samovar',-2.3,y2,2.8,0],
   ['kulanewa_oil_cresset',5.2,y1,5.6,0]
  ]);
 }
});

/* 52. Stepped Kura-and-Cobalt Ziggurat Bluff Granary and Assay Vault */
defBuilding({
 key:'kl_suudme_ziggurat_granary',
 name:'Stepped Kura-and-Cobalt Ziggurat Bluff Granary and Assay Vault',
 seed:8152,w:26,d:20,h:18.4,budget:110000,cut:true,
 front:{x:0,z:9.6,yaw:0},
 tags:{style:'suudme',wealth:'middle',types:['infrastructure','farm'],role:'granary',job:'warehousing'},
 build(){
  const y1=.78,h1=3.85,y2=y1+h1,h2=3.35,yRoof=y2+h2;
  klSuudmePlinth(22.2,15.6,y1,{stepW:3.6,stepRun:1.55,nagaScale:.74});

  /* Front Classical travertine round-arch grain-weighing portico + cantilevered paktong steelyard! */
  klRoundArcade(-10.0,7.0,10.0,7.0,y1,h1,{bays:6,spandrelPal:'saffron'});
  klCeilingSlab(0,y2-.24,5.5,20.6,2.8,{mk:'darkcedar',col:P('teak'),trimMk:'brass',trimCol:P('gilt')});
  klSteelyard(6.4,y2-.14,7.25,0,1.85,{bell:true});

  /* Ground Tier: Battered Ishtar-Kura Reserve Granary [-10.4..10.4, -7.2..4.0] with cobalt udatsu firewalls! */
  klIshtarKuraVault(-10.4,-7.2,10.4,4.0,y1,h1,{
   portalX:0,portalW:1.95,portalH:2.45,buttW:1.1,udatsu:'ew',leafMk:'iron',
   portalName:'granary-ishtar-door',
   holes:{
    s:[
     {at:-6.6,w:1.5,h:2.25,door:true,torana:false,leafMk:'iron',name:'granary-west-bay-door'},
     {at:6.6,w:1.5,h:2.25,door:true,torana:false,leafMk:'iron',name:'granary-east-bay-door'}
    ],
    n:[{at:-6.2,w:1.05,h:1.15,y:1.5},{at:0,w:1.05,h:1.15,y:1.5},{at:6.2,w:1.05,h:1.15,y:1.5}]
   }
  });

  /* Stepped Ziggurat Second Tier [-7.6..7.6, -6.0..2.6] surrounded by walkable crow-stepped merlon shoulders! */
  const st=klInteriorStair(5.0,-3.6,y1,y2,0,{w:1.2,riser:.18,going:.27,mk:'darkcedar',smk:'paktong',col:P('teak'),scol:P('paktong')});
  klFloorSlab(0,y2,-1.6,20.2,10.8,{mk:'paving',col:P('travertine'),th:.18,hole:st});
  klCeilingSlab(-2.0,y2-.28,-1.6,14.8,10.2,{mk:'darkcedar',col:P('teak'),trimMk:'paktong',trimCol:P('paktong')});

  klMerlonParapet(-10.0,3.65,-2.5,3.65,y2,{pal:'cobalt',bandPal:'saffron',accPal:'emerald'});
  klMerlonParapet(2.5,3.65,10.0,3.65,y2,{pal:'cobalt',bandPal:'saffron',accPal:'emerald'});
  klMerlonParapet(10.0,-6.85,-10.0,-6.85,y2,{pal:'cobalt',bandPal:'saffron',accPal:'emerald'});
  klMerlonParapet(-10.0,-6.6,-10.0,3.4,y2,{pal:'cobalt',bandPal:'saffron',accPal:'emerald'});
  klMerlonParapet(10.0,3.4,10.0,-6.6,y2,{pal:'cobalt',bandPal:'saffron',accPal:'emerald'});

  klWallRing(-7.6,-6.0,7.6,2.6,y2,h2,{
   style:'suudme',register:'kura',dadoMk:'cobalt',
   holes:{
    s:[{at:-4.2,w:1.15,h:1.2,y:1.1},{at:0,w:1.25,h:1.25,y:1.1},{at:4.2,w:1.15,h:1.2,y:1.1}],
    e:[{at:-1.7,w:1.4,h:2.15,door:true,torana:false,leafMk:'iron',name:'granary-east-terrace-door'}],
    w:[{at:-1.7,w:1.4,h:2.15,door:true,torana:false,leafMk:'iron',name:'granary-west-terrace-door'}],
    n:[{at:-3.8,w:1.15,h:1.2,y:1.1},{at:3.8,w:1.15,h:1.2,y:1.1}]
   }
  });
  klBellMondop(0,yRoof,-1.7,15.8,9.2,2,{
   mk:'celadon',over:.72,tierRise:1.18,neckH:.36,bell:true,cupolaR:1.82,cupolaH:3.45,cupolaMk:'brass'
  });

  klTarget(0,y1,5.5,'granary-arcade-weighing-porch',true);
  klTarget(-1.8,y1,-1.6,'ground-kura-grain-vault',true);
  klTarget(-1.8,y2,-1.7,'upper-ziggurat-assay-loft',true);
  klTarget(-8.9,y2,-1.7,'west-ziggurat-merlon-terrace',false);

  klFurnList([
   ['kulanewa_grain_bin',-7.8,y1,-4.6,0],
   ['kulanewa_grain_bin',-5.2,y1,-4.6,0],
   ['kulanewa_grain_bin',-1.4,y1,-4.6,0],
   ['kulanewa_grain_bin',1.4,y1,-4.6,0],
   ['kulanewa_amber_safe',6.8,y1,-4.6,0],
   ['kulanewa_bullion_scale',-3.6,y1,5.5,0],
   ['kulanewa_grain_bin',-4.4,y2,-3.8,0],
   ['kulanewa_amber_safe',-.8,y2,-3.8,0]
  ]);
 }
});
