// prefix: mc
// ================================================================= DIKENGYUAN BENCH CLANS — ALL 6 RESIDENTIAL CLASSES (8314..8319)
// Complete (poor | middle | rich) x (dwelling-single | dwelling-multi) matrix for Moleshelf Pastoral & Craft Clans:
//   8314. mc_rich_double_pit    — (rich, dwelling-single) Twin-Courtyard Ulmen Herder-Lord Dikengyuan Manor
//   8315. mc_rich_kin_compound  — (rich, dwelling-multi)  Four-Vault Extended Lineage Dikengyuan Compound
//   8316. mc_mid_drover_pit     — (middle, dwelling-single) Three-Arch Yaodong Sunken Family Courtyard
//   8317. mc_mid_artisan_pit    — (middle, dwelling-multi)  Shared-Ramp Twin-Family Craft Dikengyuan
//   8318. mc_poor_single_yaodong— (poor, dwelling-single) Cut-Bank Single-Arch Yaodong & Forecourt
//   8319. mc_poor_diggers_pit   — (poor, dwelling-multi)  Six-Cell Herdsman & Delver Sunken Bunk-Pit

/* 14. Rich Single-Family: Twin-Courtyard Ulmen Herder-Lord Dikengyuan Manor */
defBuilding({
 key:'mc_rich_double_pit',
 name:'Twin-Courtyard Ulmen Herder-Lord Dikengyuan Manor',
 seed:8314,w:26,d:24,h:9.4,budget:122000,cut:true,
 front:{x:0,z:11.0,yaw:0},
 tags:{style:'dikengyuan',wealth:'rich',types:['dwelling-single'],role:'manor'},
 build(){
  const yC=.4,hB=3.92,yB=yC+hB;
  mcBasePad(0,-.5,22.8,19.8,yC,{style:'dikengyuan',mk:'paving'});
  mcEntryRamp(0,0,10.9,0,yC,9.1,2.9,{style:'dikengyuan'});

  /* Rear Ulmen Master Hall Yaodong [-11.0..11.0, -10.2..-4.8] */
  mcVaultWing(-11.0,-10.2,11.0,-4.8,yC,hB,{
   style:'dikengyuan',floorMk:'floor',rims:'ns',
   holes:{
    s:[
     {at:-4.6,w:1.85,h:2.3,door:true,name:'ulmen-bedchamber-door'},
     {at:0,w:2.1,h:2.42,door:true,pierMk:'dolomite',leafMk:'darkcedar',name:'ulmen-reception-door'},
     {at:4.6,w:1.85,h:2.3,door:true,name:'ulmen-treasury-door'}
    ],
    n:[{at:-4.2,w:1.3,h:1.25,y:1.0},{at:4.2,w:1.3,h:1.25,y:1.0}]
   }
  });

  /* West Retainer/Kitchen Wing & East Study/Guest Wing */
  mcVaultWing(-11.0,-4.4,-5.8,7.8,yC,hB,{
   style:'dikengyuan',floorMk:'floor',rims:'we',
   holes:{
    e:[{at:-1.2,w:1.8,h:2.26,door:true,name:'ulmen-kitchen-door'},{at:3.8,w:1.8,h:2.26,door:true,name:'ulmen-tack-door'}]
   }
  });
  mcVaultWing(5.8,-4.4,11.0,7.8,yC,hB,{
   style:'dikengyuan',floorMk:'floor',rims:'we',gapW:1.5,
   holes:{
    w:[{at:3.8,w:1.85,h:2.28,door:true,name:'ulmen-study-door'}],
    e:[{at:.8,w:1.3,h:1.25,y:1.0}]
   }
  });

  mcTerraceLink(-8.4,-4.6,yB,3.0,.32);
  mcTerraceLink(8.4,-4.6,yB,3.0,.32);
  mcCourtyardStair(4.3,4.2,-2.0,yC,yB,5.8,{style:'dikengyuan'});

  /* Carved cedar screen portico dividing outer drover forecourt from inner Ulmen court */
  mcArcadeColonnade(-5.2,1.6,2.6,1.6,yC,3.05,{style:'dikengyuan',n:3,skipMid:1.4});
  mcCisternWell(-2.2,yC,-1.6,{r:.84});
  mcVentHood(-5.4,yB,-7.5,0,{smoke:true});
  mcVentHood(5.4,yB,-7.5,0,{smoke:true});
  mcSeismicStone(0,yB,-7.5,2.9,{big:false});
  mcDryingMats(-8.4,yB,1.8,1,2);
  mcBanner(-2.6,yB,7.2,0,3.2,'tapestry');

  mcTarget(0,yC,5.2,'ulmen-outer-forecourt',false);
  mcTarget(0,yC,-1.4,'ulmen-inner-cistern-court',false);
  mcTarget(0,yC,-7.5,'ulmen-master-yaodong',true);
  mcTarget(-8.4,yC,1.6,'west-kitchen-and-tack-wing',true);
  mcTarget(8.4,yC,1.6,'east-ledger-study-wing',true);
  mcTarget(2.8,yB,-7.5,'manor-loess-terrace',false);

  mcFurnList([
   ['molu_kang_hearth_bed',-5.2,yC,-7.6,0],
   ['molu_molefelt_divan',0,yC,-7.8,0],
   ['molu_hearth_brazier',0,yC,-6.0,0],
   ['molu_bonduwe_bullion_chest',5.2,yC,-7.8,0],
   ['molu_curd_press_table',-8.4,yC,-1.2,PI/2],
   ['molu_claw_shoe_rack',-8.4,yC,4.2,PI/2],
   ['molu_amber_tally_rack',8.4,yC,-.6,-PI/2],
   ['molu_seismic_drum_table',8.4,yC,3.8,0]
  ]);
 }
});

