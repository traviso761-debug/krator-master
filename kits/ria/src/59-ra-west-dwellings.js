// prefix: ra
// ================================================================= LOWER RIA / WESTERN DYNASTY (RIWA-TOKA) — ALL DWELLING CLASSES (23-28)
// Complete residential spectrum across poor, middle & rich and single-family & multi-family (50/50 Near-Eastern/Classical + SE Asian):
//   23. ra_west_mudbrick_hut       — Poor single-family: glazed-brick arched flood-socle + compact Ruan-Thai fisherman/weaver hut
//   24. ra_west_courtyard_tenement — Poor multi-family: 3-storey brick-and-teak walk-up canal porter tenement around well court
//   25. ra_west_artisan_shophouse  — Middle single-family: 2-storey Classical travertine twin-arch shophouse + teak family loft
//   26. ra_west_insula_apartments  — Middle multi-family: 2-storey Roman-Rattanakosin arcaded clerk insula & shaded teak veranda
//   27. ra_west_clan_compound      — Rich single-family: walled patrician multi-pavilion clan compound, lotus court & spirit-house
//   28. ra_west_mandarin_court     — Rich multi-family: 2-storey Persepolitan-column peristyle envoy & barge-captain residence court

/* 23. Levee Flood-Socle Fisherman and Weaver Hut (poor, dwelling-single) */
defBuilding({
 key:'ra_west_mudbrick_hut',
 name:'Levee Flood-Socle Fisherman and Weaver Hut',
 seed:7123,w:14,d:14,h:9.6,budget:62000,cut:true,
 front:{x:0,z:5.9,yaw:0},
 tags:{style:'lower-ria',wealth:'poor',types:['dwelling-single'],role:'hut',job:'fishing'},
 build(){
  const y1=.72,gh=2.95,yRoof=y1+gh;
  /* Flood-proof brick & cobalt arched pier socle + front drying deck */
  raNoCut(()=>svNoWalk(()=>{
   box('cobalt',0,0,-.2,9.8,.28,9.4,P('cobalt'));
   for(const sx of [-3.8,0,3.8])for(const sz of [-3.8,.2,3.8]){
    box('brick',sx,.28,sz,.72,.44,.72,P('brick'));
   }
  }));
  raFloorSlab(0,y1,-.2,9.6,9.2,{mk:'floor',th:.12});
  raGrandStair(0,0,5.8,0,y1,4.3,2.1,{mk:'brick',sideMk:'cobalt',cheek:true});

  /* Front net-drying porch (z = 2.0..4.4) + compact plaster-and-cedar Ruan-Thai room [-4.2..4.2, -4.4..2.0] */
  for(const px of [-3.8,3.8]){
   raColumn(px,y1,4.0,gh-.15,{style:'lower-ria',mk:'cedar',baseMk:'brick',capMk:'bronze',r:.15,block:false});
  }
  svNoWalk(()=>{
   /* Bamboo/teak fish & skein drying rack on east side of porch */
   for(const rx of [2.0,3.6])cyl('teak',rx,y1+.01,3.4,.045,1.65,P('teak'),6);
   beam('teak',[1.9,y1+1.55,3.4],[3.7,y1+1.55,3.4],.035,P('teak'));
   withCloth(clothHang(.65,.06),()=>{
    quad('silk',2.8,y1+1.18,3.42,.95,.65,P('silkIndigo'),0);
   });
  });

  raWallRing(-4.2,-4.4,4.2,2.0,y1,gh,{
   style:'lower-ria',mk:'plaster',col:P('plasterCream'),socMk:'brick',dadoMk:'saffron',postMk:'cedar',
   holes:{
    s:[{at:-1.2,w:1.35,h:2.15,door:true,leafMk:'teak',crownMk:'bronze',pediment:false,name:'hut-front-door'}],
    e:[{at:-1.2,w:1.05,h:1.2,y:1.0}],
    w:[{at:-1.2,w:1.05,h:1.2,y:1.0}]
   }
  });
  raCeilingSlab(0,yRoof-.08,3.1,8.6,2.2,{mk:'cedar',trimMk:'teak'});
  raTieredRoof(0,yRoof,-.2,9.0,9.0,2,{
   style:'lower-ria',mode:'gable',gableAxis:'z',mk:'terracotta',trimMk:'teak',soffitMk:'cedar',neckMk:'brick',
   over:.55,tierRise:.95,neckH:.32
  });

  raTarget(-1.2,y1,3.1,'hut-drying-porch',true);
  raTarget(0,y1,-1.2,'fisherman-living-room',true);

  raFurnList([
   ['ria_teak_divan',-2.2,y1,-2.8,0],
   ['ria_porphyry_table',1.8,y1,-1.8,PI/2],
   ['ria_saffron_cushion',.6,y1,-1.8,PI/2],
   ['ria_glazed_amphora_rack',2.6,y1,.6,PI],
   ['ria_tribute_chest',-2.6,y1,.8,0]
  ]);
 }
});

