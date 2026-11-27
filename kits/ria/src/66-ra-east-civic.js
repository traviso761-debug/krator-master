// prefix: ra
// ================================================================= UPPER RIA / EASTERN DYNASTY (LIWA-TOGA) — CIVIC, AGORA, INN, FORT & BOATHOUSE (9-13)
// 50/50 Balanced Fusion Grammar:
//   9.  ra_east_stoa_agora       — Fluted dolomite & green-palm-capital Classical market stoa + flat balustrade roof + Lanna slate gable
//   10. ra_east_karst_thermae    — Porphyry-and-gold Pantheon rotunda warm-spring bathhouse + Classical pedimented porch
//   11. ra_east_pilgrim_serai    — Pompeian-Minoan tapered-porphyry courtyard inn + two-storey Shan-Lanna indigo-slate tea-hall
//   12. ra_east_cavetto_watchfort — Flat-topped Egyptian battered red-porphyry cavetto bastion + lodestone obelisks + Angkor Prang
//   13. ra_east_skiff_boathouse  — Classical dolomite round-arch water-slip + flat balustrade quay + Lanna shipwright loft

/* 9. Classical Palm-Column Agora Stoa and Lanna Slate Market Hall */
defBuilding({
 key:'ra_east_stoa_agora',
 name:'Classical Palm-Column Agora Stoa and Lanna Slate Market Hall',
 seed:7209,w:26,d:18,h:16.8,budget:108000,cut:true,
 front:{x:0,z:8.1,yaw:0},
 tags:{style:'upper-ria',wealth:'middle',types:['market','shop'],role:'agora',job:'trading'},
 build(){
  const y1=raPlinth(22.6,14.2,.65,{
   style:'upper-ria',baseMk:'porphyry',midMk:'dolomite',capMk:'dolomite',topMk:'paving',
   stepW:3.8,stepRun:1.5,rail:'hongsa',railOpts:{scale:.7}
  });

  /* Full-width Classical Fluted Dolomite & Porphyry Colonnade with Egyptian Green-Palm Capitals */
  const gh=4.25,yRoof=y1+gh;
  raColonnade(-10.4,6.4,10.4,6.4,y1,gh,{
   style:'upper-ria',n:8,skipMid:1.8,mk:'dolomite',altMk:'porphyry',r:.25,capital:'palm'
  });
  raCeilingSlab(0,yRoof-.12,4.8,21.4,3.0,{mk:'dolomite',trimMk:'silver'});
  raClassicalPediment(0,yRoof+.04,5.7,0,7.2,1.45,1.8,{style:'upper-ria',mk:'dolomite',tymMk:'porphyry'});

  /* Rear Agora Shop & Bourse Hall [-10.4..10.4, -6.2..3.2] */
  raWallRing(-10.4,-6.2,10.4,3.2,y1,gh-.24,{
   style:'upper-ria',mk:'dolomite',socMk:'porphyry',dadoMk:'carve',postMk:'porphyry',
   holes:{
    s:[
     {at:-6.6,w:1.55,h:2.3,door:true,crownMk:'silver',name:'stoa-west-shop-door'},
     {at:0,w:2.1,h:2.55,door:true,crownMk:'silver',name:'stoa-central-door'},
     {at:6.6,w:1.55,h:2.3,door:true,crownMk:'silver',name:'stoa-east-shop-door'}
    ],
    n:[{at:-6.4,w:1.2,h:1.5,y:1.05},{at:0,w:1.4,h:1.6,y:1.05},{at:6.4,w:1.2,h:1.5,y:1.05}],
    e:[{at:-1.5,w:1.3,h:1.55,y:1.05,pediment:true}],
    w:[{at:-1.5,w:1.3,h:1.55,y:1.05,pediment:true}]
   }
  });

  /* 50/50 CROWN: Flat Classical Balustrade Stone Stoa Side Roofs + Central 3-Tier Lanna Indigo-Slate Market Crown */
  raFlatTerraceRoof(-7.3,yRoof,-.4,6.4,13.6,{
   style:'upper-ria',mk:'dolomite',topMk:'paving',soffitMk:'dolomite',trimMk:'silver',parapet:'balustrade',skip:'e'
  });
  raFlatTerraceRoof(7.3,yRoof,-.4,6.4,13.6,{
   style:'upper-ria',mk:'dolomite',topMk:'paving',soffitMk:'dolomite',trimMk:'silver',parapet:'balustrade',skip:'w'
  });
  raTieredRoof(0,yRoof,-1.5,8.2,9.8,3,{
   style:'upper-ria',mode:'gable',gableAxis:'z',mk:'indigoslate',trimMk:'silver',soffitMk:'cedar',neckMk:'copper',
   over:.64,tierRise:1.12,neckH:.38,stepIn:.76,spire:true,spireH:3.4
  });

  raTarget(0,y1,4.8,'palm-stoa-promenade',true);
  raTarget(0,y1,-1.5,'agora-central-hall',true);
  raTarget(-7.0,y1,-1.5,'west-lapidary-stall',true);
  raTarget(7.0,y1,-1.5,'east-brocade-stall',true);

  raFurnList([
   ['ria_porphyry_table',-5.8,y1,-1.8,0],
   ['ria_porphyry_table',5.8,y1,-1.8,0],
   ['ria_glazed_amphora_rack',-8.8,y1,-3.4,PI/2],
   ['ria_glazed_amphora_rack',8.8,y1,-3.4,-PI/2],
   ['ria_amber_seal_desk',0,y1,-3.8,0],
   ['ria_tribute_chest',-8.8,y1,.8,PI/2],
   ['ria_tribute_chest',8.8,y1,.8,-PI/2],
   ['ria_lantern_stand',-3.0,y1,4.8,0],
   ['ria_lantern_stand',3.0,y1,4.8,0]
  ]);
 }
});

