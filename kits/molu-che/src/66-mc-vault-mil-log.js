// prefix: mc
// ================================================================= BONDUWE BONDED STRONG-VAULTS — BYPASS LOGISTICS & STEPPE DEFENSE (8327..8332)
// Weeping Valley Overland Bypass & Steppe Rim Fortifications (style: 'bonduwe'):
//   8327. mc_bypass_customs_gate — Hai-Trelu Claw-and-Salt Compact Toll Trench & Steelyard Assay Yard
//   8328. mc_caravan_sled_mansio — Overland Silk, Superconductor & Bullion Sled-Train Relay Dikengyuan
//   8329. mc_seismic_watch_mound — Rammed-Loess Seismic-Monolith Listening Post & Dust-Beacon Mound
//   8330. mc_sunken_sally_redoubt— Concealed Rim-Trench Crossbow Redoubt & Talpathere Sally-Ramp
//   8331. mc_gate_ramp_bastion   — Battered Stone-Faced Loess Gorge-Head Bastion & Iron Portcullis
//   8332. mc_fortified_vault_keep— Bonduwe Citadel-Pit & Double-Iron Strongroom Keep

/* 27. Hai-Trelu Claw-and-Salt Compact Toll Trench & Steelyard Assay Yard */
defBuilding({
 key:'mc_bypass_customs_gate',
 name:'Hai-Trelu Claw-and-Salt Compact Toll Trench and Steelyard Assay Yard',
 seed:8327,w:26,d:22,h:9.8,budget:120000,cut:true,
 front:{x:0,z:10.1,yaw:0},
 tags:{style:'bonduwe',wealth:'rich',types:['civic','infrastructure'],role:'customs-gate',job:'customs'},
 build(){
  const yC=.4,hB=3.92,yB=yC+hB;
  mcBasePad(0,-.4,22.8,18.4,yC,{style:'bonduwe',mk:'cobble'});
  mcEntryRamp(0,0,10.0,0,yC,8.2,3.2,{style:'bonduwe'});

  /* Rear Safe-Conduct Customs Registry & Bonded Impound Vault [-11.0..11.0, -9.4..-4.0] */
  mcVaultWing(-11.0,-9.4,11.0,-4.0,yC,hB,{
   style:'bonduwe',mk:'dolomite',floorMk:'floor',rims:'ns',
   holes:{
    s:[
     {at:-4.8,w:1.9,h:2.3,door:true,sealed:true,leafMk:'iron',name:'customs-impound-door'},
     {at:.4,w:2.1,h:2.4,door:true,name:'customs-registry-door'},
     {at:5.4,w:1.35,h:1.25,y:1.0}
    ]
   }
  });

  /* West Weighmaster Wing & East Treaty-Escort Guard Wing (kept clear of portcullis gate!) */
  mcVaultWing(-11.0,-3.6,-5.8,7.0,yC,hB,{
   style:'bonduwe',floorMk:'floor',rims:'we',
   holes:{e:[{at:1.4,w:1.85,h:2.28,door:true,name:'customs-weighmaster-door'}]}
  });
  mcVaultWing(5.8,-3.6,11.0,7.0,yC,hB,{
   style:'bonduwe',floorMk:'floor',rims:'we',gapW:1.5,
   holes:{w:[{at:3.6,w:1.85,h:2.28,door:true,name:'customs-escort-door'}]}
  });

  mcTerraceLink(-8.4,-3.8,yB,3.0,.32);
  mcTerraceLink(8.4,-3.8,yB,3.0,.32);
  mcCourtyardStair(4.3,4.2,-1.6,yC,yB,5.8,{style:'bonduwe'});

  /* Stone Toll-Gate Portcullis spanning central trench + Steelyard Assay */
  mcPortcullisGate(-.4,yC,5.4,0,2.9,3.3,{d:1.2});
  mcSteelyardAssay(-2.0,yC,-.4,0,2.3);
  mcBanner(-6.8,yB,6.4,0,3.5,'flag');
  mcBanner(6.8,yB,6.4,0,3.5,'flagSalt');

  mcTarget(0,yC,1.8,'toll-trench-weighing-bay',false);
  mcTarget(0,yC,-6.7,'customs-safe-conduct-hall',true);
  mcTarget(-8.4,yC,1.7,'weighmaster-vault',true);
  mcTarget(8.4,yC,1.7,'treaty-escort-guardroom',true);
  mcTarget(0,yB,-6.7,'customs-terrace',false);

  mcFurnList([
   ['molu_bonduwe_bullion_chest',-5.8,yC,-7.2,0],
   ['molu_bypass_assay_scale',.4,yC,-6.4,0],
   ['molu_amber_tally_rack',5.8,yC,-7.2,0],
   ['molu_amber_tally_rack',-8.4,yC,-.6,PI/2],
   ['molu_halite_compact_altar',-8.4,yC,3.8,PI/2],
   ['molu_claw_shoe_rack',8.4,yC,-.4,-PI/2],
   ['molu_drover_bunk',8.4,yC,3.6,-PI/2]
  ]);
 }
});

