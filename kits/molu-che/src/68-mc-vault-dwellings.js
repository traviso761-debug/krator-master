// prefix: mc
// ================================================================= BONDUWE BONDED STRONG-VAULTS — ALL 6 RESIDENTIAL CLASSES (8333..8338)
// Complete (poor | middle | rich) x (dwelling-single | dwelling-multi) matrix for Bonded Vault & Bypass Guilds:
//   8333. mc_vault_factor_manor  — (rich, dwelling-single) Bonded-Vault Warden's Stone-Arch Dikengyuan
//   8334. mc_treaty_envoy_court  — (rich, dwelling-multi)  Resident Kulanewa & Ria Factor Guest-Vaults
//   8335. mc_assay_shophouse_pit — (middle, dwelling-single) Street-Rim Exchange Booth & Sunken Yaodong Home
//   8336. mc_vault_clerk_terraces— (middle, dwelling-multi)  Two-Tier Bonded Tally-Clerk Sunken Courtyard
//   8337. mc_trail_warden_dugout — (poor, dwelling-single) Way-Stone Signal Dugout & Mule-Sled Shelter
//   8338. mc_caravan_crew_bunks  — (poor, dwelling-multi)  Bypass Sled-Driver & Porter Sunken Hostel-Pit

/* 33. Rich Single-Family: Bonded-Vault Warden's Stone-Arch Dikengyuan */
defBuilding({
 key:'mc_vault_factor_manor',
 name:'Bonded-Vault Warden Stone-Arch Dikengyuan Manor',
 seed:8333,w:26,d:24,h:9.4,budget:122000,cut:true,
 front:{x:0,z:11.0,yaw:0},
 tags:{style:'bonduwe',wealth:'rich',types:['dwelling-single'],role:'warden-manor'},
 build(){
  const yC=.4,hB=3.94,yB=yC+hB;
  mcBasePad(0,-.5,22.8,19.8,yC,{style:'bonduwe',mk:'paving'});
  mcEntryRamp(0,0,10.9,0,yC,9.1,2.9,{style:'bonduwe'});

  /* Dressed Dolomite Warden Reception & Private Strongroom Wing [-11.0..11.0, -10.2..-4.8] */
  mcVaultWing(-11.0,-10.2,11.0,-4.8,yC,hB,{
   style:'bonduwe',mk:'dolomite',floorMk:'floor',rims:'ns',
   holes:{
    s:[
     {at:-4.8,w:1.85,h:2.3,door:true,sealed:true,leafMk:'iron',name:'warden-private-safe-door'},
     {at:0,w:2.1,h:2.42,door:true,leafMk:'darkcedar',name:'warden-hall-door'},
     {at:4.8,w:1.85,h:2.3,door:true,name:'warden-chamber-door'}
    ],
    n:[{at:4.2,w:1.35,h:1.28,y:1.0}]
   }
  });

  /* West Banquet/Kitchen Vault & East Seal-Cabinet Wing */
  mcVaultWing(-11.0,-4.4,-5.8,7.8,yC,hB,{
   style:'bonduwe',floorMk:'floor',rims:'we',
   holes:{e:[{at:1.6,w:1.85,h:2.28,door:true,name:'warden-kitchen-door'}]}
  });
  mcVaultWing(5.8,-4.4,11.0,7.8,yC,hB,{
   style:'bonduwe',floorMk:'floor',rims:'we',gapW:1.5,
   holes:{w:[{at:3.8,w:1.85,h:2.28,door:true,name:'warden-cabinet-door'}]}
  });

  mcTerraceLink(-8.4,-4.6,yB,3.0,.32);
  mcTerraceLink(8.4,-4.6,yB,3.0,.32);
  mcCourtyardStair(4.3,4.2,-2.0,yC,yB,5.8,{style:'bonduwe'});

  mcArcadeColonnade(-5.2,-4.3,2.8,-4.3,yC,3.1,{style:'bonduwe',n:4});
  mcCisternWell(-1.8,yC,1.2,{r:.86});
  mcSeismicStone(0,yB,-7.5,3.2,{big:false});
  mcVentHood(-5.4,yB,-7.5,0,{smoke:true});
  mcBanner(-2.6,yB,7.2,0,3.4,'flag');

  mcTarget(.6,yC,4.4,'warden-courtyard',false);
  mcTarget(0,yC,-7.5,'warden-reception-and-safe',true);
  mcTarget(-8.4,yC,1.7,'warden-banquet-vault',true);
  mcTarget(8.4,yC,1.7,'seal-cabinet-study',true);
  mcTarget(3.0,yB,-7.5,'warden-stone-terrace',false);

  mcFurnList([
   ['molu_bonduwe_bullion_chest',-5.6,yC,-7.8,0],
   ['molu_molefelt_divan',0,yC,-7.8,0],
   ['molu_kang_hearth_bed',5.4,yC,-7.6,0],
   ['molu_hearth_brazier',0,yC,-6.0,0],
   ['molu_curd_press_table',-8.4,yC,-.6,PI/2],
   ['molu_cucuteni_grain_pithos',-8.4,yC,3.8,0],
   ['molu_amber_tally_rack',8.4,yC,-.6,-PI/2],
   ['molu_bypass_assay_scale',8.4,yC,3.6,-PI/2]
  ]);
 }
});

