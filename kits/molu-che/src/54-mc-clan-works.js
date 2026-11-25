// prefix: mc
// ================================================================= DIKENGYUAN BENCH CLANS — TALPATHERE, TUBER & CRAFT WORKS (8306..8311)
// Pastoral, Subterranean Gallery-Farming & Craft Works of Moleshelf (style: 'dikengyuan'):
//   8306. mc_talpathere_great_byre — Twin-Ramp Talpathere Plough-Mole Breeding Dikengyuan & Fodder Drift
//   8307. mc_claw_shoe_smithy      — Bronze-and-Iron Talpathere Claw-Shoe Forge & Bellows Pit
//   8308. mc_tuber_seep_gallery    — Luma-Papa Irrigated Loess Seep-Wall Tuber & Mushroom Drift
//   8309. mc_amber_grub_cellar     — Blind Amber-Grub & Fungal-Loaf Composted Gallery Works
//   8310. mc_mole_felt_fullery     — Velvet Mole-Felt Fulling Pit, Curd Dairy & Tallow Chandlery
//   8311. mc_cucuteni_kiln_pit     — Sunken Loess Downdraft Painted-Ware & Storage-Jar Kiln

/* 6. Twin-Ramp Talpathere Plough-Mole Breeding Dikengyuan & Fodder Drift */
defBuilding({
 key:'mc_talpathere_great_byre',
 name:'Twin-Ramp Talpathere Plough-Mole Breeding Dikengyuan and Fodder Drift',
 seed:8306,w:28,d:24,h:8.6,budget:122000,cut:true,
 front:{x:-4.6,z:11.0,yaw:0},
 tags:{style:'dikengyuan',wealth:'middle',types:['farm','infrastructure'],role:'ranch',job:'herding'},
 build(){
  const yC=.38,hB=3.84,yB=yC+hB;
  mcBasePad(0,-.5,24.4,19.8,yC,{style:'dikengyuan',mk:'cobble'});
  /* Twin graded Talpathere herd ramps at x = -4.6 and x = +4.6 so heavy plough-moles never bottleneck! */
  mcEntryRamp(-4.6,0,10.9,-4.6,yC,9.1,2.8,{style:'dikengyuan'});
  mcEntryRamp(4.6,0,10.9,4.6,yC,9.1,2.8,{style:'dikengyuan'});

  /* Rear Breeding & Fodder Drift Vault [-11.8..11.8, -10.2..-4.8] */
  mcVaultWing(-11.8,-10.2,11.8,-4.8,yC,hB,{
   style:'dikengyuan',rims:'ns',
   holes:{
    s:[
     {at:-6.4,w:2.1,h:2.38,door:true,name:'byre-west-drift-door'},
     {at:0,w:2.25,h:2.44,door:true,name:'byre-main-drift-door'},
     {at:6.4,w:2.1,h:2.38,door:true,name:'byre-east-drift-door'}
    ],
    n:[{at:-4.8,w:1.3,h:1.22,y:1.02},{at:4.8,w:1.3,h:1.22,y:1.02}]
   }
  });

  /* West Harness & Salt-Lick Vault [-11.8..-7.0, -4.4..7.8] */
  mcVaultWing(-11.8,-4.4,-7.0,7.8,yC,hB,{
   style:'dikengyuan',floorMk:'floor',rims:'we',
   holes:{e:[{at:1.6,w:1.9,h:2.3,door:true,name:'byre-harness-door'}]}
  });
  /* East Herdsman & Vet Vault [7.0..11.8, -4.4..7.8] */
  mcVaultWing(7.0,-4.4,11.8,7.8,yC,hB,{
   style:'dikengyuan',floorMk:'floor',rims:'we',gapW:1.5,
   holes:{w:[{at:3.8,w:1.9,h:2.3,door:true,name:'byre-herdsman-door'}]}
  });

  mcTerraceLink(-9.4,-4.6,yB,2.8,.32);
  mcTerraceLink(9.4,-4.6,yB,2.8,.32);
  mcCourtyardStair(5.5,4.4,-1.8,yC,yB,7.0,{style:'dikengyuan'});

  /* Open-sky Talpathere stalls with stamp-code sounding boards in sunken yard */
  mcTalpathereStall(-3.2,yC,.6,0,{w:3.4,d:2.5});
  mcTalpathereStall(.8,yC,.6,0,{w:3.4,d:2.5});
  mcCisternWell(0,yC,5.2,{r:.86});
  mcVentHood(-6.2,yB,-7.5,0,{smoke:false});
  mcVentHood(6.2,yB,-7.5,0,{smoke:true});
  mcDryingMats(-9.4,yB,1.8,1,3);
  mcSeismicStone(0,yB,-7.5,2.8,{big:false});

  mcTarget(-2.0,yC,4.8,'sunken-talpathere-paddock',false);
  mcTarget(0,yC,-7.5,'breeding-and-fodder-drift',true);
  mcTarget(-9.4,yC,1.6,'harness-and-claw-vault',true);
  mcTarget(9.4,yC,1.6,'herdsman-watch-vault',true);
  mcTarget(-4.0,yB,-7.5,'fodder-drying-terrace',false);

  mcFurnList([
   ['molu_claw_shoe_rack',-8.2,yC,-7.6,0],
   ['molu_amber_grub_trough',-2.6,yC,-7.6,0],
   ['molu_cucuteni_grain_pithos',3.2,yC,-7.6,0],
   ['molu_cucuteni_grain_pithos',5.2,yC,-7.6,0],
   ['molu_claw_shoe_rack',-9.4,yC,-.8,PI/2],
   ['molu_halite_compact_altar',-9.4,yC,4.6,PI/2],
   ['molu_kang_hearth_bed',9.4,yC,-.8,-PI/2],
   ['molu_tapetum_oil_cresset',9.4,yC,5.4,0]
  ]);
 }
});

