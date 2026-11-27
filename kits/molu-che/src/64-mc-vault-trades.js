// prefix: mc
// ================================================================= BONDUWE BONDED STRONG-VAULTS — MASONRY, SLEDWRIGHT & SALT TRADES (8324..8326)
// Overland Bypass & Vault Construction Works (style: 'bonduwe'):
//   8324. mc_lime_and_ashlar_yard  — Karst-Rim Lime-Kiln, Millstone & Vault-Arch Mason Yard
//   8325. mc_sled_wright_yard      — Bronze-Runner Caravan Sled, Cooperage & Cordage Pit
//   8326. mc_salt_and_jerky_cellar — Halite Salt-Lick Store & Cured Meat/Cheese Cold-Loess Vault

/* 24. Karst-Rim Lime-Kiln, Millstone & Vault-Arch Mason Yard */
defBuilding({
 key:'mc_lime_and_ashlar_yard',
 name:'Karst-Rim Lime-Kiln Millstone and Vault-Arch Mason Yard',
 seed:8324,w:24,d:20,h:9.0,budget:110000,cut:true,
 front:{x:0,z:9.2,yaw:0},
 tags:{style:'bonduwe',wealth:'middle',types:['industry','shop'],role:'mason-yard',job:'quarrying'},
 build(){
  const yC=.38,hB=3.84,yB=yC+hB;
  mcBasePad(0,-.3,21.0,16.8,yC,{style:'bonduwe',mk:'cobble'});
  mcEntryRamp(0,0,9.1,0,yC,7.4,3.0,{style:'bonduwe'});

  /* Rear Vault-Voussoir & Basalt Seismic-Stone Dressing Hall [-10.2..10.2, -8.5..-3.1] */
  mcVaultWing(-10.2,-8.5,10.2,-3.1,yC,hB,{
   style:'bonduwe',mk:'dolomite',rims:'ns',
   holes:{
    s:[
     {at:-4.2,w:1.95,h:2.3,door:true,name:'mason-voussoir-door'},
     {at:2.2,w:1.95,h:2.3,door:true,name:'mason-lime-slake-door'}
    ],
    n:[{at:-3.4,w:1.3,h:1.25,y:1.0},{at:3.4,w:1.3,h:1.25,y:1.0}]
   }
  });

  /* West Slaked Hydraulic-Lime Store & East Master-Mason Office */
  mcVaultWing(-10.2,-2.7,-5.4,6.4,yC,hB,{
   style:'bonduwe',rims:'we',
   holes:{e:[{at:1.8,w:1.8,h:2.24,door:true,name:'mason-lime-cellar-door'}]}
  });
  mcVaultWing(5.4,-2.7,10.2,6.4,yC,hB,{
   style:'bonduwe',floorMk:'floor',rims:'we',gapW:1.5,
   holes:{w:[{at:3.2,w:1.8,h:2.24,door:true,name:'mason-office-door'}]}
  });

  mcTerraceLink(-7.8,-2.9,yB,2.8,.32);
  mcTerraceLink(7.8,-2.9,yB,2.8,.32);
  mcCourtyardStair(3.8,4.2,-1.6,yC,yB,5.4,{style:'bonduwe'});

  /* Karst hydraulic-lime calcining kiln + dressed dolomite block stacks in yard */
  mcDowndraftKiln(-2.0,yC,1.4,0,1.65);
  svNoWalk(()=>{
   box('dolomite',1.6,yC+.03,1.2,1.6,.54,1.2,P('dolomite'));
   box('basalt',1.6,yC+.57,1.2,1.2,.42,.96,P('basalt'));
  });
  mcVentHood(-4.6,yB,-5.8,0,{smoke:true});

  mcTarget(.6,yC,4.2,'ashlar-and-lime-kiln-yard',false);
  mcTarget(0,yC,-5.8,'voussoir-stonecutting-vault',true);
  mcTarget(-7.8,yC,1.8,'hydraulic-lime-store',true);
  mcTarget(7.8,yC,1.8,'master-mason-vault',true);
  mcTarget(0,yB,-5.8,'mason-terrace',false);

  mcFurnList([
   ['molu_claw_forge_anvil',-4.2,yC,-5.8,0],
   ['molu_seismic_drum_table',2.0,yC,-5.8,0],
   ['molu_cucuteni_grain_pithos',-7.8,yC,-.4,0],
   ['molu_cucuteni_grain_pithos',-7.8,yC,3.6,0],
   ['molu_amber_tally_rack',7.8,yC,-.6,-PI/2],
   ['molu_kang_hearth_bed',7.8,yC,3.6,PI],
   ['molu_tapetum_oil_cresset',6.2,yC,-4.4,0]
  ]);
 }
});