/* 28. Overland Silk, Superconductor & Bullion Sled-Train Relay Dikengyuan */
defBuilding({
 key:'mc_caravan_sled_mansio',
 name:'Overland Silk Superconductor and Bullion Sled-Train Relay Mansio',
 seed:8328,w:28,d:24,h:9.0,budget:124000,cut:true,
 front:{x:-4.6,z:11.0,yaw:0},
 tags:{style:'bonduwe',wealth:'middle',types:['inn','tavern','infrastructure'],role:'mansio',job:'herding'},
 build(){
  const yC=.38,hB=3.86,yB=yC+hB;
  mcBasePad(0,-.5,24.4,19.8,yC,{style:'bonduwe',mk:'cobble'});
  /* Twin entry/exit sled ramps for continuous Weeping Valley bypass relay convoys */
  mcEntryRamp(-4.6,0,10.9,-4.6,yC,9.1,2.9,{style:'bonduwe'});
  mcEntryRamp(4.6,0,10.9,4.6,yC,9.1,2.9,{style:'bonduwe'});

  /* Rear Locked-Cargo Vault & Factor Dining Hall [-11.8..11.8, -10.2..-4.8] */
  mcVaultWing(-11.8,-10.2,11.8,-4.8,yC,hB,{
   style:'bonduwe',floorMk:'floor',rims:'ns',
   holes:{
    s:[
     {at:-6.2,w:1.95,h:2.32,door:true,sealed:true,leafMk:'iron',name:'mansio-cargo-lockup-door'},
     {at:0,w:2.1,h:2.38,door:true,name:'mansio-common-hall-door'},
     {at:6.2,w:1.95,h:2.32,door:true,name:'mansio-guest-chambers-door'}
    ]
   }
  });

  /* West Relay Talpathere Stalls & East Drover Bunkhouse */
  mcVaultWing(-11.8,-4.4,-7.0,7.8,yC,hB,{
   style:'bonduwe',rims:'we',
   holes:{e:[{at:1.6,w:1.95,h:2.3,door:true,name:'mansio-tack-vault-door'}]}
  });
  mcVaultWing(7.0,-4.4,11.8,7.8,yC,hB,{
   style:'bonduwe',floorMk:'floor',rims:'we',gapW:1.5,
   holes:{w:[{at:3.8,w:1.95,h:2.3,door:true,name:'mansio-bunkhouse-door'}]}
  });

  mcTerraceLink(-9.4,-4.6,yB,2.8,.32);
  mcTerraceLink(9.4,-4.6,yB,2.8,.32);
  mcCourtyardStair(5.5,4.4,-1.8,yC,yB,7.0,{style:'bonduwe'});

  mcCaravanSled(-3.2,yC,1.2,0,{load:'silk'});
  mcCaravanSled(.6,yC,1.2,0,{load:'bullion'});
  mcTalpathereStall(-2.8,yC,-2.4,0,{w:3.2,d:2.2});
  mcCisternWell(1.6,yC,5.2,{r:.86});
  mcVentHood(0,yB,-7.5,0,{smoke:true});
  mcVentHood(9.4,yB,1.6,0,{smoke:true});
  mcBanner(0,yB,8.4,0,3.4,'flag');

  mcTarget(-1.2,yC,5.0,'sled-train-relay-yard',false);
  mcTarget(0,yC,-7.5,'mansio-hall-and-lockup',true);
  mcTarget(-9.4,yC,1.6,'relay-harness-vault',true);
  mcTarget(9.4,yC,1.6,'drover-relay-bunks',true);
  mcTarget(-4.2,yB,-7.5,'mansio-watch-terrace',false);

  mcFurnList([
   ['molu_bonduwe_bullion_chest',-7.4,yC,-7.8,0],
   ['molu_hearth_brazier',0,yC,-7.2,0],
   ['molu_molefelt_divan',-2.4,yC,-7.8,0],
   ['molu_kang_hearth_bed',6.6,yC,-7.8,0],
   ['molu_claw_shoe_rack',-9.4,yC,-.8,PI/2],
   ['molu_cucuteni_grain_pithos',-9.4,yC,4.2,0],
   ['molu_drover_bunk',9.4,yC,-.8,-PI/2],
   ['molu_drover_bunk',9.4,yC,4.2,-PI/2]
  ]);
 }
});