/* 7. Bronze-and-Iron Talpathere Claw-Shoe Forge & Bellows Pit */
defBuilding({
 key:'mc_claw_shoe_smithy',
 name:'Bronze-and-Iron Talpathere Claw-Shoe Forge and Bellows Pit',
 seed:8307,w:22,d:20,h:9.2,budget:108000,cut:true,
 front:{x:0,z:9.2,yaw:0},
 tags:{style:'dikengyuan',wealth:'middle',types:['industry','shop'],role:'smithy',job:'smithing'},
 build(){
  const yC=.38,hB=3.84,yB=yC+hB;
  mcBasePad(0,-.3,19.4,16.8,yC,{style:'dikengyuan',mk:'cobble'});
  mcEntryRamp(0,0,9.1,0,yC,7.4,2.9,{style:'dikengyuan'});

  /* Rear Foundry & Bellows Vault [-9.3..9.3, -8.5..-3.1] */
  mcVaultWing(-9.3,-8.5,9.3,-3.1,yC,hB,{
   style:'dikengyuan',rims:'ns',
   holes:{
    s:[
     {at:-3.8,w:1.95,h:2.32,door:true,leafMk:'iron',name:'smithy-hearth-door'},
     {at:2.2,w:1.95,h:2.32,door:true,name:'smithy-fitting-door'}
    ],
    n:[{at:0,w:1.35,h:1.25,y:1.0}]
   }
  });

  /* West Coal/Ingot Store & East Master-Farrier Quarters */
  mcVaultWing(-9.3,-2.7,-4.7,6.4,yC,hB,{
   style:'dikengyuan',rims:'we',
   holes:{e:[{at:1.8,w:1.75,h:2.24,door:true,name:'smithy-coal-door'}]}
  });
  mcVaultWing(4.7,-2.7,9.3,6.4,yC,hB,{
   style:'dikengyuan',floorMk:'floor',rims:'we',gapW:1.5,
   holes:{w:[{at:3.2,w:1.75,h:2.24,door:true,name:'smithy-farrier-door'}]}
  });

  mcTerraceLink(-7.0,-2.9,yB,2.8,.32);
  mcTerraceLink(7.0,-2.9,yB,2.8,.32);
  mcCourtyardStair(3.2,4.2,-1.6,yC,yB,4.7,{style:'dikengyuan'});

  /* Sunken farrier shoeing stock & smelting furnace in yard */
  mcDowndraftKiln(-2.0,yC,1.2,0,1.35);
  mcTalpathereStall(-1.8,yC,4.8,PI,{w:2.8,d:2.1});
  mcVentHood(-4.2,yB,-5.8,0,{smoke:true,scale:1.15});
  mcVentHood(3.2,yB,-5.8,0,{smoke:true});

  mcTarget(.8,yC,3.2,'farrier-shoeing-pit',false);
  mcTarget(0,yC,-5.8,'claw-shoe-forge-vault',true);
  mcTarget(-7.0,yC,1.8,'coal-and-bronze-store',true);
  mcTarget(7.0,yC,1.8,'master-farrier-yaodong',true);
  mcTarget(0,yB,-5.8,'smithy-roof-terrace',false);

  mcFurnList([
   ['molu_claw_forge_anvil',-3.8,yC,-5.6,0],
   ['molu_claw_forge_anvil',1.6,yC,-5.6,0],
   ['molu_claw_shoe_rack',5.8,yC,-7.2,0],
   ['molu_hearth_brazier',-1.0,yC,-6.8,0],
   ['molu_bonduwe_bullion_chest',-7.0,yC,-.4,PI/2],
   ['molu_claw_shoe_rack',-7.0,yC,3.6,PI/2],
   ['molu_kang_hearth_bed',7.0,yC,-.4,-PI/2]
  ]);
 }
});