/* 15. Rich Multi-Family: Four-Vault Extended Lineage Dikengyuan Compound */
defBuilding({
 key:'mc_rich_kin_compound',
 name:'Four-Vault Extended Lineage Dikengyuan Compound',
 seed:8315,w:26,d:24,h:9.0,budget:122000,cut:true,
 front:{x:0,z:11.0,yaw:0},
 tags:{style:'dikengyuan',wealth:'rich',types:['dwelling-multi'],role:'clan-compound'},
 build(){
  const yC=.4,hB=3.88,yB=yC+hB;
  mcBasePad(0,-.5,22.8,19.8,yC,{style:'dikengyuan',mk:'paving'});
  mcEntryRamp(0,0,10.9,0,yC,9.1,2.9,{style:'dikengyuan'});

  /* Four family branch vaults enclosing the shared ancestral courtyard */
  mcVaultWing(-11.0,-10.2,11.0,-5.0,yC,hB,{
   style:'dikengyuan',floorMk:'floor',rims:'ns',
   holes:{
    s:[
     {at:-4.8,w:1.85,h:2.28,door:true,name:'kin-elder-west-door'},
     {at:0,w:1.95,h:2.34,door:true,name:'kin-elder-center-door'},
     {at:4.8,w:1.85,h:2.28,door:true,name:'kin-elder-east-door'}
    ]
   }
  });
  mcVaultWing(-11.0,-4.6,-5.8,4.0,yC,hB,{
   style:'dikengyuan',floorMk:'floor',rims:'we',
   holes:{e:[{at:-.4,w:1.85,h:2.28,door:true,name:'kin-second-branch-door'}]}
  });
  mcVaultWing(5.8,-4.6,11.0,4.0,yC,hB,{
   style:'dikengyuan',floorMk:'floor',rims:'we',gapW:1.5,
   holes:{w:[{at:1.8,w:1.85,h:2.28,door:true,name:'kin-third-branch-door'}]}
  });
  mcVaultWing(-11.0,4.4,-2.0,9.0,yC,hB,{
   style:'dikengyuan',floorMk:'floor',rims:'ns',
   holes:{n:[{at:-3.9,w:1.75,h:2.24,door:true,name:'kin-sw-branch-door'}]}
  });
  mcVaultWing(2.0,4.4,11.0,9.0,yC,hB,{
   style:'dikengyuan',floorMk:'floor',rims:'ns',
   holes:{n:[{at:3.9,w:1.75,h:2.24,door:true,name:'kin-se-branch-door'}]}
  });

  mcTerraceLink(-8.4,-4.8,yB,3.0,.32);
  mcTerraceLink(8.4,-4.8,yB,3.0,.32);
  mcTerraceLink(-8.4,4.2,yB,3.0,.32);
  mcTerraceLink(8.4,4.2,yB,3.0,.32);
  mcCourtyardStair(4.3,2.2,-3.2,yC,yB,5.8,{style:'dikengyuan'});

  mcCisternWell(-1.4,yC,-.4,{r:.88});
  mcVentHood(-6.2,yB,-7.6,0,{smoke:true});
  mcVentHood(6.2,yB,-7.6,0,{smoke:true});
  mcVentHood(-6.5,yB,6.7,0,{smoke:true});
  mcDryingMats(0,yB,-7.6,3,1);

  mcTarget(-.8,yC,2.2,'shared-kinship-pit',false);
  mcTarget(0,yC,-7.6,'first-lineage-yaodong',true);
  mcTarget(-8.4,yC,-.3,'second-lineage-yaodong',true);
  mcTarget(8.4,yC,-.3,'third-lineage-yaodong',true);
  mcTarget(-6.5,yC,6.7,'fourth-lineage-yaodong',true);
  mcTarget(6.5,yC,6.7,'fifth-lineage-yaodong',true);
  mcTarget(0,yB,-7.6,'compound-terrace-walk',false);

  mcFurnList([
   ['molu_kang_hearth_bed',-5.2,yC,-7.6,0],
   ['molu_halite_compact_altar',0,yC,-8.2,0],
   ['molu_kang_hearth_bed',5.2,yC,-7.6,0],
   ['molu_kang_hearth_bed',-8.4,yC,-.6,PI/2],
   ['molu_molefelt_divan',8.4,yC,-.6,-PI/2],
   ['molu_kang_hearth_bed',-6.6,yC,6.8,PI],
   ['molu_kang_hearth_bed',6.6,yC,6.8,PI],
   ['molu_hearth_brazier',-1.4,yC,2.4,0]
  ]);
 }
});