/* 25. Bronze-Runner Caravan Sled, Cooperage & Cordage Pit */
defBuilding({
 key:'mc_sled_wright_yard',
 name:'Bronze-Runner Caravan Sled Cooperage and Cordage Pit',
 seed:8325,w:24,d:20,h:8.6,budget:110000,cut:true,
 front:{x:0,z:9.2,yaw:0},
 tags:{style:'bonduwe',wealth:'middle',types:['industry','shop'],role:'sled-yard',job:'carpentry'},
 build(){
  const yC=.38,hB=3.82,yB=yC+hB;
  mcBasePad(0,-.3,21.0,16.8,yC,{style:'bonduwe',mk:'cobble'});
  mcEntryRamp(0,0,9.1,0,yC,7.4,3.1,{style:'bonduwe'});

  /* Rear Heavy Cedar Sled-Joinery & Bronze-Runner Fitting Hall [-10.2..10.2, -8.5..-3.1] */
  mcVaultWing(-10.2,-8.5,10.2,-3.1,yC,hB,{
   style:'bonduwe',floorMk:'floor',rims:'ns',
   holes:{
    s:[
     {at:-4.2,w:2.05,h:2.34,door:true,name:'sledwright-west-bay-door'},
     {at:2.2,w:2.05,h:2.34,door:true,name:'sledwright-east-bay-door'}
    ],
    n:[{at:0,w:1.35,h:1.25,y:1.0}]
   }
  });

  /* West Rope-Walk / Harness Loft & East Cooperage Vault */
  mcVaultWing(-10.2,-2.7,-5.4,6.4,yC,hB,{
   style:'bonduwe',floorMk:'floor',rims:'we',
   holes:{e:[{at:1.8,w:1.8,h:2.24,door:true,name:'sledwright-cordage-door'}]}
  });
  mcVaultWing(5.4,-2.7,10.2,6.4,yC,hB,{
   style:'bonduwe',floorMk:'floor',rims:'we',gapW:1.5,
   holes:{w:[{at:3.2,w:1.8,h:2.24,door:true,name:'sledwright-cooper-door'}]}
  });

  mcTerraceLink(-7.8,-2.9,yB,2.8,.32);
  mcTerraceLink(7.8,-2.9,yB,2.8,.32);
  mcCourtyardStair(3.8,4.2,-1.6,yC,yB,5.4,{style:'bonduwe'});

  /* Freight sleds under repair in sunken assembly yard */
  mcCaravanSled(-2.0,yC,1.4,.2,{load:'bullion'});
  mcCaravanSled(1.2,yC,3.8,PI*.5,{load:'silk'});
  mcVentHood(-4.8,yB,-5.8,0,{smoke:true});
  mcDryingMats(1.8,yB,-5.8,2,1);

  mcTarget(0,yC,-.8,'sled-assembly-apron',false);
  mcTarget(0,yC,-5.8,'sled-joinery-and-runner-hall',true);
  mcTarget(-7.8,yC,1.8,'haulage-cordage-vault',true);
  mcTarget(7.8,yC,1.8,'cask-cooperage-vault',true);
  mcTarget(0,yB,-5.8,'seasoned-cedar-terrace',false);

  mcFurnList([
   ['molu_claw_forge_anvil',-4.6,yC,-5.8,0],
   ['molu_claw_shoe_rack',0,yC,-7.2,0],
   ['molu_bypass_assay_scale',4.4,yC,-5.8,0],
   ['molu_claw_shoe_rack',-7.8,yC,-.4,PI/2],
   ['molu_molefelt_divan',-7.8,yC,3.8,PI/2],
   ['molu_cucuteni_grain_pithos',7.8,yC,-.4,0],
   ['molu_hearth_brazier',7.8,yC,3.8,0]
  ]);
 }
});