/* 8. Luma-Papa Irrigated Loess Seep-Wall Tuber & Mushroom Drift */
defBuilding({
 key:'mc_tuber_seep_gallery',
 name:'Luma-Papa Irrigated Loess Seep-Wall Tuber and Mushroom Drift',
 seed:8308,w:24,d:20,h:8.4,budget:110000,cut:true,
 front:{x:0,z:9.2,yaw:0},
 tags:{style:'dikengyuan',wealth:'middle',types:['farm','infrastructure'],role:'tuber-drift',job:'fungiculture'},
 build(){
  const yC=.38,hB=3.8,yB=yC+hB;
  mcBasePad(0,-.3,21.0,16.8,yC,{style:'dikengyuan',mk:'paving'});
  mcEntryRamp(0,0,9.1,0,yC,7.4,2.8,{style:'dikengyuan'});

  /* Central courtyard irrigation seep-flume feeding the lateral damp-wall galleries */
  mcWaterPool(-1.8,1.6,3.2,5.6,yC+.16,.44,{
   curbMk:'dolomite',
   river:{name:'luma-papa-seep-flume',axis:'z',speed:.24}
  });

  /* Deep Rear Damp-Seep Luma-Papa Tuber Gallery [-10.2..10.2, -8.5..-2.9] */
  mcVaultWing(-10.2,-8.5,10.2,-2.9,yC,hB,{
   style:'dikengyuan',rims:'ns',
   holes:{
    s:[
     {at:-4.8,w:1.85,h:2.28,door:true,name:'tuber-west-drift-door'},
     {at:.8,w:1.95,h:2.32,door:true,name:'tuber-main-drift-door'},
     {at:5.8,w:1.85,h:2.28,door:true,name:'tuber-east-drift-door'}
    ]
   }
  });

  /* West Spore-Bed Drift & East Sorting/Drying Vault */
  mcVaultWing(-10.2,-2.5,-5.4,6.4,yC,hB,{
   style:'dikengyuan',rims:'we',
   holes:{e:[{at:2.0,w:1.75,h:2.24,door:true,name:'tuber-mushroom-door'}]}
  });
  mcVaultWing(5.4,-2.5,10.2,6.4,yC,hB,{
   style:'dikengyuan',floorMk:'floor',rims:'we',gapW:1.5,
   holes:{w:[{at:3.2,w:1.75,h:2.24,door:true,name:'tuber-keeper-door'}]}
  });

  mcTerraceLink(-7.8,-2.7,yB,2.8,.32);
  mcTerraceLink(7.8,-2.7,yB,2.8,.32);
  mcCourtyardStair(3.8,4.2,-1.4,yC,yB,5.4,{style:'dikengyuan'});

  mcVentHood(-5.4,yB,-5.7,0,{smoke:false});
  mcVentHood(5.4,yB,-5.7,0,{smoke:false});
  mcDryingMats(-2.4,yB,-5.7,3,1);
  mcDryingMats(-7.8,yB,2.0,1,3);

  mcTarget(1.2,yC,4.6,'seep-irrigation-court',false);
  mcTarget(0,yC,-5.7,'luma-papa-tuber-gallery',true);
  mcTarget(-7.8,yC,2.0,'mushroom-seep-cellar',true);
  mcTarget(7.8,yC,2.0,'tuber-sorting-vault',true);
  mcTarget(0,yB,-5.7,'tuber-sun-drying-terrace',false);

  mcFurnList([
   ['molu_tuber_seep_planter',-5.6,yC,-6.2,0],
   ['molu_tuber_seep_planter',0,yC,-6.2,0],
   ['molu_tuber_seep_planter',5.6,yC,-6.2,0],
   ['molu_cucuteni_grain_pithos',-8.2,yC,-4.2,0],
   ['molu_tuber_seep_planter',-7.8,yC,-.2,PI/2],
   ['molu_amber_grub_trough',-7.8,yC,4.0,PI/2],
   ['molu_cucuteni_grain_pithos',7.8,yC,-.4,0],
   ['molu_tapetum_oil_cresset',7.8,yC,4.4,0]
  ]);
 }
});