/* 16. Middle Single-Family: Three-Arch Yaodong Sunken Family Courtyard */
defBuilding({
 key:'mc_mid_drover_pit',
 name:'Three-Arch Yaodong Sunken Family Courtyard',
 seed:8316,w:22,d:20,h:8.2,budget:104000,cut:true,
 front:{x:0,z:9.2,yaw:0},
 tags:{style:'dikengyuan',wealth:'middle',types:['dwelling-single'],role:'courtyard-house'},
 build(){
  const yC=.38,hB=3.78,yB=yC+hB;
  mcBasePad(0,-.3,19.2,16.8,yC,{style:'dikengyuan',mk:'paving'});
  mcEntryRamp(0,0,9.1,0,yC,7.4,2.7,{style:'dikengyuan'});

  /* Classic 3-Arch Family Yaodong [-9.2..9.2, -8.5..-3.0] */
  mcVaultWing(-9.2,-8.5,9.2,-3.0,yC,hB,{
   style:'dikengyuan',floorMk:'floor',rims:'ns',
   holes:{
    s:[
     {at:-4.2,w:1.8,h:2.24,door:true,name:'drover-bedroom-door'},
     {at:0,w:1.95,h:2.32,door:true,name:'drover-main-yaodong-door'},
     {at:4.2,w:1.8,h:2.24,door:true,name:'drover-pantry-door'}
    ]
   }
  });

  /* West Mule/Talpathere Stall Vault & East Kitchen Vault */
  mcVaultWing(-9.2,-2.6,-4.6,6.2,yC,hB,{
   style:'dikengyuan',rims:'we',
   holes:{e:[{at:1.8,w:1.75,h:2.22,door:true,name:'drover-stall-door'}]}
  });
  mcVaultWing(4.6,-2.6,9.2,6.2,yC,hB,{
   style:'dikengyuan',floorMk:'floor',rims:'we',gapW:1.4,
   holes:{w:[{at:3.0,w:1.75,h:2.22,door:true,name:'drover-kitchen-door'}]}
  });

  mcTerraceLink(-6.9,-2.8,yB,2.8,.32);
  mcTerraceLink(6.9,-2.8,yB,2.8,.32);
  mcCourtyardStair(3.1,4.0,-1.6,yC,yB,4.6,{style:'dikengyuan'});

  mcCisternWell(-1.6,yC,1.6,{r:.8});
  mcVentHood(-4.2,yB,-5.8,0,{smoke:true});
  mcVentHood(6.9,yB,1.8,0,{smoke:true});
  mcDryingMats(1.8,yB,-5.8,2,1);

  mcTarget(-.8,yC,4.2,'family-sunken-courtyard',false);
  mcTarget(0,yC,-5.8,'three-arch-family-yaodong',true);
  mcTarget(-6.9,yC,1.8,'family-beast-stall',true);
  mcTarget(6.9,yC,1.8,'hearth-kitchen-yaodong',true);
  mcTarget(0,yB,-5.8,'family-drying-terrace',false);

  mcFurnList([
   ['molu_kang_hearth_bed',-4.6,yC,-6.0,0],
   ['molu_molefelt_divan',0,yC,-6.4,0],
   ['molu_cucuteni_grain_pithos',4.8,yC,-6.4,0],
   ['molu_claw_shoe_rack',-6.9,yC,.2,PI/2],
   ['molu_hearth_brazier',6.9,yC,.2,0],
   ['molu_curd_press_table',6.9,yC,3.6,-PI/2]
  ]);
 }
});