/* 34. Rich Multi-Family: Resident Kulanewa & Ria Factor Guest-Vaults */
defBuilding({
 key:'mc_treaty_envoy_court',
 name:'Resident Kulanewa and Ria Factor Guest-Vaults',
 seed:8334,w:26,d:24,h:9.2,budget:122000,cut:true,
 front:{x:0,z:11.0,yaw:0},
 tags:{style:'bonduwe',wealth:'rich',types:['dwelling-multi'],role:'envoy-court'},
 build(){
  const yC=.4,hB=3.9,yB=yC+hB;
  mcBasePad(0,-.5,22.8,19.8,yC,{style:'bonduwe',mk:'paving'});
  mcEntryRamp(0,0,10.9,0,yC,9.1,3.0,{style:'bonduwe'});

  /* Neutral Compact Truce-Hall at Rear [-11.0..11.0, -10.2..-5.0] */
  mcVaultWing(-11.0,-10.2,11.0,-5.0,yC,hB,{
   style:'bonduwe',mk:'dolomite',floorMk:'floor',rims:'ns',
   holes:{
    s:[
     {at:-4.8,w:1.85,h:2.3,door:true,name:'envoy-truce-west-door'},
     {at:0,w:2.1,h:2.4,door:true,name:'envoy-truce-center-door'},
     {at:4.8,w:1.85,h:2.3,door:true,name:'envoy-truce-east-door'}
    ]
   }
  });

  /* West Kulanewa Kaarum Factor Suite & East Ria Court Factor Suite (strictly separate across neutral court!) */
  mcVaultWing(-11.0,-4.6,-5.8,4.0,yC,hB,{
   style:'bonduwe',floorMk:'floor',rims:'we',
   holes:{e:[{at:-.3,w:1.9,h:2.3,door:true,name:'envoy-kulanewa-suite-door'}]}
  });
  mcVaultWing(5.8,-4.6,11.0,4.0,yC,hB,{
   style:'bonduwe',floorMk:'floor',rims:'we',gapW:1.5,
   holes:{w:[{at:1.8,w:1.9,h:2.3,door:true,name:'envoy-ria-suite-door'}]}
  });

  /* South Retainer Suites */
  mcVaultWing(-11.0,4.4,-2.2,9.0,yC,hB,{
   style:'bonduwe',floorMk:'floor',rims:'ns',
   holes:{n:[{at:-4.0,w:1.75,h:2.24,door:true,name:'envoy-sw-retainer-door'}]}
  });
  mcVaultWing(2.2,4.4,11.0,9.0,yC,hB,{
   style:'bonduwe',floorMk:'floor',rims:'ns',
   holes:{n:[{at:4.0,w:1.75,h:2.24,door:true,name:'envoy-se-retainer-door'}]}
  });

  mcTerraceLink(-8.4,-4.8,yB,3.0,.32);
  mcTerraceLink(8.4,-4.8,yB,3.0,.32);
  mcTerraceLink(-8.4,4.2,yB,3.0,.32);
  mcTerraceLink(8.4,4.2,yB,3.0,.32);
  mcCourtyardStair(4.3,2.2,-3.2,yC,yB,5.8,{style:'bonduwe'});

  /* Neutral Salt-Compact Way-Stone in center of truce courtyard */
  mcSeismicStone(-1.2,yC,-.4,2.8,{big:true});
  mcBanner(-8.4,yB,-.3,0,3.4,'flag');
  mcBanner(8.4,yB,-.3,0,3.4,'tapestryIndigo');

  mcTarget(.6,yC,2.2,'neutral-truce-courtyard',false);
  mcTarget(0,yC,-7.6,'salt-compact-banquet-hall',true);
  mcTarget(-8.4,yC,-.3,'kulanewa-factor-suite',true);
  mcTarget(8.4,yC,-.3,'ria-patrician-envoy-suite',true);
  mcTarget(-6.6,yC,6.7,'west-clerk-suite',true);
  mcTarget(6.6,yC,6.7,'east-clerk-suite',true);
  mcTarget(0,yB,-7.6,'envoy-court-terrace',false);

  mcFurnList([
   ['molu_halite_compact_altar',0,yC,-8.2,0],
   ['molu_molefelt_divan',-4.8,yC,-7.6,0],
   ['molu_molefelt_divan',4.8,yC,-7.6,0],
   ['molu_kang_hearth_bed',-8.4,yC,-2.0,PI/2],
   ['molu_bonduwe_bullion_chest',-8.4,yC,1.6,PI/2],
   ['molu_kang_hearth_bed',8.4,yC,-2.0,-PI/2],
   ['molu_amber_tally_rack',8.4,yC,1.6,-PI/2],
   ['molu_drover_bunk',-6.6,yC,6.8,PI],
   ['molu_tapetum_oil_cresset',6.6,yC,6.8,0]
  ]);
 }
});

