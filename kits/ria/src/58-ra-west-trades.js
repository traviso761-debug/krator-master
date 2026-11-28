// prefix: ra
// ================================================================= LOWER RIA / WESTERN DYNASTY (RIWA-TOKA) — TRADES, GRANARY & POOR DWELLING (14-18)
// 50/50 Balanced Fusion Grammar:
//   14. ra_west_glaze_kiln       — Stepped brick beehive glaze-kilns + Classical drying arcade + celadon-roofed potters workshop
//   15. ra_west_silk_dyeworks    — Sunken indigo & saffron stone dye-vats + Minoan drying terrace + Ruan-Thai loom loft
//   16. ra_west_bronze_smithy    — Rusticated stone round-arch forge vault (smokeAt + haloAt) + Pyatthat foundry hood
//   17. ra_west_ziggurat_granary — Battered flood-proof stepped Babylonian brick granary with merlon parapets + teak loft gable
//   18. ra_west_canal_cottage    — Glazed-brick arched flood-socle + Minoan front court + compact terracotta Ruan-Thai cottage

/* 14. Babylonian Beehive Glaze-Kilns and Celadon Potters Workshop */
defBuilding({
 key:'ra_west_glaze_kiln',
 name:'Babylonian Beehive Glaze-Kilns and Celadon Potters Workshop',
 seed:7114,w:20,d:18,h:13.8,budget:92000,cut:true,
 front:{x:-2.2,z:8.1,yaw:0},
 tags:{style:'lower-ria',wealth:'middle',types:['industry','shop'],role:'kiln',job:'pottery'},
 build(){
  const y1=.32,gh=3.55,yRoof=y1+gh;
  raFloorSlab(0,y1,0,17.8,15.4,{mk:'paving',th:.32});
  raStripWalk([-2.2,0,8.2],[-2.2,y1,7.0],3.0);

  /* East Kiln Yard: Twin Stepped Babylonian Glazed-Collar Brick Beehive Kilns + Glowing Fireboxes */
  for(const kz of [-3.4,2.8]){
   const kx=5.8;
   svNoWalk(()=>{
    cyl('cobalt',kx,y1+.01,kz,2.25,.38,P('cobalt'),18);
    lathe('brick',kx,kz,[[2.15,y1+.39],[1.95,y1+1.55],[1.32,y1+2.75],[.54,y1+3.65]],18,P('brick'),{uv:'cone'});
    cyl('saffron',kx,y1+1.48,kz,1.99,.18,P('saffron'),18);
    cyl('cobalt',kx,y1+3.65,kz,.58,.42,P('cobalt'),14);
    /* Arched stoking mouth + glowing kiln embers facing west into workyard */
    box('travertine',kx-2.05,y1+.02,kz,.45,1.05,1.15,P('travertine'));
    box('glow',kx-1.88,y1+.12,kz,.16,.68,.72,P('flame'));
   });
   raWallBlock(kx,y1,kz,4.1,3.6,4.1,0);
   smokeAt(kx,y1+4.15,kz,{r:.3,kind:'fire'});
   haloAt(kx-2.1,y1+.55,kz,0xff9a38,true);
  }
  raMerlonParapet(2.6,7.45,8.6,7.45,y1,{mk:'cobalt',bandMk:'saffron',capMk:'gold',block:true});
  raMerlonParapet(8.65,7.2,8.65,-7.2,y1,{mk:'brick',bandMk:'cobalt',capMk:'saffron',block:true});

  /* Front Classical Travertine Round-Arch Pottery Drying Loggia [-8.4..1.8, 3.0..7.2] */
  raArcade(-8.2,7.0,1.6,7.0,y1,gh,{style:'lower-ria',bays:3,mk:'travertine',trimMk:'cobalt',pierW:.48});
  raFlatTerraceRoof(-3.3,yRoof,5.1,10.2,4.2,{
   style:'lower-ria',mk:'travertine',topMk:'mosaic',soffitMk:'teak',trimMk:'gold',parapet:'balustrade',skip:'n'
  });

  /* Rear Enclosed Potters Wheel & Polychrome Glaze Workshop [-8.4..1.8, -6.8..3.0] + 2-Tier Celadon Thai Roof */
  raWallRing(-8.4,-6.8,1.8,3.0,y1,gh,{
   style:'lower-ria',mk:'plaster',col:P('plasterCream'),socMk:'cobalt',dadoMk:'emerald',postMk:'travertine',
   holes:{
    s:[{at:-3.3,w:1.75,h:2.3,door:true,name:'potter-shop-door'},{at:-6.6,w:1.15,h:1.4,y:.95,pediment:true}],
    e:[{at:-1.8,w:1.55,h:2.2,door:true,name:'kiln-yard-door'}],
    n:[{at:-5.6,w:1.15,h:1.4,y:.95},{at:-1.0,w:1.15,h:1.4,y:.95}],
    w:[{at:-1.9,w:1.15,h:1.4,y:.95}]
   }
  });
  raTieredRoof(-3.3,yRoof,-1.9,10.6,10.0,2,{
   style:'lower-ria',mode:'gable',gableAxis:'z',mk:'celadon',trimMk:'gold',soffitMk:'teak',neckMk:'crimson',
   over:.64,tierRise:1.28,neckH:.36,stepIn:.76
  });

  raTarget(-3.3,y1,5.1,'pottery-drying-arcade',true);
  raTarget(-3.3,y1,-1.9,'glaze-wheel-workshop',true);
  raTarget(2.8,y1,-.3,'beehive-kiln-yard',false);

  raFurnList([
   ['ria_glazed_amphora_rack',-6.9,y1,-4.2,PI/2],
   ['ria_glazed_amphora_rack',-6.9,y1,.4,PI/2],
   ['ria_glazed_amphora_rack',-.6,y1,5.2,0],
   ['ria_offering_basin',-2.4,y1,-4.4,0],
   ['ria_porphyry_table',-3.4,y1,-1.2,0],
   ['ria_tribute_chest',.2,y1,-4.8,0],
   ['ria_lantern_stand',-6.2,y1,5.2,0]
  ]);
 }
});