/* 17. Middle Multi-Family: Shared-Ramp Twin-Family Craft Dikengyuan */
defBuilding({
 key:'mc_mid_artisan_pit',
 name:'Shared-Ramp Twin-Family Craft Dikengyuan',
 seed:8317,w:22,d:20,h:8.4,budget:106000,cut:true,
 front:{x:0,z:9.2,yaw:0},
 tags:{style:'dikengyuan',wealth:'middle',types:['dwelling-multi','shop'],role:'craft-pit',job:'weaving'},
 build(){
  const yC=.38,hB=3.82,yB=yC+hB;
  mcBasePad(0,-.3,19.4,16.8,yC,{style:'dikengyuan',mk:'paving'});
  mcEntryRamp(0,0,9.1,0,yC,7.4,2.8,{style:'dikengyuan'});

  /* Rear Shared Loom & Dyeing Workshop [-9.3..9.3, -8.5..-3.3] */
  mcVaultWing(-9.3,-8.5,9.3,-3.3,yC,hB,{
   style:'dikengyuan',floorMk:'floor',rims:'ns',
   holes:{
    s:[
     {at:-3.6,w:1.85,h:2.26,door:true,name:'artisan-west-loom-door'},
     {at:2.6,w:1.85,h:2.26,door:true,name:'artisan-east-loom-door'}
    ]
   }
  });

  /* West Household A Yaodong & East Household B Yaodong */
  mcVaultWing(-9.3,-2.9,-4.5,6.4,yC,hB,{
   style:'dikengyuan',floorMk:'floor',rims:'we',
   holes:{e:[{at:1.6,w:1.8,h:2.24,door:true,name:'artisan-house-a-door'},{at:-1.4,w:1.2,h:1.2,y:1.0}]}
  });
  mcVaultWing(4.5,-2.9,9.3,6.4,yC,hB,{
   style:'dikengyuan',floorMk:'floor',rims:'we',gapW:1.5,
   holes:{w:[{at:3.2,w:1.8,h:2.24,door:true,name:'artisan-house-b-door'}]}
  });

  mcTerraceLink(-6.9,-3.1,yB,2.8,.32);
  mcTerraceLink(6.9,-3.1,yB,2.8,.32);
  mcCourtyardStair(3.0,4.2,-1.8,yC,yB,4.5,{style:'dikengyuan'});

  mcCisternWell(-1.4,yC,1.6,{r:.8});
  mcVentHood(-6.9,yB,1.8,0,{smoke:true});
  mcVentHood(6.9,yB,1.8,0,{smoke:true});
  mcDryingMats(0,yB,-5.9,3,1);
  mcBanner(-2.2,yB,-3.5,0,3.0,'tapestryIndigo');

  mcTarget(-.8,yC,4.2,'twin-artisan-courtyard',false);
  mcTarget(0,yC,-5.9,'shared-felt-loom-vault',true);
  mcTarget(-6.9,yC,1.8,'west-artisan-family-vault',true);
  mcTarget(6.9,yC,1.8,'east-artisan-family-vault',true);
  mcTarget(0,yB,-5.9,'artisan-roof-terrace',false);

  mcFurnList([
   ['molu_molefelt_divan',-3.8,yC,-6.0,0],
   ['molu_curd_press_table',2.6,yC,-6.0,0],
   ['molu_kang_hearth_bed',-6.9,yC,-.4,PI/2],
   ['molu_cucuteni_grain_pithos',-6.9,yC,4.2,0],
   ['molu_kang_hearth_bed',6.9,yC,-.4,-PI/2],
   ['molu_tapetum_oil_cresset',6.9,yC,4.4,0]
  ]);
 }
});