/* 35. Middle Single-Family: Street-Rim Exchange Booth & Sunken Yaodong Home */
defBuilding({
 key:'mc_assay_shophouse_pit',
 name:'Street-Rim Exchange Booth and Sunken Yaodong Home',
 seed:8335,w:22,d:20,h:8.4,budget:106000,cut:true,
 front:{x:0,z:9.2,yaw:0},
 tags:{style:'bonduwe',wealth:'middle',types:['dwelling-single','shop'],role:'shophouse',job:'trading'},
 build(){
  const yC=.38,hB=3.82,yB=yC+hB;
  mcBasePad(0,-.3,19.4,16.8,yC,{style:'bonduwe',mk:'paving'});
  mcEntryRamp(0,0,9.1,0,yC,7.4,2.8,{style:'bonduwe'});

  /* Rear Family Yaodong & Sealed Coin Safe [-9.3..9.3, -8.5..-3.1] */
  mcVaultWing(-9.3,-8.5,9.3,-3.1,yC,hB,{
   style:'bonduwe',floorMk:'floor',rims:'ns',
   holes:{
    s:[
     {at:-3.8,w:1.8,h:2.26,door:true,sealed:true,leafMk:'iron',name:'shophouse-safe-door'},
     {at:2.0,w:1.95,h:2.32,door:true,name:'shophouse-home-door'}
    ]
   }
  });

  /* West Money-Changer Booth & East Kitchen Wing */
  mcVaultWing(-9.3,-2.7,-4.7,6.4,yC,hB,{
   style:'bonduwe',floorMk:'floor',rims:'we',
   holes:{
    e:[{at:1.8,w:1.85,h:2.28,door:true,name:'shophouse-booth-door'}],
    s:[{at:-7.0,w:1.3,h:1.25,y:1.0}]
   }
  });
  mcVaultWing(4.7,-2.7,9.3,6.4,yC,hB,{
   style:'bonduwe',floorMk:'floor',rims:'we',gapW:1.5,
   holes:{w:[{at:3.2,w:1.75,h:2.24,door:true,name:'shophouse-kitchen-door'}]}
  });

  mcTerraceLink(-7.0,-2.9,yB,2.8,.32);
  mcTerraceLink(7.0,-2.9,yB,2.8,.32);
  mcCourtyardStair(3.2,4.2,-1.6,yC,yB,4.7,{style:'bonduwe'});

  mcSteelyardAssay(-1.6,yC,1.6,0,1.9);
  mcVentHood(2.4,yB,-5.8,0,{smoke:true});
  mcBanner(-7.0,yB,5.8,0,3.2,'flag');

  mcTarget(.8,yC,4.0,'shophouse-exchange-pit',false);
  mcTarget(0,yC,-5.8,'changer-family-yaodong',true);
  mcTarget(-7.0,yC,1.8,'assay-exchange-booth',true);
  mcTarget(7.0,yC,1.8,'shophouse-kitchen-vault',true);
  mcTarget(0,yB,-5.8,'shophouse-roof-terrace',false);

  mcFurnList([
   ['molu_bonduwe_bullion_chest',-4.4,yC,-6.4,0],
   ['molu_kang_hearth_bed',2.4,yC,-6.2,0],
   ['molu_bypass_assay_scale',-7.0,yC,0,PI/2],
   ['molu_amber_tally_rack',-7.0,yC,3.8,PI/2],
   ['molu_hearth_brazier',7.0,yC,.2,0],
   ['molu_cucuteni_grain_pithos',7.0,yC,4.0,0]
  ]);
 }
});