/* 9. Blind Amber-Grub & Fungal-Loaf Composted Gallery Works */
defBuilding({
 key:'mc_amber_grub_cellar',
 name:'Blind Amber-Grub and Fungal-Loaf Composted Gallery Works',
 seed:8309,w:22,d:18,h:8.2,budget:102000,cut:true,
 front:{x:0,z:8.2,yaw:0},
 tags:{style:'dikengyuan',wealth:'poor',types:['farm','industry'],role:'grub-cellar',job:'farming'},
 build(){
  const yC=.36,hB=3.76,yB=yC+hB;
  mcBasePad(0,-.3,19.2,15.2,yC,{style:'dikengyuan',mk:'cobble'});
  mcEntryRamp(0,0,8.1,0,yC,6.5,2.7,{style:'dikengyuan'});

  /* Warm dark rear Amber-Grub Breeding Drift [-9.2..9.2, -7.7..-2.3] (sealed warm drift!) */
  mcVaultWing(-9.2,-7.7,9.2,-2.3,yC,hB,{
   style:'dikengyuan',vault:true,rims:'ns',
   holes:{
    s:[
     {at:-3.8,w:1.8,h:2.24,door:true,sealed:true,name:'grub-west-cellar-door'},
     {at:2.0,w:1.85,h:2.26,door:true,sealed:true,name:'grub-main-cellar-door'}
    ]
   }
  });

  /* West Composted Bedding Vault & East Fungal-Loaf Bakehouse */
  mcVaultWing(-9.2,-1.9,-4.6,5.6,yC,hB,{
   style:'dikengyuan',rims:'we',
   holes:{e:[{at:1.8,w:1.75,h:2.22,door:true,name:'grub-compost-door'}]}
  });
  mcVaultWing(4.6,-1.9,9.2,5.6,yC,hB,{
   style:'dikengyuan',floorMk:'floor',rims:'we',gapW:1.4,
   holes:{w:[{at:2.8,w:1.75,h:2.22,door:true,name:'grub-loaf-oven-door'}]}
  });

  mcTerraceLink(-6.9,-2.1,yB,2.8,.32);
  mcTerraceLink(6.9,-2.1,yB,2.8,.32);
  mcCourtyardStair(3.1,3.6,-1.0,yC,yB,4.6,{style:'dikengyuan'});

  mcVentHood(-4.4,yB,-5.0,0,{smoke:true});
  mcVentHood(4.4,yB,-5.0,0,{smoke:true});
  mcDryingMats(-6.9,yB,1.8,1,2);

  mcTarget(-.8,yC,2.4,'compost-courtyard',false);
  mcTarget(0,yC,-5.0,'blind-amber-grub-drift',true);
  mcTarget(-6.9,yC,1.8,'talpathere-compost-cell',true);
  mcTarget(6.9,yC,1.8,'fungal-loaf-press-room',true);
  mcTarget(0,yB,-5.0,'grub-cellar-terrace',false);

  mcFurnList([
   ['molu_amber_grub_trough',-5.2,yC,-5.4,0],
   ['molu_amber_grub_trough',-.4,yC,-5.4,0],
   ['molu_amber_grub_trough',4.6,yC,-5.4,0],
   ['molu_tapetum_oil_cresset',2.2,yC,-3.8,0],
   ['molu_tuber_seep_planter',-6.9,yC,1.8,PI/2],
   ['molu_curd_press_table',6.9,yC,.4,-PI/2],
   ['molu_hearth_brazier',6.9,yC,3.8,0]
  ]);
 }
});