/* 18. Poor Single-Family: Cut-Bank Single-Arch Yaodong & Forecourt */
defBuilding({
 key:'mc_poor_single_yaodong',
 name:'Cut-Bank Single-Arch Yaodong and Sunken Forecourt',
 seed:8318,w:16,d:16,h:7.4,budget:82000,cut:true,
 front:{x:-1.4,z:7.1,yaw:0},
 tags:{style:'dikengyuan',wealth:'poor',types:['dwelling-single'],role:'dugout'},
 build(){
  const yC=.34,hB=3.64,yB=yC+hB;
  mcBasePad(0,-.3,13.6,13.2,yC,{style:'dikengyuan',mk:'cobble'});
  mcEntryRamp(-1.4,0,7.0,-1.4,yC,5.4,2.5,{style:'dikengyuan'});

  /* Single-Arch Cut-Bank Yaodong Home [-6.5..6.5, -6.6..-.4] */
  mcVaultWing(-6.5,-6.6,6.5,-.4,yC,hB,{
   style:'dikengyuan',floorMk:'floor',rims:'nsw',
   holes:{
    s:[
     {at:-1.4,w:1.9,h:2.26,door:true,name:'single-yaodong-door'},
     {at:2.8,w:1.3,h:1.22,y:.98}
    ]
   }
  });

  /* Low loess retaining cheek walls framing the sunken forecourt + courtyard stair to roof */
  svNoWalk(()=>{
   box('loess',-6.1,yC+.03,2.8,.68,1.35,5.2,P('loess'));
   box('kilnbrick',-6.1,yC+1.38,2.8,.74,.08,5.3,P('kilnbrick'));
  });
  mcCourtyardStair(4.6,5.0,1.2,yC,yB,5.2,{style:'dikengyuan'});
  mcTerraceLink(4.6,-.1,yB,2.2,.48);

  mcVentHood(-2.4,yB,-3.5,0,{smoke:true});
  mcDryingMats(1.8,yB,-3.5,2,1);

  mcTarget(-1.4,yC,2.8,'cut-bank-forecourt',false);
  mcTarget(0,yC,-3.5,'single-arch-yaodong-room',true);
  mcTarget(0,yB,-3.5,'yaodong-earth-roof',false);

  mcFurnList([
   ['molu_kang_hearth_bed',-3.2,yC,-3.8,0],
   ['molu_hearth_brazier',.4,yC,-3.4,0],
   ['molu_cucuteni_grain_pithos',4.0,yC,-4.4,0],
   ['molu_claw_shoe_rack',4.0,yC,-2.0,-PI/2],
   ['molu_tapetum_oil_cresset',-4.2,yC,-1.8,0]
  ]);
 }
});

