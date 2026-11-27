// prefix: mc
// ================================================================= BONDUWE BONDED STRONG-VAULTS — BULLION, GRAIN, ARCHIVE & BAZAAR (8320..8323)
// Sworn Neutral Claw-and-Salt Compact Strong-Vaults & Exchanges (style: 'bonduwe'):
//   8320. mc_grand_bullion_vault   — Dipu-Bonduwe Bonded Kulanewa Silver & Amber-Ledger Strong-Vault
//   8321. mc_famine_grain_silo     — Ten-Year Dry-Loess State & Treaty Famine-Grain Vault-Complex
//   8322. mc_amber_seal_scriptorium— Safe-Conduct Tally-Hall & Seismic Way-Map Archive
//   8323. mc_covered_bazaar_trench — Sunken Wind-Sheltered Steppe Arcade & Assay Market-Trench

/* 20. Dipu-Bonduwe Bonded Kulanewa Silver & Amber-Ledger Strong-Vault */
defBuilding({
 key:'mc_grand_bullion_vault',
 name:'Dipu-Bonduwe Bonded Kulanewa Silver and Amber-Ledger Strong-Vault',
 seed:8320,w:28,d:26,h:10.8,budget:134000,cut:true,
 front:{x:0,z:12.0,yaw:0},
 tags:{style:'bonduwe',wealth:'rich',types:['civic','market','infrastructure'],role:'bonded-vault',job:'warehousing'},
 build(){
  const yC=.42,hB=4.12,yB=yC+hB;
  mcBasePad(0,-.6,24.8,21.6,yC,{style:'bonduwe',mk:'paving'});
  mcEntryRamp(0,0,11.9,0,yC,9.9,3.2,{style:'bonduwe'});

  /* Deep Sealed Rear Kulanewa Raha-Silver & Ampala-Kiri Strongroom [-12.1..12.1, -11.2..-5.4] */
  mcVaultWing(-12.1,-11.2,12.1,-5.4,yC,hB,{
   style:'bonduwe',mk:'dolomite',vault:true,floorMk:'paving',rims:'ns',
   holes:{
    s:[
     {at:-5.4,w:1.95,h:2.35,door:true,sealed:true,leafMk:'iron',name:'bullion-west-strongroom-door'},
     {at:0,w:2.25,h:2.48,door:true,sealed:true,leafMk:'iron',name:'bullion-main-strongroom-door'},
     {at:5.4,w:1.95,h:2.35,door:true,sealed:true,leafMk:'iron',name:'bullion-east-strongroom-door'}
    ]
   }
  });

  /* West Ria Patrician Reserve Wing & East Kulanewa Kaarum Assay Registry Wing */
  mcVaultWing(-12.1,-5.0,-6.6,4.4,yC,hB,{
   style:'bonduwe',vault:true,floorMk:'paving',rims:'we',
   holes:{e:[{at:-.4,w:1.9,h:2.32,door:true,sealed:true,leafMk:'iron',name:'bullion-ria-vault-door'}]}
  });
  mcVaultWing(6.6,-5.0,12.1,4.4,yC,hB,{
   style:'bonduwe',floorMk:'floor',rims:'we',gapW:1.5,
   holes:{
    w:[{at:2.0,w:1.95,h:2.32,door:true,name:'bullion-assay-hall-door'}],
    e:[{at:-.6,w:1.3,h:1.25,y:1.05}]
   }
  });

  /* Flanking South Bastion Guard Wings beside the 3.2 m entry trench */
  mcVaultWing(-12.1,4.8,-2.8,9.8,yC,hB,{
   style:'bonduwe',mk:'dolomite',floorMk:'floor',rims:'ns',
   holes:{n:[{at:-4.7,w:1.75,h:2.26,door:true,name:'bullion-sw-warden-door'}]}
  });
  mcVaultWing(2.8,4.8,12.1,9.8,yC,hB,{
   style:'bonduwe',mk:'dolomite',floorMk:'floor',rims:'ns',
   holes:{n:[{at:4.7,w:1.75,h:2.26,door:true,name:'bullion-se-warden-door'}]}
  });

  mcTerraceLink(-9.3,-5.2,yB,3.4,.32);
  mcTerraceLink(9.3,-5.2,yB,3.4,.32);
  mcTerraceLink(-9.3,4.6,yB,3.4,.32);
  mcTerraceLink(9.3,4.6,yB,3.4,.32);
  mcCourtyardStair(5.1,2.6,-3.2,yC,yB,6.6,{style:'bonduwe'});

  /* Monumental Steelyard Assay Frame, Bullion Sled & Seismic Way-Stone Watch-Beacon */
  mcSteelyardAssay(-1.6,yC,-.8,0,2.5);
  mcCaravanSled(-1.8,yC,2.8,0,{load:'bullion'});
  mcSeismicStone(0,yB,-8.3,4.2,{big:true});
  mcVentHood(-8.2,yB,-8.3,0,{smoke:false});
  mcVentHood(8.2,yB,-8.3,0,{smoke:true});
  mcBanner(-3.4,yB,9.2,0,3.6,'flag');
  mcBanner(3.4,yB,9.2,0,3.6,'flagSalt');

  mcTarget(0,yC,2.4,'bonded-bullion-assay-court',false);
  mcTarget(0,yC,-8.3,'kulanewa-raha-strongroom',true);
  mcTarget(-9.3,yC,-.3,'ria-patrician-reserve-vault',true);
  mcTarget(9.3,yC,-.3,'ampala-kiri-ledger-hall',true);
  mcTarget(-7.4,yC,7.3,'sw-vault-warden-guardroom',true);
  mcTarget(7.4,yC,7.3,'se-vault-warden-guardroom',true);
  mcTarget(-4.2,yB,-8.3,'strong-vault-roof-parapet',false);

  mcFurnList([
   ['molu_bonduwe_bullion_chest',-6.4,yC,-8.6,0],
   ['molu_bonduwe_bullion_chest',-2.2,yC,-8.6,0],
   ['molu_bonduwe_bullion_chest',2.2,yC,-8.6,0],
   ['molu_bonduwe_bullion_chest',6.4,yC,-8.6,0],
   ['molu_tapetum_oil_cresset',0,yC,-6.8,0],
   ['molu_bonduwe_bullion_chest',-9.3,yC,-2.2,PI/2],
   ['molu_bonduwe_bullion_chest',-9.3,yC,1.6,PI/2],
   ['molu_amber_tally_rack',9.3,yC,-2.4,-PI/2],
   ['molu_bypass_assay_scale',9.3,yC,1.4,-PI/2],
   ['molu_claw_shoe_rack',-7.4,yC,7.4,0],
   ['molu_hearth_brazier',7.4,yC,7.4,0]
  ]);
 }
});

