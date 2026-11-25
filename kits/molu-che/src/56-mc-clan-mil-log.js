// prefix: mc
// ================================================================= DIKENGYUAN BENCH CLANS — MILL-GRANARY & STEPPE RIM DEFENSE (8312..8313)
// Pastoral & Craft Clan Infrastructure and Defense (style: 'dikengyuan'):
//   8312. mc_loess_mill_pit   — Talpathere-Capstan Rotary Millstone & 10-Year Grain Pit
//   8313. mc_steppe_rim_watch — Clan Seismic-Gong Berm & Rim-Trench Palisade

/* 12. Talpathere-Capstan Rotary Millstone & 10-Year Grain Pit */
defBuilding({
 key:'mc_loess_mill_pit',
 name:'Talpathere-Capstan Rotary Millstone and Ten-Year Grain Pit',
 seed:8312,w:24,d:22,h:8.8,budget:114000,cut:true,
 front:{x:0,z:10.1,yaw:0},
 tags:{style:'dikengyuan',wealth:'middle',types:['industry','infrastructure'],role:'mill',job:'milling'},
 build(){
  const yC=.38,hB=3.86,yB=yC+hB;
  mcBasePad(0,-.4,21.0,18.4,yC,{style:'dikengyuan',mk:'cobble'});
  mcEntryRamp(0,0,10.0,0,yC,8.2,3.0,{style:'dikengyuan'});

  /* Rear Dry-Loess 10-Year Clan Grain Silo Vault [-10.2..10.2, -9.4..-4.0] */
  mcVaultWing(-10.2,-9.4,10.2,-4.0,yC,hB,{
   style:'dikengyuan',vault:true,floorMk:'paving',rims:'ns',
   holes:{
    s:[
     {at:-4.4,w:1.9,h:2.3,door:true,sealed:true,name:'mill-west-silo-door'},
     {at:1.8,w:2.0,h:2.34,door:true,name:'mill-flour-sifter-door'}
    ]
   }
  });

  /* WestTalpathere Rest Stall Wing & East clan Bakery Oven Wing */
  mcVaultWing(-10.2,-3.6,-5.2,7.0,yC,hB,{
   style:'dikengyuan',rims:'we',
   holes:{e:[{at:1.8,w:1.85,h:2.28,door:true,name:'mill-team-stall-door'}]}
  });
  mcVaultWing(5.2,-3.6,10.2,7.0,yC,hB,{
   style:'dikengyuan',floorMk:'floor',rims:'we',gapW:1.5,
   holes:{w:[{at:3.6,w:1.85,h:2.28,door:true,name:'mill-bakery-door'}]}
  });

  mcTerraceLink(-7.7,-3.8,yB,3.0,.32);
  mcTerraceLink(7.7,-3.8,yB,3.0,.32);
  mcCourtyardStair(3.7,4.2,-1.6,yC,yB,5.2,{style:'dikengyuan'});

  /* Central Talpathere rotary basalt capstan mill in open sunken courtyard */
  mcCapstanMill(-1.2,yC,1.2,1.52);
  mcVentHood(7.7,yB,1.6,0,{smoke:true});
  mcVentHood(-4.2,yB,-6.7,0,{smoke:false});
  mcDryingMats(0,yB,-6.7,4,1);

  mcTarget(.6,yC,4.2,'capstan-mill-yard',false);
  mcTarget(0,yC,-6.7,'dry-loess-grain-vault',true);
  mcTarget(-7.7,yC,1.6,'mill-talpathere-vault',true);
  mcTarget(7.7,yC,1.6,'clan-flatbread-bakery',true);
  mcTarget(0,yB,-6.7,'grain-winnowing-terrace',false);

  mcFurnList([
   ['molu_cucuteni_grain_pithos',-6.8,yC,-6.8,0],
   ['molu_cucuteni_grain_pithos',-4.8,yC,-6.8,0],
   ['molu_cucuteni_grain_pithos',-2.8,yC,-6.8,0],
   ['molu_bypass_assay_scale',3.2,yC,-6.6,0],
   ['molu_claw_shoe_rack',-7.7,yC,-.8,PI/2],
   ['molu_amber_grub_trough',-7.7,yC,3.8,PI/2],
   ['molu_hearth_brazier',7.7,yC,-.4,0],
   ['molu_curd_press_table',7.7,yC,4.2,-PI/2]
  ]);
 }
});