/* 19. Poor Multi-Family: Six-Cell Herdsman & Delver Sunken Bunk-Pit */
defBuilding({
 key:'mc_poor_diggers_pit',
 name:'Six-Cell Herdsman and Delver Sunken Bunk-Pit',
 seed:8319,w:20,d:18,h:7.8,budget:98000,cut:true,
 front:{x:0,z:8.2,yaw:0},
 tags:{style:'dikengyuan',wealth:'poor',types:['dwelling-multi'],role:'bunk-pit'},
 build(){
  const yC=.36,hB=3.72,yB=yC+hB;
  mcBasePad(0,-.3,17.4,15.2,yC,{style:'dikengyuan',mk:'cobble'});
  mcEntryRamp(0,0,8.1,0,yC,6.5,2.7,{style:'dikengyuan'});

  /* Rear Two-Portal Delver Bunk-Vault [-8.4..8.4, -7.6..-2.6] */
  mcVaultWing(-8.4,-7.6,8.4,-2.6,yC,hB,{
   style:'dikengyuan',floorMk:'floor',rims:'ns',
   holes:{
    s:[
     {at:-3.4,w:1.8,h:2.22,door:true,name:'diggers-north-west-door'},
     {at:2.4,w:1.8,h:2.22,door:true,name:'diggers-north-east-door'}
    ]
   }
  });

  /* West & East Paired Bunk Wings */
  mcVaultWing(-8.4,-2.2,-4.0,5.6,yC,hB,{
   style:'dikengyuan',floorMk:'floor',rims:'we',
   holes:{e:[{at:.4,w:1.7,h:2.2,door:true,name:'diggers-west-a-door'},{at:3.6,w:1.7,h:2.2,door:true,name:'diggers-west-b-door'}]}
  });
  mcVaultWing(4.0,-2.2,8.4,5.6,yC,hB,{
   style:'dikengyuan',floorMk:'floor',rims:'we',gapW:1.4,
   holes:{w:[{at:3.4,w:1.75,h:2.2,door:true,name:'diggers-east-door'}]}
  });

  mcTerraceLink(-6.2,-2.4,yB,2.6,.32);
  mcTerraceLink(6.2,-2.4,yB,2.6,.32);
  mcCourtyardStair(2.6,3.6,-1.2,yC,yB,4.0,{style:'dikengyuan'});

  mcCisternWell(-1.2,yC,1.4,{r:.76});
  mcVentHood(-3.8,yB,-5.1,0,{smoke:true});
  mcVentHood(3.8,yB,-5.1,0,{smoke:true});

  mcTarget(-.8,yC,3.6,'delver-common-pit',false);
  mcTarget(0,yC,-5.1,'north-delver-bunk-vault',true);
  mcTarget(-6.2,yC,1.7,'west-delver-bunk-vault',true);
  mcTarget(6.2,yC,1.7,'east-delver-bunk-vault',true);
  mcTarget(0,yB,-5.1,'bunk-pit-terrace',false);

  mcFurnList([
   ['molu_drover_bunk',-4.8,yC,-5.2,0],
   ['molu_drover_bunk',3.8,yC,-5.2,0],
   ['molu_hearth_brazier',-.4,yC,-5.0,0],
   ['molu_drover_bunk',-6.2,yC,-.2,PI/2],
   ['molu_claw_shoe_rack',-6.2,yC,3.8,PI/2],
   ['molu_drover_bunk',6.2,yC,-.2,-PI/2],
   ['molu_cucuteni_grain_pithos',6.2,yC,3.8,0]
  ]);
 }
});