/* 29. Rammed-Loess Seismic-Monolith Listening Post & Dust-Beacon Mound */
defBuilding({
 key:'mc_seismic_watch_mound',
 name:'Rammed-Loess Seismic-Monolith Listening Post and Dust-Beacon Mound',
 seed:8329,w:22,d:20,h:12.4,budget:108000,cut:true,
 front:{x:0,z:9.2,yaw:0},
 tags:{style:'bonduwe',wealth:'middle',types:['military'],role:'listening-post'},
 build(){
  const yC=.42,hB=4.2,yB=yC+hB;
  mcBasePad(0,-.3,19.4,16.8,yC,{style:'bonduwe',mk:'paving'});
  mcEntryRamp(0,0,9.1,0,yC,7.3,2.8,{style:'bonduwe'});

  /* Deep Acoustic-Bedrock Listening Vault [-9.3..9.3, -8.5..-2.9] */
  mcVaultWing(-9.3,-8.5,9.3,-2.9,yC,hB,{
   style:'bonduwe',mk:'rammed',vault:true,floorMk:'paving',rims:'nsew',
   holes:{
    s:[
     {at:-3.8,w:1.8,h:2.26,door:true,sealed:true,leafMk:'iron',name:'mound-acoustic-chamber-door'},
     {at:2.2,w:1.85,h:2.3,door:true,leafMk:'iron',name:'mound-signal-store-door'}
    ]
   }
  });

  /* Flanking Watch-Garrison Wings */
  mcVaultWing(-9.3,-2.5,-4.7,6.4,yC,hB,{
   style:'bonduwe',mk:'rammed',floorMk:'floor',rims:'we',
   holes:{e:[{at:1.8,w:1.75,h:2.24,door:true,name:'mound-west-guard-door'}]}
  });
  mcVaultWing(4.7,-2.5,9.3,6.4,yC,hB,{
   style:'bonduwe',mk:'rammed',floorMk:'floor',rims:'we',gapW:1.5,
   holes:{w:[{at:3.2,w:1.75,h:2.24,door:true,name:'mound-east-guard-door'}]}
  });

  mcTerraceLink(-7.0,-2.7,yB,2.8,.32);
  mcTerraceLink(7.0,-2.7,yB,2.8,.32);
  mcCourtyardStair(3.2,4.2,-1.4,yC,yB,4.7,{style:'bonduwe'});

  /* Stepped rammed-earth signal mound cap (walk: false) crowned by Great Seismic Monolith & Dust-Beacon! */
  svNoWalk(()=>{
   box('rammed',0,yB+.03,-5.7,6.8,1.2,4.2,P('rammed'));
   box('dolomite',0,yB+1.23,-5.7,5.4,.18,3.4,P('dolomite'));
  });
  mcSeismicStone(0,yB+1.41,-5.7,5.2,{big:true});
  mcDowndraftKiln(-6.2,yB,-5.7,0,1.15);
  mcBanner(6.4,yB,-5.7,0,3.8,'flag');

  mcTarget(-.8,yC,3.2,'listening-post-pit',false);
  mcTarget(0,yC,-5.7,'bedrock-seismic-drum-vault',true);
  mcTarget(-7.0,yC,2.0,'beacon-fuel-cellar',true);
  mcTarget(7.0,yC,2.0,'listener-watch-bunks',true);
  mcTarget(4.8,yB,-5.7,'beacon-mound-terrace',false);

  mcFurnList([
   ['molu_seismic_drum_table',-3.6,yC,-5.8,0],
   ['molu_seismic_drum_table',2.2,yC,-5.8,0],
   ['molu_tapetum_oil_cresset',-.6,yC,-4.4,0],
   ['molu_cucuteni_grain_pithos',-7.0,yC,-.2,0],
   ['molu_claw_shoe_rack',-7.0,yC,3.8,PI/2],
   ['molu_drover_bunk',7.0,yC,0,-PI/2],
   ['molu_hearth_brazier',7.0,yC,4.0,0]
  ]);
 }
});