/* 15. Minoan Stone Dye-Vat Terrace and Ruan-Thai Silk Loom-House */
defBuilding({
 key:'ra_west_silk_dyeworks',
 name:'Minoan Stone Dye-Vat Terrace and Ruan-Thai Silk Loom-House',
 seed:7115,w:21,d:18,h:13.6,budget:92000,cut:true,
 front:{x:2.6,z:8.1,yaw:0},
 tags:{style:'lower-ria',wealth:'middle',types:['industry','shop'],role:'dyeworks',job:'dyeing'},
 build(){
  const y1=.36,gh=3.5,yRoof=y1+gh;
  raFloorSlab(0,y1,0,18.6,15.4,{mk:'paving',th:.36});
  raStripWalk([2.6,0,8.2],[2.6,y1,7.0],3.0);

  /* Forecourt West Dye-Yard: Twin Sunken Cobalt-Indigo & Saffron Stone Dye-Vats + Hanging Dyed Silk Skeins */
  raWaterCourt(-5.4,4.8,4.2,3.4,y1+.34,.44,{style:'lower-ria',curbMk:'cobalt',trimMk:'saffron',lotus:0});
  raWaterCourt(-5.4,.6,4.2,3.4,y1+.34,.44,{style:'lower-ria',curbMk:'emerald',trimMk:'saffron',lotus:0});
  svNoWalk(()=>{
   for(const dz of [2.7,6.8]){
    for(const dx of [-7.6,-3.2])cyl('travertine',dx,y1+.01,dz,.14,2.85,P('travertine'),10);
    box('teak',-5.4,y1+2.78,dz,4.6,.07,.07,P('teak'));
    withCloth(clothHang(1.55,.07),()=>{
     quad('silk',-6.3,y1+1.95,dz,.95,1.55,P('silkIndigo'),0);
     quad('silk',-4.5,y1+1.95,dz,.95,1.55,P(dz>4?'silkSaffron':'silkCrimson'),0);
    });
   }
  });

  /* East Front Flat-Roofed Minoan Tapered-Stone Drying Loggia [-1.0..8.6, 2.2..7.0] */
  for(const bx of [-.4,2.6,5.6,8.2]){
   raColumn(bx,y1,6.7,gh-.16,{style:'lower-ria',mk:'travertine',capMk:'gold',baseMk:'cobalt',r:.2,taper:'minoan',block:false});
  }
  raFlatTerraceRoof(3.8,yRoof-.16,4.6,9.8,4.8,{
   style:'lower-ria',mk:'travertine',topMk:'mosaic',soffitMk:'teak',trimMk:'gold',parapet:'balustrade',skip:'n'
  });

  /* Rear Full-Width Carved Dark-Teak Ruan-Thai Silk Loom Hall [-8.6..8.6, -7.0..2.0] */
  raWallRing(-8.6,-7.0,8.6,2.0,y1,gh,{
   style:'lower-ria',mk:'teak',socMk:'cobalt',dadoMk:'saffron',postMk:'crimson',cornice:false,
   holes:{
    s:[
     {at:-2.2,w:1.55,h:2.2,door:true,leafMk:'carvedwood',name:'dye-vat-door'},
     {at:3.2,w:1.75,h:2.3,door:true,leafMk:'carvedwood',name:'loom-hall-door'},
     {at:6.6,w:1.15,h:1.4,y:.95}
    ],
    n:[{at:-5.2,w:1.2,h:1.4,y:.95},{at:0,w:1.2,h:1.4,y:.95},{at:5.2,w:1.2,h:1.4,y:.95}],
    e:[{at:-2.5,w:1.2,h:1.4,y:.95}],
    w:[{at:-2.5,w:1.2,h:1.4,y:.95}]
   }
  });
  raTieredRoof(0,yRoof,-2.5,17.6,9.2,2,{
   style:'lower-ria',mode:'gable',gableAxis:'x',mk:'terracotta',trimMk:'gold',soffitMk:'teak',neckMk:'crimson',
   over:.68,tierRise:1.35,neckH:.36,stepIn:.76
  });

  raTarget(3.8,y1,4.6,'minoan-drying-loggia',true);
  raTarget(0,y1,-2.5,'ruan-thai-loom-hall',true);
  raTarget(-1.8,y1,4.8,'dye-vat-terrace',false);

  raFurnList([
   ['ria_silk_screen',-5.8,y1,-4.6,.18],
   ['ria_silk_screen',5.8,y1,-4.6,-.18],
   ['ria_porphyry_table',-2.2,y1,-2.6,0],
   ['ria_porphyry_table',3.2,y1,-2.6,0],
   ['ria_glazed_amphora_rack',-7.0,y1,-.6,PI/2],
   ['ria_tribute_chest',7.0,y1,-.6,-PI/2],
   ['ria_saffron_cushion',-2.2,y1,-1.3,PI],
   ['ria_lantern_stand',6.2,y1,4.6,0]
  ]);
 }
});