/* 36. Middle Multi-Family: Two-Tier Bonded Tally-Clerk Sunken Courtyard */
defBuilding({
 key:'mc_vault_clerk_terraces',
 name:'Two-Tier Bonded Tally-Clerk Sunken Courtyard',
 seed:8336,w:22,d:20,h:8.6,budget:108000,cut:true,
 front:{x:0,z:9.2,yaw:0},
 tags:{style:'bonduwe',wealth:'middle',types:['dwelling-multi'],role:'clerk-terraces',job:'scribing'},
 build(){
  const yC=.38,hB=3.84,yB=yC+hB;
  mcBasePad(0,-.3,19.4,16.8,yC,{style:'bonduwe',mk:'paving'});
  mcEntryRamp(0,0,9.1,0,yC,7.4,2.8,{style:'bonduwe'});

  /* Rear Senior Tally-Clerk Apartments [-9.3..9.3, -8.5..-3.1] */
  mcVaultWing(-9.3,-8.5,9.3,-3.1,yC,hB,{
   style:'bonduwe',floorMk:'floor',rims:'ns',
   holes:{
    s:[
     {at:-3.8,w:1.85,h:2.28,door:true,name:'clerk-north-west-door'},
     {at:2.2,w:1.85,h:2.28,door:true,name:'clerk-north-east-door'}
    ],
    n:[{at:-3.2,w:1.25,h:1.25,y:1.0},{at:3.2,w:1.25,h:1.25,y:1.0}]
   }
  });

  /* West & East Junior Clerk Apartment Vaults */
  mcVaultWing(-9.3,-2.7,-4.7,6.4,yC,hB,{
   style:'bonduwe',floorMk:'floor',rims:'we',
   holes:{e:[{at:.4,w:1.75,h:2.24,door:true,name:'clerk-west-a-door'},{at:3.8,w:1.75,h:2.24,door:true,name:'clerk-west-b-door'}]}
  });
  mcVaultWing(4.7,-2.7,9.3,6.4,yC,hB,{
   style:'bonduwe',floorMk:'floor',rims:'we',gapW:1.5,
   holes:{w:[{at:3.4,w:1.75,h:2.24,door:true,name:'clerk-east-door'}]}
  });

  mcTerraceLink(-7.0,-2.9,yB,2.8,.32);
  mcTerraceLink(7.0,-2.9,yB,2.8,.32);
  mcCourtyardStair(3.2,4.2,-1.6,yC,yB,4.7,{style:'bonduwe'});

  mcCisternWell(-1.4,yC,1.6,{r:.82});
  mcVentHood(-4.2,yB,-5.8,0,{smoke:true});
  mcVentHood(4.2,yB,-5.8,0,{smoke:true});
  mcDryingMats(0,yB,-5.8,2,1);

  mcTarget(-.8,yC,4.2,'clerk-courtyard',false);
  mcTarget(0,yC,-5.8,'north-clerk-apartments',true);
  mcTarget(-7.0,yC,1.8,'west-clerk-apartments',true);
  mcTarget(7.0,yC,1.8,'east-clerk-apartments',true);
  mcTarget(0,yB,-5.8,'clerk-terrace-walk',false);

  mcFurnList([
   ['molu_kang_hearth_bed',-4.4,yC,-6.0,0],
   ['molu_amber_tally_rack',0,yC,-7.2,0],
   ['molu_kang_hearth_bed',4.4,yC,-6.0,0],
   ['molu_kang_hearth_bed',-7.0,yC,-.4,PI/2],
   ['molu_molefelt_divan',-7.0,yC,3.8,PI/2],
   ['molu_kang_hearth_bed',7.0,yC,-.4,-PI/2],
   ['molu_tapetum_oil_cresset',7.0,yC,4.2,0]
  ]);
 }
});