/* 10. Porphyry Pantheon Warm-Spring Thermae and Hongsa Bathhouse */
defBuilding({
 key:'ra_east_karst_thermae',
 name:'Porphyry Pantheon Warm-Spring Thermae and Hongsa Bathhouse',
 seed:7210,w:24,d:22,h:17.8,budget:112000,cut:true,
 front:{x:0,z:10.1,yaw:0},
 tags:{style:'upper-ria',wealth:'rich',types:['civic'],role:'bathhouse',job:'healing'},
 build(){
  /* Twin steaming karst warm-spring forecourt basins + Silver-Bronze Hongsa entrance stair */
  raWaterCourt(-7.2,7.6,6.2,4.2,.36,.54,{style:'upper-ria',curbMk:'dolomite',trimMk:'porphyry',lotus:4});
  raWaterCourt(7.2,7.6,6.2,4.2,.36,.54,{style:'upper-ria',curbMk:'dolomite',trimMk:'porphyry',lotus:4});
  smokeAt(-7.2,.45,7.6,{r:.22,kind:'smoke'});
  smokeAt(7.2,.45,7.6,{r:.22,kind:'smoke'});

  const y1=raPlinth(20.4,13.6,.95,{
   style:'upper-ria',baseMk:'porphyry',midMk:'dolomite',capMk:'dolomite',topMk:'mosaic',steps:false
  });
  raGrandStair(0,0,10.2,0,y1,6.9,3.4,{mk:'dolomite',sideMk:'porphyry',rail:'hongsa',railOpts:{scale:.82}});

  /* Classical Hexastyle Dolomite & Porphyry Pedimented Porch */
  const gh=4.2,yRoof=y1+gh;
  raColonnade(-3.2,6.2,3.2,6.2,y1,3.6,{style:'upper-ria',n:4,skipMid:1.35,mk:'dolomite',altMk:'porphyry',r:.23,block:false});
  raCeilingSlab(0,y1+3.62,5.1,6.6,2.4,{mk:'dolomite',trimMk:'silver'});
  raClassicalPediment(0,y1+3.64,5.2,0,7.0,1.45,2.4,{style:'upper-ria',mk:'dolomite',tymMk:'porphyry'});

  /* Bathhouse Shell [-9.6..9.6, -6.2..4.0] + Sunken Porphyry-and-Alabaster Warm Spring Pool */
  raWallRing(-9.6,-6.2,9.6,4.0,y1,gh,{
   style:'upper-ria',mk:'dolomite',socMk:'porphyry',dadoMk:'carve',postMk:'porphyry',
   holes:{
    s:[
     {at:-6.4,w:1.25,h:1.55,y:1.05,pediment:true,crownMk:'silver'},
     {at:0,w:2.05,h:2.55,door:true,crownMk:'silver',name:'karst-thermae-door'},
     {at:6.4,w:1.25,h:1.55,y:1.05,pediment:true,crownMk:'silver'}
    ],
    n:[{at:-6.0,w:1.2,h:1.5,y:1.05},{at:0,w:1.4,h:1.65,y:1.05},{at:6.0,w:1.2,h:1.5,y:1.05}],
    e:[{at:-1.1,w:1.3,h:1.55,y:1.05,pediment:true}],
    w:[{at:-1.1,w:1.3,h:1.55,y:1.05,pediment:true}]
   }
  });
  raWaterCourt(0,-1.8,4.6,3.8,y1+.28,.4,{style:'upper-ria',curbMk:'alabaster',trimMk:'porphyry',lotus:3});

  /* Flat Balustrade Tepidarium Wings + Central Red-Porphyry & Gold Stepped Roman Pantheon Rotunda Dome */
  raFlatTerraceRoof(-6.8,yRoof,-1.1,5.8,10.4,{
   style:'upper-ria',mk:'dolomite',topMk:'paving',soffitMk:'dolomite',trimMk:'silver',parapet:'balustrade',skip:'e'
  });
  raFlatTerraceRoof(6.8,yRoof,-1.1,5.8,10.4,{
   style:'upper-ria',mk:'dolomite',topMk:'paving',soffitMk:'dolomite',trimMk:'silver',parapet:'balustrade',skip:'w'
  });
  raCeilingSlab(0,yRoof+.02,-1.1,8.0,10.2,{mk:'dolomite',trimMk:'silver'});
  const yDome=raPantheonRotundaDome(0,yRoof+.18,-1.1,4.6,8.0,{
   style:'upper-ria',drumMk:'dolomite',mk:'porphyry',ribMk:'gold',soffitMk:'alabaster'
  });
  raPrasatSpire(0,yDome-.45,-1.1,1.6,2.8,{style:'upper-ria',mk:'silver',accMk:'gold',vault:false});

  raTarget(0,y1,5.0,'thermae-pediment-porch',true);
  raTarget(0,y1,2.2,'spring-rotunda-walk',true);
  raTarget(-6.8,y1,-1.1,'west-karst-tepidarium',true);
  raTarget(6.8,y1,-1.1,'east-karst-caldarium',true);

  raFurnList([
   ['ria_offering_basin',-3.4,y1,1.8,0],
   ['ria_offering_basin',3.4,y1,1.8,0],
   ['ria_teak_divan',-7.2,y1,-3.4,0],
   ['ria_teak_divan',7.2,y1,-3.4,0],
   ['ria_silk_screen',-5.2,y1,-3.8,.2],
   ['ria_silk_screen',5.2,y1,-3.8,-.2],
   ['ria_saffron_cushion',-7.2,y1,.8,PI],
   ['ria_saffron_cushion',7.2,y1,.8,PI],
   ['ria_lantern_stand',-3.2,y1,-4.2,0],
   ['ria_lantern_stand',3.2,y1,-4.2,0]
  ]);
 }
});