/* 10. Velvet Mole-Felt Fulling Pit, Curd Dairy & Tallow Chandlery */
defBuilding({
 key:'mc_mole_felt_fullery',
 name:'Velvet Mole-Felt Fulling Pit Curd Dairy and Tallow Chandlery',
 seed:8310,w:22,d:20,h:8.6,budget:108000,cut:true,
 front:{x:0,z:9.2,yaw:0},
 tags:{style:'dikengyuan',wealth:'middle',types:['industry','shop'],role:'fullery',job:'dairy'},
 build(){
  const yC=.38,hB=3.82,yB=yC+hB;
  mcBasePad(0,-.3,19.4,16.8,yC,{style:'dikengyuan',mk:'paving'});
  mcEntryRamp(0,0,9.1,0,yC,7.4,2.8,{style:'dikengyuan'});

  /* Rear Mole-Felt Fulling & Dyeing Vault [-9.3..9.3, -8.5..-3.1] */
  mcVaultWing(-9.3,-8.5,9.3,-3.1,yC,hB,{
   style:'dikengyuan',floorMk:'floor',rims:'ns',
   holes:{
    s:[
     {at:-3.8,w:1.85,h:2.28,door:true,name:'fullery-felt-door'},
     {at:2.2,w:1.85,h:2.28,door:true,name:'fullery-dairy-door'}
    ],
    n:[{at:-3.2,w:1.25,h:1.25,y:1.0},{at:3.2,w:1.25,h:1.25,y:1.0}]
   }
  });

  /* West Curd-Cheese Cellar & East Tallow-Lamp Chandlery */
  mcVaultWing(-9.3,-2.7,-4.7,6.4,yC,hB,{
   style:'dikengyuan',rims:'we',
   holes:{e:[{at:1.8,w:1.75,h:2.24,door:true,name:'fullery-curd-door'}]}
  });
  mcVaultWing(4.7,-2.7,9.3,6.4,yC,hB,{
   style:'dikengyuan',floorMk:'floor',rims:'we',gapW:1.5,
   holes:{w:[{at:3.2,w:1.75,h:2.24,door:true,name:'fullery-tallow-door'}]}
  });

  mcTerraceLink(-7.0,-2.9,yB,2.8,.32);
  mcTerraceLink(7.0,-2.9,yB,2.8,.32);
  mcCourtyardStair(3.2,4.2,-1.6,yC,yB,4.7,{style:'dikengyuan'});

  /* Sunken stone fulling-vat in courtyard + dyed mole-felt drying racks on terrace */
  mcWaterPool(-2.0,1.8,3.2,3.4,yC+.16,.42,{curbMk:'dolomite'});
  mcVentHood(-4.6,yB,-5.8,0,{smoke:true});
  mcDryingMats(0,yB,-5.8,3,1);
  mcBanner(-6.8,yB,5.8,0,3.2,'feltCrimson');
  mcBanner(6.8,yB,5.8,0,3.2,'feltOchre');

  mcTarget(1.0,yC,3.6,'fulling-vat-courtyard',false);
  mcTarget(0,yC,-5.8,'mole-felt-fulling-hall',true);
  mcTarget(-7.0,yC,1.8,'curd-ripening-cellar',true);
  mcTarget(7.0,yC,1.8,'tallow-lamp-chandlery',true);
  mcTarget(0,yB,-5.8,'felt-stretching-terrace',false);

  mcFurnList([
   ['molu_curd_press_table',-4.2,yC,-5.8,0],
   ['molu_molefelt_divan',2.2,yC,-6.4,0],
   ['molu_cucuteni_grain_pithos',6.2,yC,-6.4,0],
   ['molu_curd_press_table',-7.0,yC,-.4,PI/2],
   ['molu_cucuteni_grain_pithos',-7.0,yC,3.8,0],
   ['molu_tapetum_oil_cresset',7.0,yC,-.4,0],
   ['molu_hearth_brazier',7.0,yC,4.0,0]
  ]);
 }
});