/* 37. Poor Single-Family: Way-Stone Signal Dugout & Mule-Sled Shelter */
defBuilding({
 key:'mc_trail_warden_dugout',
 name:'Way-Stone Signal Dugout and Mule-Sled Shelter',
 seed:8337,w:16,d:16,h:7.6,budget:84000,cut:true,
 front:{x:-1.4,z:7.1,yaw:0},
 tags:{style:'bonduwe',wealth:'poor',types:['dwelling-single'],role:'dugout'},
 build(){
  const yC=.34,hB=3.68,yB=yC+hB;
  mcBasePad(0,-.3,13.6,13.2,yC,{style:'bonduwe',mk:'cobble'});
  mcEntryRamp(-1.4,0,7.0,-1.4,yC,5.4,2.5,{style:'bonduwe'});

  /* Trail-Warden Single-Vault Dugout [-6.5..6.5, -6.6..-.4] */
  mcVaultWing(-6.5,-6.6,6.5,-.4,yC,hB,{
   style:'bonduwe',floorMk:'floor',rims:'nsw',
   holes:{
    s:[
     {at:-1.4,w:1.9,h:2.26,door:true,leafMk:'iron',name:'warden-dugout-door'},
     {at:2.8,w:1.3,h:1.22,y:1.0}
    ]
   }
  });

  mcCourtyardStair(4.6,5.0,1.2,yC,yB,5.2,{style:'bonduwe'});
  mcTerraceLink(4.6,-.1,yB,2.2,.48);

  mcCaravanSled(-3.2,yC,2.6,0,{load:'grain'});
  mcSeismicStone(-2.6,yB,-3.5,2.9,{big:false});
  mcVentHood(2.0,yB,-3.5,0,{smoke:true});

  mcTarget(-1.2,yC,2.8,'trail-warden-sled-yard',false);
  mcTarget(0,yC,-3.5,'warden-dugout-chamber',true);
  mcTarget(1.8,yB,-3.5,'dugout-signal-roof',false);

  mcFurnList([
   ['molu_kang_hearth_bed',-3.2,yC,-3.8,0],
   ['molu_seismic_drum_table',.8,yC,-3.4,0],
   ['molu_claw_shoe_rack',4.2,yC,-4.2,-PI/2],
   ['molu_cucuteni_grain_pithos',4.2,yC,-1.8,0],
   ['molu_tapetum_oil_cresset',-4.2,yC,-1.8,0]
  ]);
 }
});