/* 11. Pompeian-Minoan Porphyry Courtyard Inn and Lanna Tea-Hall */
defBuilding({
 key:'ra_east_pilgrim_serai',
 name:'Pompeian-Minoan Porphyry Courtyard Inn and Lanna Tea-Hall',
 seed:7211,w:24,d:22,h:15.8,budget:112000,cut:true,
 front:{x:0,z:10.0,yaw:0},
 tags:{style:'upper-ria',wealth:'middle',types:['tavern','inn'],role:'serai',job:'brewing'},
 build(){
  const y1=.42,gh=3.6,y2=y1+gh;
  raFloorSlab(0,y1,0,21.6,19.2,{mk:'paving',th:.42});
  raStripWalk([0,0,10.2],[0,y1,8.8],3.4);

  /* Pompeian-Minoan Tapered Red-Porphyry Courtyard Peristyle + Central Lotus Impluvium */
  raWaterCourt(0,3.2,4.4,3.6,y1+.26,.4,{style:'upper-ria',curbMk:'dolomite',trimMk:'porphyry',lotus:3});
  raClassicalBalustrade(-10.4,9.1,-2.2,9.1,y1,{style:'upper-ria',mk:'dolomite',trimMk:'porphyry',block:true});
  raClassicalBalustrade(2.2,9.1,10.4,9.1,y1,{style:'upper-ria',mk:'dolomite',trimMk:'porphyry',block:true});
  raColonnade(-2.4,9.1,2.4,9.1,y1,3.3,{style:'upper-ria',n:4,skipMid:1.2,mk:'porphyry',r:.21,taper:'minoan',block:false});
  raClassicalPediment(0,y1+3.32,9.1,0,5.4,1.2,1.2,{style:'upper-ria',mk:'dolomite',tymMk:'porphyry'});

  /* West & East Flat-Roofed Minoan Tapered-Porphyry Pilgrim Cloister Wings */
  for(const s of [-1,1]){
   const wx=s*8.2;
   for(const cz of [.2,3.4,6.6]){
    raColumn(wx-s*2.2,y1,cz,gh-.16,{style:'upper-ria',mk:'porphyry',capMk:'gold',baseMk:'dolomite',r:.2,taper:'minoan',block:false});
   }
   raWallRing(wx-2.0,-.8,wx+2.0,8.2,y1,gh,{
    style:'upper-ria',mk:'dolomite',socMk:'porphyry',dadoMk:'carve',postMk:'porphyry',
    holes:s<0
     ?{e:[{at:3.7,w:1.5,h:2.2,door:true,crownMk:'silver',name:'pilgrim-west-cell-door'},{at:1.0,w:1.05,h:1.3,y:.95},{at:6.4,w:1.05,h:1.3,y:.95}]}
     :{w:[{at:3.7,w:1.5,h:2.2,door:true,crownMk:'silver',name:'pilgrim-east-cell-door'},{at:1.0,w:1.05,h:1.3,y:.95},{at:6.4,w:1.05,h:1.3,y:.95}]}
   });
   raFlatTerraceRoof(wx,y2,3.7,4.5,9.4,{
    style:'upper-ria',mk:'dolomite',topMk:'mosaic',soffitMk:'cedar',trimMk:'silver',parapet:'balustrade'
   });
  }

  /* Rear Two-Storey Shan-Lanna Indigo-Slate Tea-Hall [-10.2..10.2, -8.8..-1.6] */
  raWallRing(-10.2,-8.8,10.2,-1.6,y1,gh,{
   style:'upper-ria',mk:'dolomite',socMk:'porphyry',dadoMk:'carve',postMk:'porphyry',
   holes:{
    s:[
     {at:-5.2,w:1.45,h:2.2,door:true,crownMk:'silver',name:'teahall-west-door'},
     {at:0,w:1.95,h:2.4,door:true,crownMk:'silver',name:'teahall-main-door'},
     {at:5.2,w:1.2,h:1.45,y:1.0}
    ],
    n:[{at:-5.4,w:1.2,h:1.45,y:1.0},{at:0,w:1.3,h:1.5,y:1.0},{at:5.4,w:1.2,h:1.45,y:1.0}]
   }
  });
  const st=svStair(8.2,-5.2,y1,y2,-PI/2,{w:1.1,riser:.18,going:.26,mk:'cedar',smk:'porphyry',col:P('cedar'),scol:P('porphyry'),rail:'both'});
  raFloorSlab(0,y2,-5.1,20.0,7.2,{mk:'floor',th:.18,hole:st});
  raCeilingSlab(-2.0,y2-.24,-5.2,14.8,6.6,{mk:'cedar',trimMk:'silver'});

  const uh=3.3,yRoof=y2+uh;
  raWallRing(-9.8,-8.6,9.8,-2.4,y2,uh,{
   style:'upper-ria',mk:'cedar',socMk:'porphyry',dadoMk:'carvedwood',postMk:'teak',cornice:false,
   holes:{
    s:[{at:-4.8,w:1.15,h:1.4,y:.95},{at:0,w:1.6,h:2.15,door:true,leafMk:'teak',crownMk:'silver',name:'teahall-balcony-door'},{at:4.8,w:1.15,h:1.4,y:.95}],
    n:[{at:-4.8,w:1.15,h:1.4,y:.95},{at:4.8,w:1.15,h:1.4,y:.95}]
   }
  });
  raClassicalBalustrade(-9.8,-1.65,9.8,-1.65,y2,{style:'upper-ria',mk:'dolomite',trimMk:'porphyry'});
  raTieredRoof(0,yRoof,-5.5,20.0,6.6,2,{
   style:'upper-ria',mode:'gable',gableAxis:'x',mk:'indigoslate',trimMk:'silver',soffitMk:'cedar',neckMk:'copper',
   over:.65,tierRise:1.32,neckH:.38,stepIn:.76
  });

  raTarget(0,y1,6.4,'minoan-impluvium-court',false);
  raTarget(-8.2,y1,3.7,'west-pilgrim-cell',true);
  raTarget(8.2,y1,3.7,'east-pilgrim-cell',true);
  raTarget(-1.6,y1,-5.2,'shan-lanna-teahall',true);
  raTarget(-1.6,y2,-5.4,'upper-pilgrim-gallery',true);

  raFurnList([
   ['ria_porphyry_table',-3.4,y1,-5.2,0],
   ['ria_porphyry_table',2.0,y1,-5.2,0],
   ['ria_saffron_cushion',-3.4,y1,-4.0,PI],
   ['ria_saffron_cushion',2.0,y1,-4.0,PI],
   ['ria_glazed_amphora_rack',-8.2,y1,6.2,0],
   ['ria_tribute_chest',8.2,y1,6.2,0],
   ['ria_teak_divan',-6.2,y2,-7.0,0],
   ['ria_teak_divan',-.8,y2,-7.0,0],
   ['ria_lantern_stand',-3.4,y1,-.2,0],
   ['ria_lantern_stand',3.4,y1,-.2,0]
  ]);
 }
});