/* 21. Ten-Year Dry-Loess State & Treaty Famine-Grain Vault-Complex */
defBuilding({
 key:'mc_famine_grain_silo',
 name:'Ten-Year Dry-Loess State and Treaty Famine-Grain Vault-Complex',
 seed:8321,w:26,d:24,h:9.6,budget:122000,cut:true,
 front:{x:0,z:11.0,yaw:0},
 tags:{style:'bonduwe',wealth:'rich',types:['industry','infrastructure'],role:'granary',job:'warehousing'},
 build(){
  const yC=.4,hB=3.96,yB=yC+hB;
  mcBasePad(0,-.5,22.8,19.8,yC,{style:'bonduwe',mk:'paving'});
  mcEntryRamp(0,0,10.9,0,yC,9.1,3.1,{style:'bonduwe'});

  /* Sealed +14 C Dry-Loess Ten-Year Famine Grain Gallery [-11.0..11.0, -10.2..-4.6] */
  mcVaultWing(-11.0,-10.2,11.0,-4.6,yC,hB,{
   style:'bonduwe',vault:true,floorMk:'paving',rims:'ns',
   holes:{
    s:[
     {at:-4.8,w:1.95,h:2.32,door:true,sealed:true,leafMk:'iron',name:'silo-west-grain-door'},
     {at:0,w:2.1,h:2.4,door:true,sealed:true,leafMk:'iron',name:'silo-center-grain-door'},
     {at:4.8,w:1.95,h:2.32,door:true,sealed:true,leafMk:'iron',name:'silo-east-grain-door'}
    ]
   }
  });

  /* West Sealed Pulse/Seed-Corn Drift & East Tally-Measure Hall */
  mcVaultWing(-11.0,-4.2,-5.8,7.8,yC,hB,{
   style:'bonduwe',vault:true,floorMk:'paving',rims:'we',
   holes:{e:[{at:1.8,w:1.9,h:2.3,door:true,sealed:true,leafMk:'iron',name:'silo-seed-vault-door'}]}
  });
  mcVaultWing(5.8,-4.2,11.0,7.8,yC,hB,{
   style:'bonduwe',floorMk:'floor',rims:'we',gapW:1.5,
   holes:{w:[{at:3.8,w:1.9,h:2.3,door:true,name:'silo-measure-hall-door'}]}
  });

  mcTerraceLink(-8.4,-4.4,yB,3.0,.32);
  mcTerraceLink(8.4,-4.4,yB,3.0,.32);
  mcCourtyardStair(4.3,4.2,-1.8,yC,yB,5.8,{style:'bonduwe'});

  mcCaravanSled(-1.8,yC,2.2,0,{load:'grain'});
  mcSteelyardAssay(-1.6,yC,-1.4,0,2.2);
  mcVentHood(-5.6,yB,-7.4,0,{smoke:false});
  mcVentHood(5.6,yB,-7.4,0,{smoke:false});
  mcDryingMats(0,yB,-7.4,4,1);
  mcDryingMats(-8.4,yB,1.8,1,3);

  mcTarget(.6,yC,4.8,'grain-sled-unloading-pit',false);
  mcTarget(0,yC,-7.4,'ten-year-famine-grain-vault',true);
  mcTarget(-8.4,yC,1.8,'treaty-seed-corn-vault',true);
  mcTarget(8.4,yC,1.8,'grain-measure-tally-hall',true);
  mcTarget(0,yB,-7.4,'silo-sunning-terrace',false);

  mcFurnList([
   ['molu_cucuteni_grain_pithos',-7.2,yC,-7.6,0],
   ['molu_cucuteni_grain_pithos',-5.2,yC,-7.6,0],
   ['molu_cucuteni_grain_pithos',-3.2,yC,-7.6,0],
   ['molu_cucuteni_grain_pithos',3.2,yC,-7.6,0],
   ['molu_cucuteni_grain_pithos',5.2,yC,-7.6,0],
   ['molu_cucuteni_grain_pithos',7.2,yC,-7.6,0],
   ['molu_cucuteni_grain_pithos',-8.4,yC,-.6,0],
   ['molu_cucuteni_grain_pithos',-8.4,yC,3.8,0],
   ['molu_bypass_assay_scale',8.4,yC,-.4,-PI/2],
   ['molu_amber_tally_rack',8.4,yC,4.2,-PI/2]
  ]);
 }
});