/* 30. Concealed Rim-Trench Crossbow Redoubt & Talpathere Sally-Ramp */
defBuilding({
 key:'mc_sunken_sally_redoubt',
 name:'Concealed Rim-Trench Crossbow Redoubt and Talpathere Sally-Ramp',
 seed:8330,w:24,d:22,h:9.4,budget:114000,cut:true,
 front:{x:0,z:10.1,yaw:0},
 tags:{style:'bonduwe',wealth:'middle',types:['military'],role:'redoubt'},
 build(){
  const yC=.4,hB=3.92,yB=yC+hB;
  mcBasePad(0,-.4,21.0,18.4,yC,{style:'bonduwe',mk:'cobble'});
  mcEntryRamp(0,0,10.0,0,yC,8.2,3.1,{style:'bonduwe'});

  /* Low-profile Concealed Crossbow & Sally-Team Casemate [-10.2..10.2, -9.4..-4.0] */
  mcVaultWing(-10.2,-9.4,10.2,-4.0,yC,hB,{
   style:'bonduwe',mk:'rammed',floorMk:'floor',rims:'nsew',
   holes:{
    s:[
     {at:-4.4,w:1.9,h:2.3,door:true,leafMk:'iron',name:'redoubt-armoury-door'},
     {at:1.8,w:2.0,h:2.34,door:true,leafMk:'iron',name:'redoubt-sally-door'}
    ],
    n:[{at:-4.6,w:.9,h:.95,y:1.35},{at:0,w:.9,h:.95,y:1.35},{at:4.6,w:.9,h:.95,y:1.35}]
   }
  });

  /* West Sally-Talpathere Pen & East Bolt-Magazine Casemate */
  mcVaultWing(-10.2,-3.6,-5.2,7.0,yC,hB,{
   style:'bonduwe',mk:'rammed',rims:'we',
   holes:{e:[{at:1.6,w:1.85,h:2.28,door:true,name:'redoubt-mole-pen-door'}]}
  });
  mcVaultWing(5.2,-3.6,10.2,7.0,yC,hB,{
   style:'bonduwe',mk:'rammed',floorMk:'floor',rims:'we',gapW:1.5,
   holes:{w:[{at:3.6,w:1.85,h:2.28,door:true,name:'redoubt-magazine-door'}]}
  });

  mcTerraceLink(-7.7,-3.8,yB,3.0,.32);
  mcTerraceLink(7.7,-3.8,yB,3.0,.32);
  mcCourtyardStair(3.7,4.2,-1.6,yC,yB,5.2,{style:'bonduwe'});

  mcTalpathereStall(-1.8,yC,1.2,0,{w:3.2,d:2.3});
  mcSeismicStone(-6.2,yB,-6.7,3.0,{big:false});
  mcBanner(6.2,yB,-6.7,0,3.4,'tapestry');

  mcTarget(.6,yC,4.2,'sally-muster-pit',false);
  mcTarget(0,yC,-6.7,'crossbow-casemate-hall',true);
  mcTarget(-7.7,yC,1.7,'armoured-talpathere-bay',true);
  mcTarget(7.7,yC,1.7,'bolt-and-shield-magazine',true);
  mcTarget(0,yB,-6.7,'rim-firing-parapet',false);

  mcFurnList([
   ['molu_claw_shoe_rack',-4.6,yC,-7.2,0],
   ['molu_drover_bunk',2.2,yC,-7.2,0],
   ['molu_hearth_brazier',-.8,yC,-5.8,0],
   ['molu_claw_forge_anvil',-7.7,yC,-.4,PI/2],
   ['molu_amber_grub_trough',-7.7,yC,3.8,PI/2],
   ['molu_bonduwe_bullion_chest',7.7,yC,-.4,-PI/2],
   ['molu_tapetum_oil_cresset',7.7,yC,4.2,0]
  ]);
 }
});