/* 11. Sunken Loess Downdraft Painted-Ware & Storage-Jar Kiln */
defBuilding({
 key:'mc_cucuteni_kiln_pit',
 name:'Sunken Loess Downdraft Painted-Ware and Storage-Jar Kiln',
 seed:8311,w:22,d:20,h:9.4,budget:108000,cut:true,
 front:{x:0,z:9.2,yaw:0},
 tags:{style:'dikengyuan',wealth:'middle',types:['industry','shop'],role:'kiln',job:'pottery'},
 build(){
  const yC=.38,hB=3.84,yB=yC+hB;
  mcBasePad(0,-.3,19.4,16.8,yC,{style:'dikengyuan',mk:'cobble'});
  mcEntryRamp(0,0,9.1,0,yC,7.4,2.8,{style:'dikengyuan'});

  /* Rear Wheel-Throwing & Mineral-Pigment Painting Yaodong [-9.3..9.3, -8.5..-3.1] */
  mcVaultWing(-9.3,-8.5,9.3,-3.1,yC,hB,{
   style:'dikengyuan',floorMk:'floor',rims:'ns',
   holes:{
    s:[
     {at:-3.8,w:1.85,h:2.28,door:true,name:'kiln-throwing-door'},
     {at:2.4,w:1.85,h:2.28,door:true,name:'kiln-pigment-door'}
    ],
    n:[{at:-3.2,w:1.25,h:1.25,y:1.0},{at:3.2,w:1.25,h:1.25,y:1.0}]
   }
  });

  /* West Clay-Levigation Cellar & East Pithos Showroom */
  mcVaultWing(-9.3,-2.7,-4.7,6.4,yC,hB,{
   style:'dikengyuan',rims:'we',
   holes:{e:[{at:2.2,w:1.75,h:2.24,door:true,name:'kiln-clay-door'}]}
  });
  mcVaultWing(4.7,-2.7,9.3,6.4,yC,hB,{
   style:'dikengyuan',floorMk:'floor',rims:'we',gapW:1.5,
   holes:{w:[{at:3.2,w:1.75,h:2.24,door:true,name:'kiln-pithos-door'}]}
  });

  mcTerraceLink(-7.0,-2.9,yB,2.8,.32);
  mcTerraceLink(7.0,-2.9,yB,2.8,.32);
  mcCourtyardStair(3.2,4.2,-1.6,yC,yB,4.7,{style:'dikengyuan'});

  /* Monumental sunken Cucuteni downdraft dome kiln in the open pit */
  mcDowndraftKiln(-1.8,yC,1.4,0,1.72);
  mcVentHood(-4.8,yB,-5.8,0,{smoke:true,scale:1.1});
  mcVentHood(4.8,yB,-5.8,0,{smoke:true});
  mcDryingMats(-7.0,yB,1.8,1,2);

  mcTarget(1.2,yC,3.8,'downdraft-kiln-yard',false);
  mcTarget(0,yC,-5.8,'potter-and-pigment-vault',true);
  mcTarget(-7.0,yC,1.8,'clay-aging-vault',true);
  mcTarget(7.0,yC,1.8,'painted-pithos-store',true);
  mcTarget(0,yB,-5.8,'greenware-drying-terrace',false);

  mcFurnList([
   ['molu_cucuteni_grain_pithos',-6.2,yC,-6.4,0],
   ['molu_cucuteni_grain_pithos',-4.4,yC,-6.4,0],
   ['molu_bypass_assay_scale',1.8,yC,-5.8,0],
   ['molu_amber_tally_rack',6.2,yC,-7.2,0],
   ['molu_cucuteni_grain_pithos',-7.0,yC,-.4,0],
   ['molu_cucuteni_grain_pithos',7.0,yC,-.6,0],
   ['molu_cucuteni_grain_pithos',7.0,yC,1.6,0],
   ['molu_tapetum_oil_cresset',7.0,yC,4.2,0]
  ]);
 }
});