/* 16. Classical Rusticated Forge-Vault and Pyatthat Bronze Foundry */
defBuilding({
 key:'ra_west_bronze_smithy',
 name:'Classical Rusticated Forge-Vault and Pyatthat Bronze Foundry',
 seed:7116,w:19,d:17,h:14.8,budget:90000,cut:true,
 front:{x:-2.0,z:7.6,yaw:0},
 tags:{style:'lower-ria',wealth:'middle',types:['industry','shop'],role:'smithy',job:'smithing'},
 build(){
  const y1=.36,gh=3.7,yRoof=y1+gh;
  raFloorSlab(0,y1,0,16.8,14.4,{mk:'paving',th:.36});
  raStripWalk([-2.0,0,7.8],[-2.0,y1,6.6],3.0);

  /* Front Classical Rusticated Travertine & Brick Round-Arch Forge Loggia [-7.8..2.2, 2.2..6.6] */
  raArcade(-7.6,6.4,2.0,6.4,y1,gh,{style:'lower-ria',bays:3,mk:'travertine',trimMk:'brick',pierW:.52});
  raArcade(-7.6,2.2,-7.6,6.4,y1,gh,{style:'lower-ria',bays:1,mk:'travertine',trimMk:'brick',pierW:.52});
  raFlatTerraceRoof(-2.8,yRoof,4.4,10.0,4.4,{
   style:'lower-ria',mk:'travertine',topMk:'paving',soffitMk:'travertine',trimMk:'bronze',
   parapet:'merlon',parMk:'cobalt',bandMk:'saffron',capMk:'gold',skip:'n'
  });

  /* East Masonry Smelting Hearth & Bronze Flue Stack [3.0..7.8, 1.8..6.4] */
  svNoWalk(()=>{
   box('brick',5.4,y1+.01,4.2,4.2,2.45,3.8,P('brick'));
   box('cobalt',5.4,y1+2.46,4.2,4.34,.22,3.94,P('cobalt'));
   box('bronze',5.4,y1+2.68,4.2,2.8,1.35,2.6,P('bronze'));
   cyl('brick',5.4,y1+4.03,4.2,.68,2.6,P('brick'),14);
   cyl('bronze',5.4,y1+6.63,4.2,.76,.24,P('bronze'),14);
   /* Glowing hearth mouth facing west into the forge loggia */
   box('glow',3.22,y1+.55,4.2,.14,.85,1.25,P('flame'));
  });
  raWallBlock(5.4,y1,4.2,4.2,3.8,3.8,0);
  smokeAt(5.4,y1+6.95,4.2,{r:.34,kind:'fire'});
  haloAt(3.05,y1+.95,4.2,0xff8e30,true);

  /* Rear Bronze-Casting Foundry Hall [-7.8..7.8, -6.6..2.0] + 3-Tier Burmese Pyatthat Ventilated Foundry Hood */
  raWallRing(-7.8,-6.6,7.8,2.0,y1,gh,{
   style:'lower-ria',mk:'brick',socMk:'cobalt',dadoMk:'saffron',postMk:'travertine',
   holes:{
    s:[{at:-2.4,w:1.85,h:2.35,door:true,name:'foundry-main-door'},{at:4.2,w:1.15,h:1.4,y:1.0}],
    n:[{at:-4.4,w:1.15,h:1.4,y:1.0},{at:0,w:1.3,h:1.5,y:1.0},{at:4.4,w:1.15,h:1.4,y:1.0}],
    e:[{at:-2.3,w:1.2,h:1.4,y:1.0}],
    w:[{at:-2.3,w:1.45,h:2.2,door:true,name:'foundry-side-door'}]
   }
  });
  raTieredRoof(0,yRoof,-2.3,16.0,8.8,3,{
   style:'lower-ria',mode:'hip',mk:'terracotta',trimMk:'bronze',soffitMk:'teak',neckMk:'cobalt',
   over:.62,tierRise:1.1,neckH:.38,stepIn:.76,spire:true,spireH:2.8
  });

  raTarget(-2.8,y1,4.4,'forge-arch-loggia',true);
  raTarget(0,y1,-2.3,'bronze-casting-hall',true);

  raFurnList([
   ['ria_uktena_brazier',-5.2,y1,4.4,0],
   ['ria_offering_basin',-.4,y1,4.4,0],
   ['ria_porphyry_table',-3.4,y1,-2.4,0],
   ['ria_porphyry_table',3.2,y1,-2.4,0],
   ['ria_tribute_chest',-6.0,y1,-4.8,0],
   ['ria_tribute_chest',5.8,y1,-4.8,0],
   ['ria_glazed_amphora_rack',6.2,y1,-.6,-PI/2]
  ]);
 }
});