/* 38. Poor Multi-Family: Bypass Sled-Driver & Porter Sunken Hostel-Pit */
defBuilding({
 key:'mc_caravan_crew_bunks',
 name:'Bypass Sled-Driver and Porter Sunken Hostel-Pit',
 seed:8338,w:20,d:18,h:7.8,budget:98000,cut:true,
 front:{x:0,z:8.2,yaw:0},
 tags:{style:'bonduwe',wealth:'poor',types:['dwelling-multi'],role:'hostel-pit'},
 build(){
  const yC=.36,hB=3.74,yB=yC+hB;
  mcBasePad(0,-.3,17.4,15.2,yC,{style:'bonduwe',mk:'cobble'});
  mcEntryRamp(0,0,8.1,0,yC,6.5,2.8,{style:'bonduwe'});

  /* Rear Sled-Crew Common Bunk-Vault [-8.4..8.4, -7.6..-2.6] */
  mcVaultWing(-8.4,-7.6,8.4,-2.6,yC,hB,{
   style:'bonduwe',floorMk:'floor',rims:'ns',
   holes:{
    s:[
     {at:-3.4,w:1.8,h:2.24,door:true,name:'crew-north-west-door'},
     {at:2.4,w:1.8,h:2.24,door:true,name:'crew-north-east-door'}
    ]
   }
  });

  /* West & East Porter Bunk Vaults */
  mcVaultWing(-8.4,-2.2,-4.0,5.6,yC,hB,{
   style:'bonduwe',floorMk:'floor',rims:'we',
   holes:{e:[{at:.4,w:1.7,h:2.2,door:true,name:'crew-west-a-door'},{at:3.6,w:1.7,h:2.2,door:true,name:'crew-west-b-door'}]}
  });
  mcVaultWing(4.0,-2.2,8.4,5.6,yC,hB,{
   style:'bonduwe',floorMk:'floor',rims:'we',gapW:1.4,
   holes:{w:[{at:3.4,w:1.75,h:2.2,door:true,name:'crew-east-door'}]}
  });

  mcTerraceLink(-6.2,-2.4,yB,2.6,.32);
  mcTerraceLink(6.2,-2.4,yB,2.6,.32);
  mcCourtyardStair(2.6,3.6,-1.2,yC,yB,4.0,{style:'bonduwe'});

  mcCisternWell(-1.2,yC,1.4,{r:.78});
  mcVentHood(-3.8,yB,-5.1,0,{smoke:true});
  mcVentHood(3.8,yB,-5.1,0,{smoke:true});
  mcBanner(0,yB,-5.1,0,3.1,'flagSalt');

  mcTarget(-.8,yC,3.6,'porter-hostel-pit',false);
  mcTarget(0,yC,-5.1,'north-sled-crew-bunks',true);
  mcTarget(-6.2,yC,1.7,'west-porter-bunks',true);
  mcTarget(6.2,yC,1.7,'east-porter-bunks',true);
  mcTarget(2.4,yB,-5.1,'hostel-roof-terrace',false);

  mcFurnList([
   ['molu_drover_bunk',-4.8,yC,-5.2,0],
   ['molu_drover_bunk',3.8,yC,-5.2,0],
   ['molu_hearth_brazier',-.4,yC,-5.0,0],
   ['molu_drover_bunk',-6.2,yC,-.2,PI/2],
   ['molu_claw_shoe_rack',-6.2,yC,3.8,PI/2],
   ['molu_drover_bunk',6.2,yC,-.2,-PI/2],
   ['molu_tapetum_oil_cresset',6.2,yC,3.8,0]
  ]);
 }
});