/* 12. Egyptian Cavetto Pylon Bastion and Angkor Prang Watchfort */
defBuilding({
 key:'ra_east_cavetto_watchfort',
 name:'Egyptian Cavetto Pylon Bastion and Angkor Prang Watchfort',
 seed:7212,w:22,d:19,h:19.8,budget:105000,cut:true,
 front:{x:0,z:8.6,yaw:0},
 tags:{style:'upper-ria',wealth:'middle',types:['military'],role:'guardhouse'},
 build(){
  const y1=raPlinth(18.0,14.2,.85,{
   style:'upper-ria',baseMk:'porphyry',midMk:'dolomite',capMk:'dolomite',topMk:'paving',
   stepW:3.2,stepRun:1.8,rail:'hongsa',railOpts:{scale:.7}
  });
  for(const sx of [-7.8,7.8]){
   raLodestoneObelisk(sx,y1,5.8,7.2,{w:.68});
  }

  /* Flat-Topped Battered Egyptian Red-Porphyry & Dolomite Bastion Walls + Deep Flaring Cavetto Cornice */
  const gh=4.15,y2=y1+gh;
  for(const sx of [-7.8,7.8])for(const sz of [-5.6,3.6]){
   raBatteredPylon(sx,sz,2.3,2.3,y1,gh+.42,{style:'upper-ria',mk:'porphyry',bandMk:'dolomite',relMk:'alabaster'});
  }
  raColonnade(-2.6,5.3,2.6,5.3,y1,gh-.2,{style:'upper-ria',n:4,skipMid:1.2,mk:'dolomite',baseMk:'porphyry',capMk:'gold',r:.24,capital:'palm',block:false});
  raCeilingSlab(0,y2-.16,4.55,6.2,1.6,{mk:'dolomite',trimMk:'silver'});

  raWallRing(-8.0,-5.8,8.0,3.8,y1,gh,{
   style:'upper-ria',mk:'porphyry',socMk:'dolomite',dadoMk:'carve',postMk:'dolomite',
   holes:{
    s:[
     {at:-4.4,w:1.1,h:1.4,y:1.1},
     {at:0,w:1.95,h:2.45,door:true,crownMk:'silver',name:'watchfort-gate'},
     {at:4.4,w:1.1,h:1.4,y:1.1}
    ],
    n:[{at:-4.4,w:1.1,h:1.4,y:1.1},{at:4.4,w:1.1,h:1.4,y:1.1}],
    e:[{at:-1.0,w:1.45,h:2.2,door:true,crownMk:'silver',name:'watchfort-side-door'}],
    w:[{at:-1.0,w:1.1,h:1.4,y:1.1}]
   }
  });
  const st=svStair(4.8,-4.2,y1,y2,-PI/2,{w:1.1,riser:.18,going:.26,mk:'dolomite',smk:'porphyry',col:P('dolomite'),scol:P('porphyry'),rail:'both'});
  raFloorSlab(0,y2,-1.0,16.0,9.6,{mk:'paving',th:.18,hole:st});
  raCeilingSlab(-2.6,y2-.24,-1.0,10.0,8.8,{mk:'dolomite',trimMk:'silver'});
  raCavettoCornice(0,y2-.08,-1.0,16.6,10.2,.44,{mk:'dolomite',bandMk:'gold'});
  raClassicalBalustrade(-7.8,3.68,7.8,3.68,y2+.38,{style:'upper-ria',mk:'dolomite',trimMk:'porphyry',block:true});
  raClassicalBalustrade(7.8,-5.68,-7.8,-5.68,y2+.38,{style:'upper-ria',mk:'dolomite',trimMk:'porphyry',block:true});
  raClassicalBalustrade(-7.82,-5.5,-7.82,3.5,y2+.38,{style:'upper-ria',mk:'dolomite',trimMk:'porphyry',block:true});
  raClassicalBalustrade(7.82,3.5,7.82,-5.5,y2+.38,{style:'upper-ria',mk:'dolomite',trimMk:'porphyry',block:true});

  /* Central Angkor-Bagan Stepped Stone Prang Watch-Turret over Upper Sanctum */
  const ph=3.2;
  raWallRing(-2.8,-3.8,2.8,1.8,y2,ph,{
   style:'upper-ria',mk:'dolomite',socMk:'porphyry',dadoMk:'carve',postMk:'porphyry',
   holes:{s:[{at:0,w:1.5,h:2.15,door:true,crownMk:'silver',name:'prang-watch-door'}]}
  });
  raCeilingSlab(0,y2+ph+.02,-1.0,5.2,5.2,{mk:'dolomite',trimMk:'gold'});
  raPrang(0,y2+ph+.12,-1.0,5.8,11.0,{style:'upper-ria',mk:'dolomite',bandMk:'porphyry',trimMk:'silver',vault:true,openFront:true});

  raTarget(0,y1,4.55,'palm-gate-porch',true);
  raTarget(-1.8,y1,-1.0,'bastion-guardroom',true);
  raTarget(0,y2,-1.0,'prang-watch-chamber',true);
  raTarget(-5.4,y2,1.4,'cavetto-rampart-deck',false);

  raFurnList([
   ['ria_amber_seal_desk',-4.6,y1,1.4,0],
   ['ria_lodestone_compass',0,y2,-2.2,0],
   ['ria_teak_divan',-5.4,y1,-3.8,0],
   ['ria_tribute_chest',-6.2,y1,-.8,PI/2],
   ['ria_tribute_chest',2.4,y1,1.6,PI],
   ['ria_hongsa_lectern',-1.4,y1,-3.6,.2],
   ['ria_lantern_stand',-2.4,y1,2.6,0],
   ['ria_lantern_stand',2.4,y1,2.6,0]
  ]);
 }
});