/* 17. Babylonian Stepped Merlon Granary and Teak Ventilation Loft */
defBuilding({
 key:'ra_west_ziggurat_granary',
 name:'Babylonian Stepped Merlon Granary and Teak Ventilation Loft',
 seed:7117,w:20,d:18,h:15.4,budget:90000,cut:true,
 front:{x:0,z:8.2,yaw:0},
 tags:{style:'lower-ria',wealth:'middle',types:['industry','infrastructure'],role:'granary',job:'warehousing'},
 build(){
  /* High flood-proof stepped brick & lapis-cobalt Babylonian plinth (y1 = 1.35 m) */
  const y1=raPlinth(16.2,12.6,1.35,{
   style:'lower-ria',baseMk:'cobalt',midMk:'brick',capMk:'travertine',topMk:'paving',
   stepW:2.8,stepRun:2.8,rail:'naga',railOpts:{scale:.7}
  });

  /* Battered Babylonian Corner Pylons + Thick Ventilated Brick & Glazed-Band Granary Vault */
  const gh=4.2,yRoof=y1+gh;
  for(const sx of [-7.2,7.2])for(const sz of [-5.4,5.4]){
   raBatteredPylon(sx,sz,2.0,2.0,y1,gh+.28,{style:'lower-ria',mk:'brick',bandMk:'cobalt',relMk:'saffron'});
  }
  raWallRing(-7.0,-5.4,7.0,5.4,y1,gh-.22,{
   style:'lower-ria',mk:'brick',socMk:'cobalt',dadoMk:'saffron',postMk:'travertine',
   holes:{
    s:[{at:0,w:1.95,h:2.45,door:true,name:'granary-vault-door'},{at:-3.8,w:.95,h:1.25,y:1.35},{at:3.8,w:.95,h:1.25,y:1.35}],
    n:[{at:-3.8,w:.95,h:1.25,y:1.35},{at:0,w:.95,h:1.25,y:1.35},{at:3.8,w:.95,h:1.25,y:1.35}],
    e:[{at:-2.2,w:.95,h:1.25,y:1.35},{at:2.2,w:.95,h:1.25,y:1.35}],
    w:[{at:-2.2,w:.95,h:1.25,y:1.35},{at:2.2,w:.95,h:1.25,y:1.35}]
   }
  });

  /* 50/50 CROWN: Flat Babylonian Crow-Step Merlon Granary Deck + Raised Carved-Teak & Celadon Thai Ventilated Grain-Loft */
  const yDeck=raFlatTerraceRoof(0,yRoof,0,15.4,11.8,{
   style:'lower-ria',mk:'travertine',topMk:'paving',soffitMk:'teak',trimMk:'gold',
   parapet:'merlon',parMk:'cobalt',bandMk:'saffron',capMk:'gold'
  });
  svNoWalk(()=>{
   box('teak',0,yDeck+.02,0,9.6,1.35,6.8,P('teak'));
   box('carvedwood',0,yDeck+.48,0,9.72,.45,6.92,P('carvedGilt'));
  });
  raTieredRoof(0,yDeck+1.37,0,10.0,7.2,2,{
   style:'lower-ria',mode:'gable',gableAxis:'x',mk:'celadon',trimMk:'gold',soffitMk:'teak',neckMk:'crimson',
   over:.64,tierRise:1.2,neckH:.34,stepIn:.76,ceiling:false
  });

  raTarget(0,y1,0,'ziggurat-granary-vault',true);

  raFurnList([
   ['ria_glazed_amphora_rack',-5.4,y1,-3.2,PI/2],
   ['ria_glazed_amphora_rack',-5.4,y1,1.8,PI/2],
   ['ria_glazed_amphora_rack',5.4,y1,-3.2,-PI/2],
   ['ria_glazed_amphora_rack',5.4,y1,1.8,-PI/2],
   ['ria_tribute_chest',-2.2,y1,-3.6,0],
   ['ria_tribute_chest',2.2,y1,-3.6,0],
   ['ria_amber_seal_desk',0,y1,2.2,PI],
   ['ria_lantern_stand',-2.6,y1,3.2,0]
  ]);
 }
});