/* 13. Clan Seismic-Gong Berm & Rim-Trench Palisade */
defBuilding({
 key:'mc_steppe_rim_watch',
 name:'Clan Seismic-Gong Berm and Rim-Trench Palisade',
 seed:8313,w:22,d:20,h:11.2,budget:108000,cut:true,
 front:{x:0,z:9.2,yaw:0},
 tags:{style:'dikengyuan',wealth:'middle',types:['military'],role:'watchpost',job:'customs'},
 build(){
  const yC=.4,hB=4.1,yB=yC+hB;
  mcBasePad(0,-.3,19.4,16.8,yC,{style:'dikengyuan',mk:'cobble'});
  mcEntryRamp(0,0,9.1,0,yC,7.3,2.8,{style:'dikengyuan'});

  /* Fortified Rear Listening & Garrison Vault [-9.3..9.3, -8.5..-2.9] */
  mcVaultWing(-9.3,-8.5,9.3,-2.9,yC,hB,{
   style:'dikengyuan',mk:'rammed',floorMk:'floor',rims:'nsew',
   holes:{
    s:[
     {at:-3.8,w:1.8,h:2.26,door:true,leafMk:'iron',name:'watch-armoury-door'},
     {at:2.0,w:1.9,h:2.3,door:true,leafMk:'darkcedar',name:'watch-listening-door'}
    ],
    n:[{at:-3.4,w:.95,h:1.1,y:1.25},{at:3.4,w:.95,h:1.1,y:1.25}]
   }
  });

  /* Flanking Rim-Trench Guard Casemates */
  mcVaultWing(-9.3,-2.5,-4.7,6.4,yC,hB,{
   style:'dikengyuan',mk:'rammed',floorMk:'floor',rims:'we',
   holes:{e:[{at:1.8,w:1.75,h:2.24,door:true,name:'watch-west-casemate-door'}]}
  });
  mcVaultWing(4.7,-2.5,9.3,6.4,yC,hB,{
   style:'dikengyuan',mk:'rammed',floorMk:'floor',rims:'we',gapW:1.5,
   holes:{w:[{at:3.2,w:1.75,h:2.24,door:true,name:'watch-east-casemate-door'}]}
  });

  mcTerraceLink(-7.0,-2.7,yB,2.8,.32);
  mcTerraceLink(7.0,-2.7,yB,2.8,.32);
  mcCourtyardStair(3.2,4.2,-1.4,yC,yB,4.7,{style:'dikengyuan'});

  /* Tall Seismic Way-Stone Beacon & Bronze Warning Gong on high berm */
  mcSeismicStone(0,yB,-5.7,4.8,{big:true});
  mcSteelyardAssay(-4.8,yB,-5.7,0,2.1);
  mcBanner(-6.8,yB,5.8,0,3.5,'tapestry');
  mcBanner(6.8,yB,5.8,0,3.5,'tapestryIndigo');

  mcTarget(-.8,yC,2.8,'sunken-muster-trench',false);
  mcTarget(0,yC,-5.7,'seismic-listening-casemate',true);
  mcTarget(-7.0,yC,2.0,'west-spear-casemate',true);
  mcTarget(7.0,yC,2.0,'east-watch-bunkroom',true);
  mcTarget(-2.8,yB,-5.7,'seismic-gong-parapet',false);

  mcFurnList([
   ['molu_seismic_drum_table',2.0,yC,-5.8,0],
   ['molu_claw_shoe_rack',-4.2,yC,-7.2,0],
   ['molu_hearth_brazier',-1.2,yC,-5.6,0],
   ['molu_drover_bunk',-7.0,yC,.2,PI/2],
   ['molu_cucuteni_grain_pithos',-7.0,yC,4.2,0],
   ['molu_drover_bunk',7.0,yC,.4,-PI/2],
   ['molu_tapetum_oil_cresset',7.0,yC,4.4,0]
  ]);
 }
});