/* 31. Battered Stone-Faced Loess Gorge-Head Bastion & Iron Portcullis */
defBuilding({
 key:'mc_gate_ramp_bastion',
 name:'Battered Stone-Faced Loess Gorge-Head Bastion and Iron Portcullis',
 seed:8331,w:26,d:22,h:11.0,budget:122000,cut:true,
 front:{x:0,z:10.1,yaw:0},
 tags:{style:'bonduwe',wealth:'rich',types:['military'],role:'bastion'},
 build(){
  const yC=.42,hB=4.15,yB=yC+hB;
  mcBasePad(0,-.4,22.8,18.4,yC,{style:'bonduwe',mk:'cobble'});
  mcEntryRamp(0,0,10.0,0,yC,8.2,3.2,{style:'bonduwe'});

  /* Ashlar-Faced Rear Command & Windlass Keep [-11.0..11.0, -9.4..-4.0] */
  mcVaultWing(-11.0,-9.4,11.0,-4.0,yC,hB,{
   style:'bonduwe',mk:'dolomite',floorMk:'floor',rims:'nsew',
   holes:{
    s:[
     {at:-4.8,w:1.9,h:2.3,door:true,leafMk:'iron',name:'bastion-west-guard-door'},
     {at:.4,w:2.1,h:2.4,door:true,leafMk:'iron',name:'bastion-command-door'}
    ],
    n:[{at:-4.2,w:.95,h:1.1,y:1.25},{at:4.2,w:.95,h:1.1,y:1.25}]
   }
  });

  /* Flanking Gorge-Head Stone Bastion Cheek Towers */
  mcVaultWing(-11.0,-3.6,-5.8,7.0,yC,hB,{
   style:'bonduwe',mk:'dolomite',floorMk:'floor',rims:'we',
   holes:{e:[{at:1.4,w:1.85,h:2.28,door:true,leafMk:'iron',name:'bastion-west-cheek-door'}]}
  });
  mcVaultWing(5.8,-3.6,11.0,7.0,yC,hB,{
   style:'bonduwe',mk:'dolomite',floorMk:'floor',rims:'we',gapW:1.5,
   holes:{w:[{at:3.6,w:1.85,h:2.28,door:true,leafMk:'iron',name:'bastion-east-cheek-door'}]}
  });

  mcTerraceLink(-8.4,-3.8,yB,3.0,.32);
  mcTerraceLink(8.4,-3.8,yB,3.0,.32);
  mcCourtyardStair(4.3,4.2,-1.6,yC,yB,5.8,{style:'bonduwe'});

  /* Raised Iron Portcullis Gate Arch guarding the gorge-head ramp mouth */
  mcPortcullisGate(-.4,yC,5.4,0,3.0,3.5,{d:1.35});
  mcSeismicStone(0,yB,-6.7,4.2,{big:true});
  mcBanner(-8.4,yB,6.2,0,3.8,'flag');
  mcBanner(8.4,yB,6.2,0,3.8,'tapestry');

  mcTarget(0,yC,1.6,'bastion-killing-court',false);
  mcTarget(0,yC,-6.7,'gorge-command-casemate',true);
  mcTarget(-8.4,yC,1.7,'west-portcullis-guardroom',true);
  mcTarget(8.4,yC,1.7,'east-portcullis-guardroom',true);
  mcTarget(-4.2,yB,-6.7,'bastion-battlement-walk',false);

  mcFurnList([
   ['molu_seismic_drum_table',.4,yC,-6.4,0],
   ['molu_claw_shoe_rack',-5.6,yC,-7.2,0],
   ['molu_bonduwe_bullion_chest',5.6,yC,-7.2,0],
   ['molu_drover_bunk',-8.4,yC,-.6,PI/2],
   ['molu_hearth_brazier',-8.4,yC,3.8,0],
   ['molu_drover_bunk',8.4,yC,-.6,-PI/2],
   ['molu_tapetum_oil_cresset',8.4,yC,4.0,0]
  ]);
 }
});