/* 24. Three-Storey Brick-and-Teak Canal Porter Courtyard Tenement (poor, dwelling-multi) */
defBuilding({
 key:'ra_west_courtyard_tenement',
 name:'Three-Storey Brick-and-Teak Canal Porter Courtyard Tenement',
 seed:7124,w:22,d:20,h:16.8,budget:108000,cut:true,
 front:{x:0,z:8.9,yaw:0},
 tags:{style:'lower-ria',wealth:'poor',types:['dwelling-multi'],role:'tenement'},
 build(){
  const y1=.36,h1=3.3,y2=y1+h1,h2=3.15,y3=y2+h2,h3=2.95,yRoof=y3+h3;
  raFloorSlab(0,y1,0,19.4,16.8,{mk:'paving',th:.36});
  raStripWalk([0,0,9.0],[0,y1,7.8],3.2);

  /* Shared front laundry & well court with brick wellhead */
  svNoWalk(()=>{
   cyl('cobalt',-3.4,y1+.01,5.2,.82,.68,P('cobalt'),12);
   cyl('travertine',-3.4,y1+.69,5.2,.88,.14,P('travertine'),12);
   cyl('water',-3.4,y1+.48,5.2,.62,.06,P('water'),10);
  });
  raWallBlock(-3.4,y1,5.2,1.65,.95,1.65,0);
  raMerlonParapet(-9.2,8.1,-2.2,8.1,y1,{mk:'brick',bandMk:'cobalt',capMk:'saffron',block:true});
  raMerlonParapet(2.2,8.1,9.2,8.1,y1,{mk:'brick',bandMk:'cobalt',capMk:'saffron',block:true});

  /* Ground-floor brick & plaster multi-family tenement block [-9.0..9.0, -7.6..1.6] (3 ground flat doors!) */
  raWallRing(-9.0,-7.6,9.0,1.6,y1,h1,{
   style:'lower-ria',mk:'brick',socMk:'cobalt',dadoMk:'travertine',postMk:'travertine',
   holes:{
    s:[
     {at:-5.8,w:1.35,h:2.15,door:true,pediment:false,name:'tenement-g1-door'},
     {at:0,w:1.45,h:2.2,door:true,pediment:false,name:'tenement-g2-door'},
     {at:5.8,w:1.35,h:2.15,door:true,pediment:false,name:'tenement-g3-door'}
    ],
    n:[{at:-5.6,w:1.05,h:1.25,y:1.05},{at:0,w:1.05,h:1.25,y:1.05},{at:5.6,w:1.05,h:1.25,y:1.05}],
    e:[{at:-3.0,w:1.1,h:1.3,y:1.05}],
    w:[{at:-3.0,w:1.1,h:1.3,y:1.05}]
   }
  });
  for(const ix of [-3.0,3.0]){
   raWall(ix,-7.1,ix,1.1,y1,h1,{style:'lower-ria',mk:'plaster',holes:[{at:4.1,w:1.3,h:2.1,door:true,open:true}]});
  }

  /* Exterior courtyard stair climbing y1 -> y2 veranda, plus East veranda stair y2 -> y3! */
  raFloorSlab(0,y2,-2.2,18.2,11.6,{mk:'floor',th:.18});
  raCeilingSlab(0,y2-.24,-3.0,17.4,8.6,{mk:'cedar',trimMk:'teak'});
  raGrandStair(5.6,y1,6.8,5.6,y2,3.4,1.9,{mk:'brick',sideMk:'cobalt'});
  raClassicalBalustrade(-8.8,3.48,3.8,3.48,y2,{style:'lower-ria',mk:'teak',trimMk:'saffron',h:.84,block:true});

  /* Second-storey plaster & timber flats [-8.8..8.8, -7.4..1.4] */
  raWallRing(-8.8,-7.4,8.8,1.4,y2,h2,{
   style:'lower-ria',mk:'plaster',col:P('plasterCream'),socMk:'brick',dadoMk:'saffron',postMk:'teak',
   holes:{
    s:[
     {at:-5.4,w:1.3,h:2.1,door:true,leafMk:'teak',pediment:false,name:'tenement-u1-door'},
     {at:0,w:1.35,h:2.1,door:true,leafMk:'teak',pediment:false,name:'tenement-u2-door'},
     {at:5.4,w:1.3,h:2.1,door:true,leafMk:'teak',pediment:false,name:'tenement-u3-door'}
    ],
    n:[{at:-5.2,w:1.05,h:1.25,y:1.0},{at:0,w:1.05,h:1.25,y:1.0},{at:5.2,w:1.05,h:1.25,y:1.0}]
   }
  });
  for(const px of [-8.4,-4.2,0,4.2,8.4]){
   raColumn(px,y2,3.2,h2-.1,{style:'lower-ria',mk:'teak',baseMk:'brick',capMk:'bronze',r:.16,block:false});
  }

  /* Third-storey central Ruan-Thai teak garret [-5.2..5.2, -7.2..1.2] + Flat Babylonian Merlon Laundry Terraces on wings! */
  raFloorSlab(0,y3,-3.0,17.6,8.8,{mk:'floor',th:.18});
  raCeilingSlab(0,y3-.24,-2.2,17.6,11.0,{mk:'cedar',trimMk:'teak'});
  raGrandStair(-6.8,y2,3.1,-6.8,y3,1.2,1.65,{mk:'teak',sideMk:'brick',openUnder:true});

  raMerlonParapet(-8.6,1.25,-5.4,1.25,y3,{mk:'brick',bandMk:'cobalt',capMk:'saffron',block:true,skipMid:1.1});
  raMerlonParapet(5.4,1.25,8.6,1.25,y3,{mk:'brick',bandMk:'cobalt',capMk:'saffron',block:true});
  raMerlonParapet(-8.6,-7.25,-8.6,1.0,y3,{mk:'brick',bandMk:'cobalt',capMk:'saffron',block:true});
  raMerlonParapet(8.6,1.0,8.6,-7.25,y3,{mk:'brick',bandMk:'cobalt',capMk:'saffron',block:true});

  raWallRing(-5.0,-7.0,5.0,1.0,y3,h3,{
   style:'lower-ria',mk:'teak',socMk:'brick',dadoMk:'saffron',postMk:'cedar',
   holes:{
    w:[{at:-3.0,w:1.3,h:2.05,door:true,leafMk:'teak',pediment:false,name:'tenement-top-door'}],
    s:[{at:-2.2,w:1.1,h:1.25,y:.95},{at:2.2,w:1.1,h:1.25,y:.95}],
    n:[{at:0,w:1.1,h:1.25,y:.95}]
   }
  });
  raTieredRoof(0,yRoof,-3.0,10.6,8.6,2,{
   style:'lower-ria',mode:'gable',gableAxis:'x',mk:'terracotta',trimMk:'saffron',soffitMk:'cedar',neckMk:'brick',
   over:.58,tierRise:.96
  });

  raTarget(0,y1,5.2,'tenement-well-court',false);
  raTarget(0,y1,-3.0,'ground-porter-flat',true);
  raTarget(0,y2,2.4,'second-floor-veranda',true);
  raTarget(0,y2,-3.0,'second-floor-flat',true);
  raTarget(0,y3,-3.0,'third-floor-weaver-garret',true);

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

/* 25. Two-Storey Classical Travertine Shophouse and Teak Family Loft (middle, dwelling-single) */
defBuilding({
 key:'ra_west_artisan_shophouse',
 name:'Two-Storey Classical Travertine Shophouse and Teak Family Loft',
 seed:7125,w:16,d:20,h:15.2,budget:88000,cut:true,
 front:{x:0,z:8.8,yaw:0},
 tags:{style:'lower-ria',wealth:'middle',types:['dwelling-single','shop'],role:'shophouse',job:'trading'},
 build(){
  const y1=.42,gh=3.6,y2=y1+gh,uh=3.25,yRoof=y2+uh;
  raFloorSlab(0,y1,0,13.4,16.8,{mk:'paving',th:.42});
  raStripWalk([0,0,8.9],[0,y1,7.6],3.0);

  /* Ground Classical twin-arch travertine & cobalt shopfront arcade + striped silk sun-awning */
  raArcade(-5.8,7.4,5.8,7.4,y1,gh,{style:'lower-ria',bays:2,mk:'travertine',trimMk:'cobalt',pierW:.52});
  raCeilingSlab(0,y2-.12,5.9,12.2,2.6,{mk:'teak',trimMk:'gold'});
  svNoWalk(()=>{
   poly('silk',[[-5.6,y1+2.85,7.72],[5.6,y1+2.85,7.72],[5.6,y1+2.32,8.55],[-5.6,y1+2.32,8.55]],P('silkSaffron'),true);
  });

  raWallRing(-6.0,-7.6,6.0,4.4,y1,gh,{
   style:'lower-ria',mk:'plaster',col:P('plasterCream'),socMk:'cobalt',dadoMk:'saffron',postMk:'travertine',
   holes:{
    s:[
     {at:-2.6,w:1.65,h:2.35,door:true,name:'shophouse-store-door'},
     {at:2.6,w:1.35,h:1.6,y:.95,pediment:true}
    ],
    n:[{at:0,w:1.35,h:2.2,door:true,name:'shophouse-back-door'}],
    e:[{at:-1.6,w:1.2,h:1.5,y:1.05}],
    w:[{at:-1.6,w:1.2,h:1.5,y:1.05}]
   }
  });

  /* Interior stair climbing y1 -> y2 family quarters + front Classical balustraded balcony */
  const st=svStair(3.8,-5.8,y1,y2,0,{w:1.2,riser:.18,going:.27,mk:'teak',smk:'gold',col:P('teak'),scol:P('gold'),rail:'both'});
  raFloorSlab(0,y2,-.2,12.4,15.2,{mk:'floor',th:.18,hole:st});
  raCeilingSlab(-1.4,y2-.24,-1.6,8.2,11.2,{mk:'teak',trimMk:'gold'});
  raClassicalBalustrade(-5.8,7.32,5.8,7.32,y2,{style:'lower-ria',mk:'travertine',trimMk:'gold',h:.86,block:true});

  raWallRing(-5.8,-7.4,5.8,4.6,y2,uh,{
   style:'lower-ria',mk:'carvedwood',col:P('teak'),socMk:'cobalt',dadoMk:'gold',postMk:'crimson',
   holes:{
    s:[
     {at:-2.8,w:1.2,h:1.5,y:.95,pediment:true},
     {at:0,w:1.5,h:2.25,door:true,name:'shophouse-balcony-door'},
     {at:2.8,w:1.2,h:1.5,y:.95,pediment:true}
    ],
    n:[{at:-2.4,w:1.15,h:1.45,y:.95},{at:2.4,w:1.15,h:1.45,y:.95}],
    e:[{at:-1.4,w:1.15,h:1.45,y:.95}],
    w:[{at:-1.4,w:1.15,h:1.45,y:.95}]
   }
  });
  raTieredRoof(0,yRoof,-1.4,12.2,12.6,2,{
   style:'lower-ria',mode:'gable',gableAxis:'z',mk:'celadon',trimMk:'gold',soffitMk:'teak',neckMk:'crimson',
   over:.62,tierRise:1.02
  });

  raTarget(0,y1,5.9,'shophouse-arcade',true);
  raTarget(-1.4,y1,-1.6,'artisan-shop-room',true);
  raTarget(-1.2,y2,-1.4,'upper-family-salon',true);
  raTarget(0,y2,6.0,'shophouse-front-balcony',false);

  raFurnList([
   ['ria_amber_seal_desk',-2.4,y1,1.6,0],
   ['ria_glazed_amphora_rack',-4.4,y1,-2.8,PI/2],
   ['ria_tribute_chest',-4.4,y1,-5.6,PI/2],
   ['ria_teak_divan',-3.2,y2,-4.8,0],
   ['ria_porphyry_table',-1.2,y2,-1.2,0],
   ['ria_saffron_cushion',-1.2,y2,.1,PI],
   ['ria_lantern_stand',2.8,y1,5.8,0]
  ]);
 }
});

/* 26. Roman-Rattanakosin Arcaded Clerk Insula and Teak Veranda Row (middle, dwelling-multi) */
defBuilding({
 key:'ra_west_insula_apartments',
 name:'Roman-Rattanakosin Arcaded Clerk Insula and Teak Veranda Row',
 seed:7126,w:26,d:18,h:15.8,budget:112000,cut:true,
 front:{x:0,z:7.9,yaw:0},
 tags:{style:'lower-ria',wealth:'middle',types:['dwelling-multi'],role:'apartments'},
 build(){
  const y1=.48,gh=3.6,y2=y1+gh,uh=3.35,yRoof=y2+uh;
  raFloorSlab(0,y1,0,23.2,14.8,{mk:'paving',th:.48});
  raStripWalk([0,0,8.1],[0,y1,6.8],3.6);

  /* Full-width Classical Roman 6-bay travertine & cobalt ground arcade */
  raArcade(-10.8,6.5,10.8,6.5,y1,gh,{style:'lower-ria',bays:6,mk:'travertine',trimMk:'cobalt',pierW:.52});
  raCeilingSlab(0,y2-.12,5.0,22.0,2.6,{mk:'teak',trimMk:'gold'});

  /* Ground apartment row [-10.8..10.8, -6.4..3.6] with 3 separate apartment doors */
  raWallRing(-10.8,-6.4,10.8,3.6,y1,gh,{
   style:'lower-ria',mk:'plaster',col:P('plasterCream'),socMk:'cobalt',dadoMk:'saffron',postMk:'travertine',
   holes:{
    s:[
     {at:-7.2,w:1.45,h:2.25,door:true,name:'insula-west-apt-door'},
     {at:0,w:1.55,h:2.3,door:true,name:'insula-mid-apt-door'},
     {at:7.2,w:1.45,h:2.25,door:true,name:'insula-east-apt-door'}
    ],
    n:[{at:-7.0,w:1.15,h:1.45,y:1.05},{at:0,w:1.2,h:1.45,y:1.05},{at:7.0,w:1.15,h:1.45,y:1.05}],
    e:[{at:-1.4,w:1.2,h:1.45,y:1.05}],
    w:[{at:-1.4,w:1.2,h:1.45,y:1.05}]
   }
  });
  for(const ix of [-3.6,3.6]){
   raWall(ix,-5.9,ix,3.1,y1,gh,{style:'lower-ria',mk:'travertine',holes:[{at:4.5,w:1.4,h:2.2,door:true,open:true}]});
  }

  /* Interior stair in East bay climbing y1 -> y2 + continuous shaded upper Ruan-Thai teak veranda! */
  const st=svStair(8.4,-3.8,y1,y2,0,{w:1.2,riser:.18,going:.27,mk:'travertine',smk:'gold',col:P('travertine'),scol:P('gold'),rail:'both'});
  raFloorSlab(0,y2,.1,21.2,12.4,{mk:'floor',th:.18,hole:st});
  raCeilingSlab(-3.6,y2-.24,-1.4,13.8,9.2,{mk:'teak',trimMk:'gold'});

  raClassicalBalustrade(-10.5,6.22,10.5,6.22,y2,{style:'lower-ria',mk:'travertine',trimMk:'gold',h:.86,block:false});
  for(const px of [-10.4,-6.2,-2.1,2.1,6.2,10.4]){
   raColumn(px,y2,6.2,uh-.1,{style:'lower-ria',mk:'crimson',capMk:'gold',baseMk:'emerald',r:.18,block:false});
  }
  raCeilingSlab(0,yRoof-.08,5.0,21.6,2.6,{mk:'teak',trimMk:'gold'});

  raWallRing(-10.6,-6.2,10.6,3.6,y2,uh,{
   style:'lower-ria',mk:'carvedwood',col:P('teak'),socMk:'emerald',dadoMk:'gold',postMk:'crimson',
   holes:{
    s:[
     {at:-7.0,w:1.4,h:2.2,door:true,name:'insula-upper-west-door'},
     {at:0,w:1.45,h:2.2,door:true,name:'insula-upper-mid-door'},
     {at:5.2,w:1.4,h:2.2,door:true,name:'insula-upper-east-door'}
    ],
    n:[{at:-6.8,w:1.15,h:1.45,y:.95},{at:0,w:1.2,h:1.45,y:.95},{at:6.8,w:1.15,h:1.45,y:.95}]
   }
  });

  /* 50/50 Crown: Flat Classical Balustrade End Terraces + Central 3-Tier Celadon & Gold Roof */
  for(const sx of [-7.9,7.9]){
   raFlatTerraceRoof(sx,yRoof,.1,5.6,13.0,{
    style:'lower-ria',mk:'travertine',topMk:'mosaic',soffitMk:'teak',trimMk:'gold',parapet:'balustrade',skip:sx<0?'e':'w'
   });
  }
  raTieredRoof(0,yRoof+.18,.1,10.8,13.2,3,{
   style:'lower-ria',mode:'gable',gableAxis:'x',mk:'celadon',trimMk:'gold',soffitMk:'teak',neckMk:'crimson',
   over:.6,tierRise:.98
  });

  raTarget(0,y1,5.0,'insula-ground-arcade',true);
  raTarget(-7.2,y1,-1.4,'ground-west-flat',true);
  raTarget(0,y1,-1.4,'ground-center-flat',true);
  raTarget(0,y2,5.0,'upper-shaded-veranda',true);
  raTarget(-2.4,y2,-1.4,'upper-clerk-suite',true);

  raFurnList([
   ['ria_teak_divan',-8.2,y1,-4.2,0],
   ['ria_porphyry_table',0,y1,-2.4,0],
   ['ria_amber_seal_desk',6.4,y1,-3.8,0],
   ['ria_teak_divan',-7.6,y2,-4.0,0],
   ['ria_porphyry_table',-1.2,y2,-2.2,0],
   ['ria_saffron_cushion',-1.2,y2,-.9,PI],
   ['ria_silk_screen',3.2,y2,-4.0,-.2],
   ['ria_lantern_stand',-4.2,y1,5.0,0],
   ['ria_lantern_stand',4.2,y1,5.0,0]
  ]);
 }
});

/* 27. Walled Patrician Extended-Clan Compound and Spirit-House (rich, dwelling-single) */
defBuilding({
 key:'ra_west_clan_compound',
 name:'Walled Patrician Extended-Clan Compound and Spirit-House',
 seed:7127,w:30,d:26,h:18.6,budget:126000,cut:true,
 front:{x:0,z:11.9,yaw:0},
 tags:{style:'lower-ria',wealth:'rich',types:['dwelling-single'],role:'clan-compound'},
 build(){
  const y1=.55,gh=3.8,y2=y1+gh,uh=3.4,yRoof=y2+uh;
  raFloorSlab(0,y1,0,26.4,22.4,{mk:'paving',th:.55});
  raGrandStair(0,0,12.0,0,y1,10.6,3.2,{mk:'travertine',sideMk:'cobalt',rail:'naga',railOpts:{scale:.72}});

  /* Front Babylonian Glazed-Lapis Ishtar Clan Gate + Crenellated Compound Walls */
  raIshtarPortal(0,y1,10.4,0,2.3,2.75,{buttW:1.15,d:1.0,hTot:4.5,mk:'cobalt',bandMk:'saffron',accMk:'emerald'});
  raDoor(0,y1,10.4,0,2.2,2.6,{style:'lower-ria',pediment:false,name:'clan-compound-gate'});
  for(const s of [-1,1]){
   raWall(s<0?-12.8:2.4,10.4,s<0?-2.4:12.8,10.4,y1,2.6,{style:'lower-ria',mk:'plaster',socMk:'cobalt',dadoMk:'saffron',cornice:false});
   raMerlonParapet(s<0?-12.8:2.4,10.4,s<0?-2.4:12.8,10.4,y1+2.6,{mk:'cobalt',bandMk:'saffron',capMk:'gold'});
  }
  raWall(12.8,10.1,12.8,-10.6,y1,2.6,{style:'lower-ria',mk:'plaster',socMk:'cobalt',dadoMk:'saffron',cornice:false});
  raWall(-12.8,-10.6,-12.8,10.1,y1,2.6,{style:'lower-ria',mk:'plaster',socMk:'cobalt',dadoMk:'saffron',cornice:false});

  /* Central Lotus Impluvium Basin + East Ancestor Spirit-House + West Servants' Kitchen Wing */
  raWaterCourt(0,3.8,6.2,4.4,y1+.3,.45,{style:'lower-ria',curbMk:'travertine',trimMk:'emerald',lotus:5});
  raTopiaryUrn(-4.6,y1,6.8,.8,false);
  raTopiaryUrn(4.6,y1,6.8,.8,false);

  /* East Private Gilded Spirit-House Pavilion (svNoWalk elevated miniature Prasat shrine!) */
  svNoWalk(()=>{
   box('cobalt',8.8,y1+.01,5.2,2.8,.85,2.8,P('cobalt'));
   box('travertine',8.8,y1+.86,5.2,2.4,.65,2.4,P('travertine'));
  });
  raWallBlock(8.8,y1,5.2,2.6,2.8,2.6,0);
  raPrasatSpire(8.8,y1+1.51,5.2,2.2,5.2,{style:'lower-ria',mk:'gold',accMk:'emerald',vault:false});

  /* West Retainers & Kitchen Wing [-11.8..-6.2, 1.4..8.4] */
  raWallRing(-11.8,1.4,-6.2,8.4,y1,3.3,{
   style:'lower-ria',mk:'plaster',col:P('plasterCream'),socMk:'cobalt',dadoMk:'saffron',postMk:'travertine',
   holes:{e:[{at:4.9,w:1.45,h:2.2,door:true,name:'clan-kitchen-door'}],s:[{at:-9.0,w:1.1,h:1.35,y:1.0}]}
  });
  raFlatTerraceRoof(-9.0,y1+3.3,4.9,5.8,7.2,{
   style:'lower-ria',mk:'travertine',topMk:'mosaic',soffitMk:'teak',trimMk:'gold',parapet:'merlon',parMk:'cobalt',bandMk:'saffron'
  });

  /* Rear Two-Storey Patrician Classical-Colonnade & Ruan-Thai Main Manor [-11.6..11.6, -10.2..-1.2] */
  raColonnade(-10.8,-.2,10.8,-.2,y1,gh,{style:'lower-ria',n:7,skipMid:1.8,mk:'travertine',friezeMk:'cobalt',r:.22,block:false});
  raCeilingSlab(0,y2-.12,-.7,22.2,1.2,{mk:'teak',trimMk:'gold'});
  raWallRing(-11.6,-10.2,11.6,-1.2,y1,gh,{
   style:'lower-ria',mk:'plaster',col:P('plasterCream'),socMk:'cobalt',dadoMk:'saffron',postMk:'travertine',
   holes:{
    s:[
     {at:-6.6,w:1.4,h:2.25,door:true,name:'manor-west-parlour-door'},
     {at:0,w:1.95,h:2.55,door:true,name:'manor-central-hall-door'},
     {at:6.6,w:1.4,h:2.25,door:true,name:'manor-east-study-door'}
    ],
    n:[{at:-6.4,w:1.2,h:1.5,y:1.05},{at:0,w:1.4,h:1.6,y:1.05,pediment:true},{at:6.4,w:1.2,h:1.5,y:1.05}]
   }
  });
  const st=svStair(8.6,-8.6,y1,y2,0,{w:1.25,riser:.18,going:.27,mk:'travertine',smk:'gold',col:P('travertine'),scol:P('gold'),rail:'both'});
  raFloorSlab(0,y2,-5.7,22.6,8.6,{mk:'floor',th:.18,hole:st});
  raCeilingSlab(-2.2,y2-.24,-5.7,17.6,8.2,{mk:'teak',trimMk:'gold'});

  raWallRing(-8.4,-9.8,8.4,-1.6,y2,uh,{
   style:'lower-ria',mk:'carvedwood',col:P('teak'),socMk:'emerald',dadoMk:'gold',postMk:'crimson',
   holes:{
    s:[{at:-4.4,w:1.2,h:1.5,y:.95,pediment:true},{at:0,w:1.6,h:2.25,door:true,name:'manor-upper-terrace-door'},{at:4.4,w:1.2,h:1.5,y:.95,pediment:true}],
    w:[{at:-5.7,w:1.35,h:2.15,door:true,name:'manor-west-roof-door'}],
    e:[{at:-5.7,w:1.35,h:2.15,door:true,name:'manor-east-roof-door'}]
   }
  });
  for(const sx of [-10.0,10.0]){
   raClassicalBalustrade(sx-1.4,-1.5,sx+1.4,-1.5,y2,{style:'lower-ria',mk:'travertine',trimMk:'gold',block:true});
   raClassicalBalustrade(sx+1.4,-9.9,sx-1.4,-9.9,y2,{style:'lower-ria',mk:'travertine',trimMk:'gold',block:true});
  }
  raTieredRoof(0,yRoof,-5.7,17.4,8.8,3,{
   style:'lower-ria',mode:'gable',gableAxis:'x',mk:'emerald',trimMk:'gold',soffitMk:'teak',neckMk:'crimson',
   over:.65,tierRise:1.05,spire:true,spireH:3.6
  });

  raTarget(0,y1,7.8,'clan-lotus-courtyard',false);
  raTarget(-9.0,y1,4.9,'retainer-kitchen-wing',true);
  raTarget(0,y1,-5.7,'clan-reception-hall',true);
  raTarget(0,y2,-5.7,'patrician-upper-chamber',true);

  raFurnList([
   ['ria_porphyry_table',0,y1,-6.2,0],
   ['ria_saffron_cushion',-1.4,y1,-6.2,PI/2],
   ['ria_saffron_cushion',1.4,y1,-6.2,-PI/2],
   ['ria_teak_divan',-7.4,y1,-7.2,0],
   ['ria_amber_seal_desk',5.4,y1,-5.8,PI],
   ['ria_glazed_amphora_rack',-10.2,y1,3.6,PI/2],
   ['ria_teak_divan',-4.6,y2,-6.8,0],
   ['ria_silk_screen',-2.2,y2,-6.8,.2],
   ['ria_uktena_brazier',-3.4,y1,1.2,0],
   ['ria_uktena_brazier',3.4,y1,1.2,0]
  ]);
 }
});

/* 28. Two-Storey Persepolitan Peristyle Envoy and Barge-Captain Residence Court (rich, dwelling-multi) */
defBuilding({
 key:'ra_west_mandarin_court',
 name:'Two-Storey Persepolitan Peristyle Envoy and Barge-Captain Residence Court',
 seed:7128,w:28,d:24,h:19.2,budget:124000,cut:true,
 front:{x:0,z:10.9,yaw:0},
 tags:{style:'lower-ria',wealth:'rich',types:['dwelling-multi'],role:'noble-apartments'},
 build(){
  const y1=.75,gh=3.85,y2=y1+gh,uh=3.45,yRoof=y2+uh;
  raPlinth(24.4,19.6,y1,{
   style:'lower-ria',baseMk:'cobalt',midMk:'emerald',capMk:'travertine',topMk:'mosaic',
   stepW:3.6,stepRun:1.8,rail:'naga',railOpts:{scale:.75}
  });

  /* Front Persepolitan double-protome colonnade + open mosaic fountain patio */
  raColonnade(-10.8,8.8,10.8,8.8,y1,gh,{
   style:'lower-ria',n:7,skipMid:1.8,mk:'travertine',friezeMk:'cobalt',r:.24,capital:'protome'
  });
  raWaterCourt(0,4.8,5.4,3.4,y1+.3,.42,{style:'lower-ria',curbMk:'alabaster',trimMk:'cobalt',lotus:4});

  /* U-shaped multi-suite residence wings: West [-11.4..-6.2], East [6.2..11.4], North [-11.4..11.4, -9.0..1.2] */
  raWallRing(-11.4,-9.0,11.4,1.2,y1,gh,{
   style:'lower-ria',mk:'plaster',col:P('plasterCream'),socMk:'cobalt',dadoMk:'saffron',postMk:'travertine',
   holes:{
    s:[
     {at:-7.8,w:1.5,h:2.35,door:true,name:'envoy-west-suite-door'},
     {at:0,w:1.85,h:2.5,door:true,name:'envoy-central-foyer-door'},
     {at:7.8,w:1.5,h:2.35,door:true,name:'envoy-east-suite-door'}
    ],
    n:[{at:-7.4,w:1.25,h:1.55,y:1.05,pediment:true},{at:0,w:1.4,h:1.65,y:1.05,pediment:true},{at:7.4,w:1.25,h:1.55,y:1.05,pediment:true}],
    e:[{at:-3.9,w:1.25,h:1.55,y:1.05,pediment:true}],
    w:[{at:-3.9,w:1.25,h:1.55,y:1.05,pediment:true}]
   }
  });
  const st=svStair(8.8,-7.4,y1,y2,0,{w:1.25,riser:.18,going:.27,mk:'travertine',smk:'gold',col:P('travertine'),scol:P('gold'),rail:'both'});
  raFloorSlab(0,y2,-3.9,22.2,9.8,{mk:'mosaic',th:.18,hole:st});
  raCeilingSlab(-2.2,y2-.24,-3.9,17.4,9.4,{mk:'teak',trimMk:'gold'});
  raCeilingSlab(0,y2-.12,8.1,22.4,1.6,{mk:'teak',trimMk:'gold'});

  /* Second-storey noble apartment suites [-11.0..11.0, -8.8..1.0] */
  raWallRing(-11.0,-8.8,11.0,1.0,y2,uh,{
   style:'lower-ria',mk:'travertine',socMk:'cobalt',dadoMk:'gold',postMk:'cobalt',
   holes:{
    s:[
     {at:-7.4,w:1.25,h:1.55,y:.95,pediment:true},
     {at:-3.6,w:1.25,h:1.55,y:.95,pediment:true},
     {at:0,w:1.65,h:2.3,door:true,name:'envoy-upper-loggia-door'},
     {at:3.6,w:1.25,h:1.55,y:.95,pediment:true},
     {at:7.4,w:1.25,h:1.55,y:.95,pediment:true}
    ],
    n:[{at:-6.8,w:1.2,h:1.5,y:.95},{at:0,w:1.35,h:1.6,y:.95,pediment:true},{at:6.8,w:1.2,h:1.5,y:.95}]
   }
  });
  raFloorSlab(0,y2,2.1,6.4,2.0,{mk:'travertine',th:.16});
  raClassicalBalustrade(-3.0,3.02,3.0,3.02,y2,{style:'lower-ria',mk:'travertine',trimMk:'gold',block:true});

  /* Flat Babylonian Merlon Roof-Gardens on side suites + Central 3-Tier Gilt-and-Emerald Prasat Crown */
  for(const sx of [-8.0,8.0]){
   raFlatTerraceRoof(sx,yRoof,-3.9,6.0,9.8,{
    style:'lower-ria',mk:'cobalt',topMk:'mosaic',soffitMk:'teak',trimMk:'gold',
    parapet:'merlon',parMk:'cobalt',bandMk:'saffron',capMk:'gold',skip:sx<0?'e':'w',garden:true
   });
  }
  raTieredRoof(0,yRoof+.2,-3.9,10.2,10.0,3,{
   style:'lower-ria',mode:'gable',gableAxis:'z',mk:'giltroof',trimMk:'gold',soffitMk:'teak',neckMk:'crimson',
   over:.64,tierRise:1.05,spire:true,spireH:4.0
  });

  raTarget(0,y1,8.1,'persepolitan-front-portico',true);
  raTarget(0,y1,2.4,'fountain-residence-court',false);
  raTarget(-7.4,y1,-3.9,'west-captain-apartment',true);
  raTarget(0,y1,-3.9,'central-envoy-foyer',true);
  raTarget(-2.4,y2,-3.9,'upper-mandarin-suite',true);

  raFurnList([
   ['ria_teak_divan',-8.2,y1,-6.4,0],
   ['ria_porphyry_table',0,y1,-4.8,0],
   ['ria_saffron_cushion',-1.4,y1,-4.8,PI/2],
   ['ria_saffron_cushion',1.4,y1,-4.8,-PI/2],
   ['ria_amber_seal_desk',-6.8,y2,-5.6,0],
   ['ria_teak_divan',2.2,y2,-6.2,0],
   ['ria_silk_screen',-.4,y2,-6.2,.2],
   ['ria_offering_basin',-4.4,y1,4.8,0],
   ['ria_offering_basin',4.4,y1,4.8,0],
   ['ria_lantern_stand',-3.0,y1,7.8,0],
   ['ria_lantern_stand',3.0,y1,7.8,0]
  ]);
 }
});