/* 22. Safe-Conduct Tally-Hall & Seismic Way-Map Archive */
defBuilding({
 key:'mc_amber_seal_scriptorium',
 name:'Safe-Conduct Tally-Hall and Seismic Way-Map Archive',
 seed:8322,w:24,d:20,h:9.2,budget:112000,cut:true,
 front:{x:0,z:9.2,yaw:0},
 tags:{style:'bonduwe',wealth:'rich',types:['civic','religious'],role:'scriptorium',job:'scribing'},
 build(){
  const yC=.38,hB=3.88,yB=yC+hB;
  mcBasePad(0,-.3,21.0,16.8,yC,{style:'bonduwe',mk:'paving'});
  mcEntryRamp(0,0,9.1,0,yC,7.4,2.8,{style:'bonduwe'});

  /* Rear Safe-Conduct Amber-Seal & Way-Map Hall [-10.2..10.2, -8.5..-2.9] */
  mcVaultWing(-10.2,-8.5,10.2,-2.9,yC,hB,{
   style:'bonduwe',mk:'dolomite',floorMk:'floor',rims:'ns',
   holes:{
    s:[
     {at:-4.4,w:1.85,h:2.28,door:true,name:'scriptorium-west-door'},
     {at:0,w:2.1,h:2.4,door:true,leafMk:'darkcedar',name:'scriptorium-main-door'},
     {at:4.4,w:1.85,h:2.28,door:true,name:'scriptorium-east-door'}
    ],
    n:[{at:-3.6,w:1.35,h:1.3,y:1.0},{at:3.6,w:1.35,h:1.3,y:1.0}]
   }
  });

  /* West Sealed Charter Vault & East Cartographer/Envoy Room */
  mcVaultWing(-10.2,-2.5,-5.4,6.4,yC,hB,{
   style:'bonduwe',vault:true,floorMk:'paving',rims:'we',
   holes:{e:[{at:1.8,w:1.8,h:2.26,door:true,sealed:true,leafMk:'iron',name:'scriptorium-charter-door'}]}
  });
  mcVaultWing(5.4,-2.5,10.2,6.4,yC,hB,{
   style:'bonduwe',floorMk:'floor',rims:'we',gapW:1.5,
   holes:{w:[{at:3.2,w:1.8,h:2.26,door:true,name:'scriptorium-envoy-door'}]}
  });

  mcTerraceLink(-7.8,-2.7,yB,2.8,.32);
  mcTerraceLink(7.8,-2.7,yB,2.8,.32);
  mcCourtyardStair(3.8,4.2,-1.4,yC,yB,5.4,{style:'bonduwe'});

  mcSeismicStone(-1.6,yC,1.6,2.9,{big:true});
  mcVentHood(-5.2,yB,-5.7,0,{smoke:false});
  mcVentHood(5.2,yB,-5.7,0,{smoke:true});
  mcBanner(-6.8,yB,5.8,0,3.4,'flag');
  mcBanner(6.8,yB,5.8,0,3.4,'flagSalt');

  mcTarget(.8,yC,3.8,'safe-conduct-seal-court',false);
  mcTarget(0,yC,-5.7,'amber-seal-scriptorium-hall',true);
  mcTarget(-7.8,yC,2.0,'treaty-charter-strongroom',true);
  mcTarget(7.8,yC,2.0,'way-map-reading-vault',true);
  mcTarget(0,yB,-5.7,'scriptorium-terrace',false);

  mcFurnList([
   ['molu_amber_tally_rack',-5.8,yC,-6.8,0],
   ['molu_seismic_drum_table',0,yC,-5.6,0],
   ['molu_amber_tally_rack',5.8,yC,-6.8,0],
   ['molu_halite_compact_altar',0,yC,-7.4,0],
   ['molu_bonduwe_bullion_chest',-7.8,yC,0,PI/2],
   ['molu_amber_tally_rack',-7.8,yC,3.8,PI/2],
   ['molu_molefelt_divan',7.8,yC,0,-PI/2],
   ['molu_tapetum_oil_cresset',7.8,yC,4.2,0]
  ]);
 }
});