/* 32. Bonduwe Citadel-Pit & Double-Iron Strongroom Keep */
defBuilding({
 key:'mc_fortified_vault_keep',
 name:'Bonduwe Citadel-Pit and Double-Iron Strongroom Keep',
 seed:8332,w:28,d:26,h:11.8,budget:134000,cut:true,
 front:{x:0,z:12.0,yaw:0},
 tags:{style:'bonduwe',wealth:'rich',types:['military','civic'],role:'citadel'},
 build(){
  const yC=.44,hB=4.22,yB=yC+hB;
  mcBasePad(0,-.6,24.8,21.6,yC,{style:'bonduwe',mk:'paving'});
  mcEntryRamp(0,0,11.9,0,yC,9.9,3.1,{style:'bonduwe'});

  /* Double-Iron Citadel Strongroom Keep [-12.1..12.1, -11.2..-5.4] */
  mcVaultWing(-12.1,-11.2,12.1,-5.4,yC,hB,{
   style:'bonduwe',mk:'dolomite',vault:true,floorMk:'paving',rims:'ns',
   holes:{
    s:[
     {at:-5.4,w:1.95,h:2.35,door:true,sealed:true,leafMk:'iron',name:'citadel-west-iron-door'},
     {at:0,w:2.25,h:2.48,door:true,sealed:true,leafMk:'iron',name:'citadel-great-iron-door'},
     {at:5.4,w:1.95,h:2.35,door:true,sealed:true,leafMk:'iron',name:'citadel-east-iron-door'}
    ]
   }
  });

  /* West Garrison Barracks Wing & East Warden War-Council Wing */
  mcVaultWing(-12.1,-5.0,-6.6,4.4,yC,hB,{
   style:'bonduwe',mk:'dolomite',floorMk:'floor',rims:'we',
   holes:{e:[{at:-.4,w:1.9,h:2.3,door:true,leafMk:'iron',name:'citadel-barracks-door'}]}
  });
  mcVaultWing(6.6,-5.0,12.1,4.4,yC,hB,{
   style:'bonduwe',mk:'dolomite',floorMk:'floor',rims:'we',gapW:1.5,
   holes:{w:[{at:2.0,w:1.9,h:2.3,door:true,leafMk:'iron',name:'citadel-war-council-door'}]}
  });

  /* South Gatehouse Cheek Wings flanking the entry ramp */
  mcVaultWing(-12.1,4.8,-2.8,9.8,yC,hB,{
   style:'bonduwe',mk:'dolomite',floorMk:'floor',rims:'ns',
   holes:{n:[{at:-4.7,w:1.75,h:2.26,door:true,leafMk:'iron',name:'citadel-sw-tower-door'}]}
  });
  mcVaultWing(2.8,4.8,12.1,9.8,yC,hB,{
   style:'bonduwe',mk:'dolomite',floorMk:'floor',rims:'ns',
   holes:{n:[{at:4.7,w:1.75,h:2.26,door:true,leafMk:'iron',name:'citadel-se-tower-door'}]}
  });

  mcTerraceLink(-9.3,-5.2,yB,3.4,.32);
  mcTerraceLink(9.3,-5.2,yB,3.4,.32);
  mcTerraceLink(-9.3,4.6,yB,3.4,.32);
  mcTerraceLink(9.3,4.6,yB,3.4,.32);
  mcCourtyardStair(5.1,2.6,-3.2,yC,yB,6.6,{style:'bonduwe'});

  /* Raisedstone citadel beacon plinth + Seismic Way-Stone & Cistern */
  svNoWalk(()=>{
   box('dolomite',0,yB+.03,-8.3,6.4,1.1,3.8,P('dolomite'));
   box('basalt',0,yB+1.13,-8.3,5.2,.18,3.0,P('basalt'));
  });
  mcSeismicStone(0,yB+1.31,-8.3,4.8,{big:true});
  mcCisternWell(-2.4,yC,-.4,{r:.9});
  mcBanner(-7.4,yB,9.1,0,3.8,'flag');
  mcBanner(7.4,yB,9.1,0,3.8,'tapestry');

  mcTarget(0,yC,2.2,'citadel-sunken-ward',false);
  mcTarget(0,yC,-8.3,'double-iron-citadel-strongroom',true);
  mcTarget(-9.3,yC,-.3,'citadel-garrison-vault',true);
  mcTarget(9.3,yC,-.3,'warden-war-council-vault',true);
  mcTarget(-7.4,yC,7.3,'sw-gate-casemate',true);
  mcTarget(7.4,yC,7.3,'se-gate-casemate',true);
  mcTarget(-5.2,yB,-8.3,'citadel-rampart-terrace',false);

  mcFurnList([
   ['molu_bonduwe_bullion_chest',-6.2,yC,-8.6,0],
   ['molu_bonduwe_bullion_chest',0,yC,-8.6,0],
   ['molu_bonduwe_bullion_chest',6.2,yC,-8.6,0],
   ['molu_halite_compact_altar',0,yC,-6.8,0],
   ['molu_drover_bunk',-9.3,yC,-2.2,PI/2],
   ['molu_drover_bunk',-9.3,yC,1.8,PI/2],
   ['molu_seismic_drum_table',9.3,yC,-1.8,-PI/2],
   ['molu_amber_tally_rack',9.3,yC,2.0,-PI/2],
   ['molu_claw_shoe_rack',-7.4,yC,7.4,0],
   ['molu_hearth_brazier',7.4,yC,7.4,0]
  ]);
 }
});