/* 18. Glazed-Brick Flood-Socle and Minoan-Thai Canal Cottage */
defBuilding({
 key:'ra_west_canal_cottage',
 name:'Glazed-Brick Flood-Socle and Minoan-Thai Canal Cottage',
 seed:7118,w:14,d:14,h:10.8,budget:72000,cut:true,
 front:{x:0,z:6.1,yaw:0},
 tags:{style:'lower-ria',wealth:'poor',types:['dwelling-single'],role:'cottage'},
 build(){
  /* Flood-safe brick & cobalt socle (y1 = 0.82 m) with simple stone stair */
  const y1=raPlinth(10.8,10.2,.82,{
   style:'lower-ria',baseMk:'brick',midMk:'cobalt',capMk:'travertine',topMk:'paving',
   stepW:2.1,stepRun:1.7,rail:'none'
  });

  /* Front Flat-Roofed Minoan Travertine 2-Column Porch [-4.8..4.8, 1.8..4.8] */
  const gh=3.1,yRoof=y1+gh;
  for(const px of [-4.2,0,4.2]){
   const xCol=px===0?2.1:px;
   if(px!==0)raColumn(xCol,y1,4.55,gh-.16,{style:'lower-ria',mk:'travertine',capMk:'saffron',baseMk:'cobalt',r:.18,taper:'minoan',block:false});
  }
  raClassicalBalustrade(-4.6,4.68,-1.25,4.68,y1,{style:'lower-ria',mk:'travertine',trimMk:'cobalt',h:.78});
  raClassicalBalustrade(1.25,4.68,4.6,4.68,y1,{style:'lower-ria',mk:'travertine',trimMk:'cobalt',h:.78});
  raFlatTerraceRoof(0,yRoof-.16,3.3,10.0,2.9,{
   style:'lower-ria',mk:'travertine',topMk:'paving',soffitMk:'teak',trimMk:'saffron',
   parapet:'merlon',parMk:'cobalt',bandMk:'saffron',capMk:'terracotta',skip:'n'
  });

  /* Rear Compact Dark-Teak & Plaster Ruan-Thai Cottage Room [-4.8..4.8, -4.8..1.8] + Terracotta Gable */
  raWallRing(-4.8,-4.8,4.8,1.8,y1,gh,{
   style:'lower-ria',mk:'teak',socMk:'brick',dadoMk:'cobalt',postMk:'teak',cornice:false,
   holes:{
    s:[{at:0,w:1.45,h:2.1,door:true,leafMk:'teak',crownMk:'saffron',pediment:false,name:'cottage-door'},{at:-2.9,w:.95,h:1.15,y:.95},{at:2.9,w:.95,h:1.15,y:.95}],
    n:[{at:-2.4,w:.95,h:1.15,y:.95},{at:2.4,w:.95,h:1.15,y:.95}],
    e:[{at:-1.5,w:.95,h:1.15,y:.95}],
    w:[{at:-1.5,w:.95,h:1.15,y:.95}]
   }
  });
  raTieredRoof(0,yRoof,-1.5,10.2,6.8,1,{
   style:'lower-ria',mode:'gable',gableAxis:'x',mk:'terracotta',trimMk:'saffron',soffitMk:'teak',
   over:.58,tierRise:1.65
  });

  raTarget(0,y1,3.3,'cottage-minoan-porch',true);
  raTarget(0,y1,-1.5,'cottage-hearth-room',true);

  raFurnList([
   ['ria_teak_divan',-2.6,y1,-3.2,0],
   ['ria_glazed_amphora_rack',3.3,y1,-2.8,-PI/2],
   ['ria_tribute_chest',-3.1,y1,.2,PI],
   ['ria_saffron_cushion',1.2,y1,-1.6,0],
   ['ria_saffron_cushion',1.2,y1,-.4,PI]
  ]);
 }
});