/* 23. Sunken Wind-Sheltered Steppe Arcade & Assay Market-Trench */
defBuilding({
 key:'mc_covered_bazaar_trench',
 name:'Sunken Wind-Sheltered Steppe Arcade and Assay Market-Trench',
 seed:8323,w:26,d:22,h:8.8,budget:118000,cut:true,
 front:{x:0,z:10.1,yaw:0},
 tags:{style:'bonduwe',wealth:'middle',types:['market','shop'],role:'bazaar',job:'trading'},
 build(){
  const yC=.38,hB=3.86,yB=yC+hB;
  mcBasePad(0,-.4,22.8,18.4,yC,{style:'bonduwe',mk:'paving'});
  mcEntryRamp(0,0,10.0,0,yC,8.2,3.2,{style:'bonduwe'});

  /* Rear Silk, Superconductor & Spice Exchange Arcade [-11.0..11.0, -9.4..-4.0] */
  mcVaultWing(-11.0,-9.4,11.0,-4.0,yC,hB,{
   style:'bonduwe',floorMk:'floor',rims:'ns',
   holes:{
    s:[
     {at:-5.4,w:1.95,h:2.32,door:true,name:'bazaar-silk-stall-door'},
     {at:0,w:2.1,h:2.38,door:true,name:'bazaar-central-assay-door'},
     {at:5.4,w:1.95,h:2.32,door:true,name:'bazaar-halite-stall-door'}
    ]
   }
  });

  /* West & East Sunken Merchant-Vault Stalls */
  mcVaultWing(-11.0,-3.6,-5.8,7.0,yC,hB,{
   style:'bonduwe',floorMk:'floor',rims:'we',
   holes:{
    e:[{at:-.8,w:1.85,h:2.26,door:true,name:'bazaar-west-n-door'},{at:3.6,w:1.85,h:2.26,door:true,name:'bazaar-west-s-door'}]
   }
  });
  mcVaultWing(5.8,-3.6,11.0,7.0,yC,hB,{
   style:'bonduwe',floorMk:'floor',rims:'we',gapW:1.5,
   holes:{
    w:[{at:3.6,w:1.85,h:2.26,door:true,name:'bazaar-east-stall-door'}]
   }
  });

  mcTerraceLink(-8.4,-3.8,yB,3.0,.32);
  mcTerraceLink(8.4,-3.8,yB,3.0,.32);
  mcCourtyardStair(4.3,4.2,-1.6,yC,yB,5.8,{style:'bonduwe'});

  /* Wind-sheltered cedar colonnade porch & silk sled in central market trench */
  mcArcadeColonnade(-5.2,-3.4,2.8,-3.4,yC,3.1,{style:'bonduwe',n:4});
  mcCaravanSled(-2.0,yC,2.2,0,{load:'silk'});
  mcVentHood(-5.4,yB,-6.7,0,{smoke:false});
  mcVentHood(5.4,yB,-6.7,0,{smoke:false});
  mcBanner(-3.2,yB,6.6,0,3.3,'tapestry');
  mcBanner(3.2,yB,6.6,0,3.3,'flag');

  mcTarget(.8,yC,3.8,'sunken-market-trench',false);
  mcTarget(0,yC,-6.7,'north-silk-and-assay-arcade',true);
  mcTarget(-8.4,yC,1.7,'west-merchant-vault-stalls',true);
  mcTarget(8.4,yC,1.7,'east-merchant-vault-stalls',true);
  mcTarget(0,yB,-6.7,'bazaar-parapet-walk',false);

  mcFurnList([
   ['molu_bypass_assay_scale',0,yC,-6.4,0],
   ['molu_bonduwe_bullion_chest',-5.6,yC,-7.2,0],
   ['molu_cucuteni_grain_pithos',5.6,yC,-7.2,0],
   ['molu_molefelt_divan',-8.4,yC,-.8,PI/2],
   ['molu_amber_tally_rack',-8.4,yC,3.8,PI/2],
   ['molu_bypass_assay_scale',8.4,yC,-.4,-PI/2],
   ['molu_hearth_brazier',8.4,yC,4.2,0]
  ]);
 }
});