/* 13. Classical Dolomite Water-Slip Quay and Lanna Skiff Boathouse */
defBuilding({
 key:'ra_east_skiff_boathouse',
 name:'Classical Dolomite Water-Slip Quay and Lanna Skiff Boathouse',
 seed:7213,w:22,d:20,h:15.0,budget:98000,cut:true,
 front:{x:-4.4,z:9.0,yaw:0},
 tags:{style:'upper-ria',wealth:'middle',types:['infrastructure','industry'],role:'boathouse',job:'shipwrighting'},
 build(){
  /* East Navigable Stone-Curbed Water-Slip [x = 2.0..9.2] + Live core/water Stream + Moored Hongsa Skiff */
  raWaterCourt(5.6,0,7.2,17.6,.34,.72,{style:'upper-ria',curbMk:'dolomite',trimMk:'porphyry',lotus:2,waterMesh:false});
  if(CURREC&&!PLACE_DRY){
   const wPts=[[5.6,.1,-8.2],[5.6,.1,0],[5.6,.1,8.2]].map(q=>{
    const v=new THREE.Vector3(q[0],q[1],q[2]).applyMatrix4(CM);
    return [v.x,v.z,v.y];
   });
   CURREC.river={name:'karst-skiff-slip',pts:wPts,width:6.2,speed:.36};
  }
  /* Cradled cedar & silver-Hongsa ceremonial river skiff in the slipway (svNoWalk) */
  svNoWalk(()=>{
   box('cedar',5.6,.16,-.6,1.65,.42,6.4,P('cedar'));
   box('teak',5.6,.58,-.6,1.82,.14,6.8,P('teak'));
   box('copper',5.6,.72,-.8,1.35,.95,2.6,P('copper'));
   raHongsaSculpt(5.6,.72,2.7,0,.78);
  });

  /* West Dressed Dolomite & Porphyry Quay (y1 = 0.65 m) */
  const y1=.65,gh=3.85,yRoof=y1+gh;
  raFloorSlab(-3.8,y1,0,11.2,17.6,{mk:'paving',th:.65});
  raGrandStair(-4.4,0,9.2,-4.4,y1,7.8,2.8,{mk:'dolomite',sideMk:'porphyry',rail:'hongsa',railOpts:{scale:.68}});

  /* Classical Dolomite Round-Arch Slipway Vault spanning OVER the north half of the water-slip! */
  raArcade(2.0,-7.8,2.0,7.8,y1,gh,{style:'upper-ria',bays:4,mk:'dolomite',trimMk:'porphyry',pierW:.52,block:false});
  for(const pz of [-6.8,-2.2,2.4]){
   raColumn(9.0,.34,pz,yRoof-.34,{style:'upper-ria',mk:'porphyry',capMk:'silver',baseMk:'dolomite',r:.24,block:false});
  }
  raArcade(2.0,2.4,9.0,2.4,y1,gh,{style:'upper-ria',bays:1,mk:'dolomite',trimMk:'porphyry',pierW:.56,block:false});
  raArcade(2.0,-6.8,9.0,-6.8,y1,gh,{style:'upper-ria',bays:1,mk:'dolomite',trimMk:'porphyry',pierW:.56,block:false});
  raFlatTerraceRoof(5.5,yRoof,-2.2,7.4,9.6,{
   style:'upper-ria',mk:'dolomite',topMk:'paving',soffitMk:'cedar',trimMk:'silver',parapet:'balustrade'
  });

  /* West Shipwright & Cordage Hall [-9.0..1.6, -7.8..6.8] + 2-Tier Lanna Indigo-Slate & Copper Gable */
  raWallRing(-9.0,-7.8,1.6,6.8,y1,gh,{
   style:'upper-ria',mk:'dolomite',socMk:'porphyry',dadoMk:'carve',postMk:'porphyry',
   holes:{
    s:[{at:-4.4,w:1.85,h:2.35,door:true,crownMk:'silver',name:'boathouse-front-door'},{at:-7.2,w:1.1,h:1.4,y:1.0}],
    e:[{at:-2.2,w:1.8,h:2.35,door:true,open:true},{at:3.2,w:1.5,h:2.2,door:true,crownMk:'silver',name:'quay-slip-door'}],
    n:[{at:-5.8,w:1.15,h:1.4,y:1.0},{at:-1.6,w:1.15,h:1.4,y:1.0}],
    w:[{at:-3.2,w:1.15,h:1.4,y:1.0},{at:2.2,w:1.15,h:1.4,y:1.0}]
   }
  });
  raTieredRoof(-3.7,yRoof,-.5,11.0,15.0,2,{
   style:'upper-ria',mode:'gable',gableAxis:'z',mk:'indigoslate',trimMk:'silver',soffitMk:'cedar',neckMk:'copper',
   over:.65,tierRise:1.35,neckH:.38,stepIn:.76
  });

  raTarget(-3.8,y1,3.2,'shipwright-joinery-hall',true);
  raTarget(-3.8,y1,-3.8,'cordage-and-oar-loft',true);

  raFurnList([
   ['ria_porphyry_table',-4.2,y1,1.6,0],
   ['ria_lodestone_compass',-1.4,y1,4.2,0],
   ['ria_glazed_amphora_rack',-7.4,y1,-4.2,PI/2],
   ['ria_glazed_amphora_rack',-7.4,y1,1.2,PI/2],
   ['ria_tribute_chest',-3.8,y1,-5.8,0],
   ['ria_tribute_chest',-.4,y1,-5.8,0],
   ['ria_lantern_stand',-1.4,y1,-.8,0]
  ]);
 }
});