/* 26. Halite Salt-Lick Store & Cured Meat/Cheese Cold-Loess Vault */
defBuilding({
 key:'mc_salt_and_jerky_cellar',
 name:'Halite Salt-Lick Store and Cured Meat Cold-Loess Vault',
 seed:8326,w:22,d:20,h:8.4,budget:108000,cut:true,
 front:{x:0,z:9.2,yaw:0},
 tags:{style:'bonduwe',wealth:'middle',types:['industry','infrastructure'],role:'salt-vault',job:'salt'},
 build(){
  const yC=.38,hB=3.82,yB=yC+hB;
  mcBasePad(0,-.3,19.4,16.8,yC,{style:'bonduwe',mk:'paving'});
  mcEntryRamp(0,0,9.1,0,yC,7.4,2.8,{style:'bonduwe'});

  /* Cold +14 C Sealed Halite & Cured-Provision Strongroom [-9.3..9.3, -8.5..-3.1] */
  mcVaultWing(-9.3,-8.5,9.3,-3.1,yC,hB,{
   style:'bonduwe',vault:true,floorMk:'paving',rims:'ns',
   holes:{
    s:[
     {at:-3.8,w:1.85,h:2.28,door:true,sealed:true,leafMk:'iron',name:'salt-halite-vault-door'},
     {at:2.2,w:1.85,h:2.28,door:true,sealed:true,leafMk:'iron',name:'salt-jerky-vault-door'}
    ]
   }
  });

  /* West Brining/Butchery Vault & East Salt-Tax Tally Room */
  mcVaultWing(-9.3,-2.7,-4.7,6.4,yC,hB,{
   style:'bonduwe',rims:'we',
   holes:{e:[{at:1.8,w:1.75,h:2.24,door:true,name:'salt-brining-door'}]}
  });
  mcVaultWing(4.7,-2.7,9.3,6.4,yC,hB,{
   style:'bonduwe',floorMk:'floor',rims:'we',gapW:1.5,
   holes:{w:[{at:3.2,w:1.75,h:2.24,door:true,name:'salt-tally-door'}]}
  });

  mcTerraceLink(-7.0,-2.9,yB,2.8,.32);
  mcTerraceLink(7.0,-2.9,yB,2.8,.32);
  mcCourtyardStair(3.2,4.2,-1.6,yC,yB,4.7,{style:'bonduwe'});

  /* Stacked crystalline halite blocks on stone pallet in yard */
  svNoWalk(()=>{
   box('dolomite',-1.8,yC+.03,1.6,2.2,.18,1.6,P('dolomite'));
   box('halite',-2.2,yC+.21,1.6,.82,.56,.92,P('halite'));
   box('halite',-1.3,yC+.21,1.6,.78,.48,.88,P('halite'));
  });
  mcVentHood(-4.6,yB,-5.8,0,{smoke:false});
  mcVentHood(-7.0,yB,1.8,0,{smoke:true});
  mcDryingMats(1.2,yB,-5.8,3,1);

  mcTarget(.8,yC,3.8,'halite-packing-court',false);
  mcTarget(0,yC,-5.8,'cold-halite-and-jerky-vault',true);
  mcTarget(-7.0,yC,1.8,'salting-and-smoke-cellar',true);
  mcTarget(7.0,yC,1.8,'salt-compact-tally-room',true);
  mcTarget(0,yB,-5.8,'jerky-curing-terrace',false);

  mcFurnList([
   ['molu_halite_compact_altar',-4.2,yC,-6.2,0],
   ['molu_cucuteni_grain_pithos',0,yC,-6.4,0],
   ['molu_cucuteni_grain_pithos',4.2,yC,-6.4,0],
   ['molu_tapetum_oil_cresset',2.0,yC,-4.6,0],
   ['molu_curd_press_table',-7.0,yC,.2,PI/2],
   ['molu_hearth_brazier',-7.0,yC,4.0,0],
   ['molu_bypass_assay_scale',7.0,yC,.2,-PI/2],
   ['molu_amber_tally_rack',7.0,yC,4.0,-PI/2]
  ]);
 }
});
