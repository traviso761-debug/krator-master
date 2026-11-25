// prefix: mc
// ================================================================= DIKENGYUAN BENCH CLANS — CIVIC, SACRED & HOSPITALITY PITS (8301..8305)
// Pastoral, Tuber-Gallery & Craft Clans of Moleshelf (style: 'dikengyuan'):
//   8301. mc_clan_great_pit      — Grand 4-Wing Clan-Chief Dikengyuan, Ancestor Hearth-Vault & Seismic Drum-Court
//   8302. mc_elder_council_pit   — Lonko Clan-Council Sunken Amphitheatre & Salt-Compact Hall
//   8303. mc_ancestor_echo_shrine— Subterranean Seismic-Stone & Tapetum-Lamp Ancestor Sanctuary
//   8304. mc_deep_cistern_bath   — Hydraulic-Lime Rain-Cistern, Steam-Vault & Healer's Clinic
//   8305. mc_pit_tavern_inn      — Sunken Hearth-Pit Drovers' Tavern & Tuber-Ale Cellar

/* Shared courtyard-to-terrace stone flight & cantilevered dolomite landing bridging yCourt -> yBench with >= 8 cm wall clearance. */
function mcCourtyardStair(xStair,zFoot,zTop,yCourt,yBench,xWingEdge,o){
 o=o||{};
 mcStair(xStair,yCourt,zFoot,xStair,yBench,zTop,1.34,{openUnder:true,style:o.style});
 const uz=zTop>=zFoot?1:-1,zLand=zTop+uz*.52;
 const xA=Math.min(xStair-.62,xWingEdge),xB=Math.max(xStair+.62,xWingEdge);
 const sgn=xWingEdge>=xStair?1:-1;
 const vx0=sgn>0?xStair-.62:xWingEdge+.08,vx1=sgn>0?xWingEdge-.08:xStair+.62;
 if(vx1-vx0>.2){
  mcNoCut(()=>svNoWalk(()=>{
   box('dolomite',(vx0+vx1)/2,yBench-.19,zLand,vx1-vx0,.165,1.45,P('dolomite'));
  }));
 }
 wkPad((xA+xB)/2,zLand,Math.abs(xB-xA)+1.5,2.2,yBench);
}

/* 1. Grand 4-Wing Clan-Chief Dikengyuan, Ancestor Hearth-Vault & Seismic Drum-Court */
defBuilding({
 key:'mc_clan_great_pit',
 name:'Grand Four-Wing Clan-Chief Dikengyuan and Seismic Drum-Court',
 seed:8301,w:28,d:26,h:10.5,budget:130000,cut:true,
 front:{x:0,z:12.0,yaw:0},
 tags:{style:'dikengyuan',wealth:'rich',types:['civic','military'],role:'clan-hall',job:'worship'},
 build(){
  const yC=.4,hB=4.0,yB=yC+hB;
  mcBasePad(0,-.6,24.6,21.6,yC,{style:'dikengyuan',mk:'paving'});
  mcEntryRamp(0,0,11.9,0,yC,9.9,3.1,{style:'dikengyuan'});

  /* Rear (-z) Ancestor & Lonko Great Hearth-Vault [-12.0..12.0, -11.2..-5.6] */
  mcVaultWing(-12.0,-11.2,12.0,-5.6,yC,hB,{
   style:'dikengyuan',floorMk:'floor',rims:'ns',
   holes:{
    s:[
     {at:-5.2,w:1.95,h:2.35,door:true,name:'great-pit-west-hearth-door'},
     {at:0,w:2.2,h:2.48,door:true,pierMk:'dolomite',leafMk:'darkcedar',name:'great-pit-ancestor-door'},
     {at:5.2,w:1.95,h:2.35,door:true,name:'great-pit-east-hearth-door'}
    ],
    n:[{at:-4.6,w:1.35,h:1.3,y:1.0},{at:4.6,w:1.35,h:1.3,y:1.0}]
   }
  });

  /* West (-x) Feast & Kinship Yaodong Wing [-12.0..-6.6, -5.2..4.4] */
  mcVaultWing(-12.0,-5.2,-6.6,4.4,yC,hB,{
   style:'dikengyuan',floorMk:'floor',rims:'we',
   holes:{
    e:[
     {at:-2.4,w:1.85,h:2.28,door:true,name:'great-pit-feast-door'},
     {at:1.8,w:1.3,h:1.28,y:.98}
    ],
    w:[{at:-.4,w:1.3,h:1.28,y:.98}]
   }
  });

  /* East (+x) Armoury & Stamp-Code Records Wing [6.6..12.0, -5.2..4.4] */
  mcVaultWing(6.6,-5.2,12.0,4.4,yC,hB,{
   style:'dikengyuan',floorMk:'floor',rims:'we',gapW:1.5,
   holes:{
    w:[
     {at:2.0,w:1.85,h:2.28,door:true,name:'great-pit-records-door'}
    ],
    e:[{at:-.4,w:1.3,h:1.28,y:.98}]
   }
  });

  /* Split South (+z) Gate-Guard Yaodong Wings flanking the 3.1 m Talpathere entry trench */
  mcVaultWing(-12.0,4.8,-2.1,9.8,yC,hB,{
   style:'dikengyuan',floorMk:'floor',rims:'ns',
   holes:{
    n:[{at:-4.3,w:1.75,h:2.25,door:true,name:'great-pit-sw-guard-door'}],
    s:[{at:-7.0,w:1.3,h:1.25,y:1.0}]
   }
  });
  mcVaultWing(2.1,4.8,12.0,9.8,yC,hB,{
   style:'dikengyuan',floorMk:'floor',rims:'ns',
   holes:{
    n:[{at:4.3,w:1.75,h:2.25,door:true,name:'great-pit-se-guard-door'}],
    s:[{at:7.0,w:1.3,h:1.25,y:1.0}]
   }
  });

  /* Terrace joint bridges & courtyard stair up to yBench */
  mcTerraceLink(-9.3,-5.4,yB,3.4,.32);
  mcTerraceLink(9.3,-5.4,yB,3.4,.32);
  mcTerraceLink(-9.3,4.6,yB,3.4,.32);
  mcTerraceLink(9.3,4.6,yB,3.4,.32);
  mcCourtyardStair(5.1,2.6,-3.2,yC,yB,6.6,{style:'dikengyuan'});

  /* Central open-sky Seismic Drum-Court & Steppe Terrace Landmarks */
  mcSeismicStone(0,yC,-.4,3.5,{big:true});
  mcCisternWell(-3.4,yC,1.6,{r:.85});
  mcVentHood(-7.6,yB,-8.4,0,{smoke:true});
  mcVentHood(7.6,yB,-8.4,0,{smoke:true});
  mcSeismicStone(-9.4,yB,7.3,3.1,{big:false});
  mcDryingMats(-9.3,yB,-.4,2,2);
  mcBanner(-3.2,yB,9.1,0,3.5,'tapestry');
  mcBanner(3.2,yB,9.1,0,3.5,'tapestryIndigo');

  mcTarget(0,yC,2.2,'sunken-seismic-drum-court',false);
  mcTarget(0,yC,-8.4,'ancestor-hearth-vault',true);
  mcTarget(-9.3,yC,-.4,'west-feast-yaodong',true);
  mcTarget(9.3,yC,-.4,'east-records-yaodong',true);
  mcTarget(-7.0,yC,7.3,'sw-guard-yaodong',true);
  mcTarget(7.0,yC,7.3,'se-guard-yaodong',true);
  mcTarget(0,yB,-8.4,'upper-loess-bench-terrace',false);

  mcFurnList([
   ['molu_halite_compact_altar',0,yC,-9.6,0],
   ['molu_molefelt_divan',-4.6,yC,-8.8,0],
   ['molu_molefelt_divan',4.6,yC,-8.8,0],
   ['molu_seismic_drum_table',0,yC,-7.2,0],
   ['molu_hearth_brazier',-9.2,yC,-1.6,0],
   ['molu_kang_hearth_bed',-9.4,yC,2.0,PI],
   ['molu_amber_tally_rack',9.4,yC,-2.8,-PI/2],
   ['molu_claw_shoe_rack',9.4,yC,.4,-PI/2],
   ['molu_drover_bunk',-7.2,yC,7.4,0],
   ['molu_tapetum_oil_cresset',7.2,yC,7.4,0]
  ]);
 }
});

/* 2. Lonko Clan-Council Sunken Amphitheatre & Salt-Compact Hall */
defBuilding({
 key:'mc_elder_council_pit',
 name:'Lonko Clan-Council Sunken Amphitheatre and Salt-Compact Hall',
 seed:8302,w:24,d:22,h:9.6,budget:115000,cut:true,
 front:{x:0,z:10.1,yaw:0},
 tags:{style:'dikengyuan',wealth:'rich',types:['civic','military'],role:'council-hall',job:'scribing'},
 build(){
  const yC=.38,hB=3.88,yB=yC+hB;
  mcBasePad(0,-.4,21.0,18.4,yC,{style:'dikengyuan',mk:'paving'});
  mcEntryRamp(0,0,10.0,0,yC,8.2,2.9,{style:'dikengyuan'});

  /* Rear Salt-Compact Chamber [-10.2..10.2, -9.4..-4.2] */
  mcVaultWing(-10.2,-9.4,10.2,-4.2,yC,hB,{
   style:'dikengyuan',floorMk:'floor',rims:'ns',
   holes:{
    s:[
     {at:-4.2,w:1.85,h:2.28,door:true,name:'council-west-door'},
     {at:0,w:2.1,h:2.4,door:true,pierMk:'dolomite',name:'council-compact-door'},
     {at:4.2,w:1.85,h:2.28,door:true,name:'council-east-door'}
    ],
    n:[{at:-3.6,w:1.3,h:1.25,y:1.0},{at:3.6,w:1.3,h:1.25,y:1.0}]
   }
  });

  /* West & East Elder Wing Vaults */
  mcVaultWing(-10.2,-3.8,-5.2,6.8,yC,hB,{
   style:'dikengyuan',floorMk:'floor',rims:'we',
   holes:{
    e:[{at:.4,w:1.85,h:2.28,door:true,name:'council-west-wing-door'},{at:3.8,w:1.25,h:1.25,y:1.0}]
   }
  });
  mcVaultWing(5.2,-3.8,10.2,6.8,yC,hB,{
   style:'dikengyuan',floorMk:'floor',rims:'we',gapW:1.5,
   holes:{
    w:[{at:3.4,w:1.85,h:2.28,door:true,name:'council-east-wing-door'}]
   }
  });

  mcTerraceLink(-7.7,-4.0,yB,3.0,.32);
  mcTerraceLink(7.7,-4.0,yB,3.0,.32);
  mcCourtyardStair(3.7,4.2,-1.8,yC,yB,5.2,{style:'dikengyuan'});

  /* Stepped dolomite council benches in the open sunken amphitheatre */
  svNoWalk(()=>{
   for(const s of [-1,1]){
    box('dolomite',s*2.4,yC+.03,1.2,1.1,.38,4.6,P('dolomite'));
    box('molefelt',s*2.4,yC+.41,1.2,.96,.05,4.4,P('molefelt'));
   }
  });
  mcSeismicStone(0,yC,1.2,2.9,{big:true});
  mcVentHood(-5.6,yB,-6.8,0,{smoke:true});
  mcVentHood(5.6,yB,-6.8,0,{smoke:false});
  mcBanner(-6.8,yB,6.2,0,3.3,'tapestry');
  mcBanner(6.8,yB,6.2,0,3.3,'flagSalt');

  mcTarget(0,yC,3.6,'sunken-council-amphitheatre',false);
  mcTarget(0,yC,-6.8,'salt-compact-chamber',true);
  mcTarget(-7.7,yC,1.4,'west-lonko-vault',true);
  mcTarget(7.7,yC,1.4,'east-tally-vault',true);
  mcTarget(0,yB,-6.8,'council-roof-terrace',false);

  mcFurnList([
   ['molu_halite_compact_altar',0,yC,-7.8,0],
   ['molu_seismic_drum_table',-4.2,yC,-6.8,0],
   ['molu_amber_tally_rack',4.6,yC,-7.6,0],
   ['molu_molefelt_divan',-7.7,yC,-.8,PI/2],
   ['molu_molefelt_divan',-7.7,yC,3.4,PI/2],
   ['molu_bypass_assay_scale',7.7,yC,-.4,-PI/2],
   ['molu_hearth_brazier',7.7,yC,4.2,0]
  ]);
 }
});

/* 3. Subterranean Seismic-Stone & Tapetum-Lamp Ancestor Sanctuary */
defBuilding({
 key:'mc_ancestor_echo_shrine',
 name:'Subterranean Seismic-Stone and Tapetum-Lamp Ancestor Sanctuary',
 seed:8303,w:22,d:20,h:10.2,budget:108000,cut:true,
 front:{x:0,z:9.2,yaw:0},
 tags:{style:'dikengyuan',wealth:'rich',types:['religious','funerary'],role:'shrine',job:'worship'},
 build(){
  const yC=.38,hB=3.92,yB=yC+hB;
  mcBasePad(0,-.3,19.2,16.8,yC,{style:'dikengyuan',mk:'paving'});
  mcEntryRamp(0,0,9.1,0,yC,7.4,2.8,{style:'dikengyuan'});

  /* Deep Rear Echo-Vault Sanctuary [-9.2..9.2, -8.5..-2.6] */
  mcVaultWing(-9.2,-8.5,9.2,-2.6,yC,hB,{
   style:'dikengyuan',floorMk:'floor',rims:'ns',
   holes:{
    s:[
     {at:-3.8,w:1.75,h:2.25,door:true,name:'shrine-west-echo-door'},
     {at:0,w:2.1,h:2.42,door:true,pierMk:'basalt',leafMk:'darkcedar',name:'shrine-main-echo-door'},
     {at:3.8,w:1.75,h:2.25,door:true,name:'shrine-east-echo-door'}
    ],
    n:[{at:-3.2,w:1.25,h:1.25,y:1.02},{at:3.2,w:1.25,h:1.25,y:1.02}]
   }
  });

  /* Flanking Ossuary & Offering Yaodong Wings */
  mcVaultWing(-9.2,-2.2,-4.6,6.4,yC,hB,{
   style:'dikengyuan',floorMk:'floor',rims:'we',
   holes:{e:[{at:2.2,w:1.75,h:2.24,door:true,name:'shrine-ossuary-door'}]}
  });
  mcVaultWing(4.6,-2.2,9.2,6.4,yC,hB,{
   style:'dikengyuan',floorMk:'floor',rims:'we',gapW:1.5,
   holes:{w:[{at:2.8,w:1.75,h:2.24,door:true,name:'shrine-lamp-vault-door'}]}
  });

  mcTerraceLink(-6.9,-2.4,yB,2.8,.32);
  mcTerraceLink(6.9,-2.4,yB,2.8,.32);
  mcCourtyardStair(3.1,4.0,-1.4,yC,yB,4.6,{style:'dikengyuan'});

  /* Twin Seismic Way-Stones in court + crowning Way-Stone beacon on terrace */
  mcSeismicStone(-1.9,yC,1.4,2.8,{big:false});
  mcSeismicStone(1.9,yC,1.4,2.8,{big:false});
  mcSeismicStone(0,yB,-5.6,4.2,{big:true});
  mcVentHood(-5.8,yB,-5.6,0,{smoke:true});
  mcVentHood(5.8,yB,-5.6,0,{smoke:true});

  mcTarget(0,yC,2.8,'shrine-sunken-echo-court',false);
  mcTarget(0,yC,-5.6,'ancestor-echo-sanctuary',true);
  mcTarget(-6.9,yC,2.1,'west-ossuary-vault',true);
  mcTarget(6.9,yC,2.1,'east-tapetum-lamp-vault',true);
  mcTarget(-4.2,yB,-5.6,'sanctuary-terrace',false);

  mcFurnList([
   ['molu_halite_compact_altar',0,yC,-6.8,0],
   ['molu_seismic_drum_table',-3.8,yC,-5.6,0],
   ['molu_tapetum_oil_cresset',-1.8,yC,-4.2,0],
   ['molu_tapetum_oil_cresset',1.8,yC,-4.2,0],
   ['molu_hearth_brazier',3.8,yC,-5.6,0],
   ['molu_cucuteni_grain_pithos',-6.9,yC,-.4,0],
   ['molu_molefelt_divan',-6.9,yC,3.8,PI],
   ['molu_tapetum_oil_cresset',6.9,yC,.2,0]
  ]);
 }
});

/* 4. Hydraulic-Lime Rain-Cistern, Steam-Vault & Healer's Clinic */
defBuilding({
 key:'mc_deep_cistern_bath',
 name:'Hydraulic-Lime Rain-Cistern Steam-Vault and Healer Clinic',
 seed:8304,w:22,d:20,h:8.8,budget:108000,cut:true,
 front:{x:0,z:9.2,yaw:0},
 tags:{style:'dikengyuan',wealth:'middle',types:['civic','infrastructure'],role:'cistern-bath',job:'healing'},
 build(){
  const yC=.38,hB=3.84,yB=yC+hB;
  mcBasePad(0,-.3,19.4,16.8,yC,{style:'dikengyuan',mk:'paving'});
  mcEntryRamp(0,0,9.1,0,yC,7.4,2.8,{style:'dikengyuan'});

  /* Flowing hydraulic-lime rain-cistern basin on west side of sunken courtyard */
  mcWaterPool(-2.1,1.6,4.2,5.2,yC+.18,.52,{
   curbMk:'limewash',
   river:{name:'molu-cistern-seep',axis:'z',speed:.28}
  });

  /* Rear Steam-Bath & Herb-Clinic Yaodong Wing [-9.3..9.3, -8.5..-3.1] */
  mcVaultWing(-9.3,-8.5,9.3,-3.1,yC,hB,{
   style:'dikengyuan',floorMk:'paving',rims:'ns',
   holes:{
    s:[
     {at:-4.0,w:1.8,h:2.26,door:true,name:'cistern-steam-door'},
     {at:1.8,w:1.9,h:2.32,door:true,name:'cistern-clinic-door'},
     {at:5.8,w:1.3,h:1.25,y:1.0}
    ],
    n:[{at:-3.4,w:1.25,h:1.25,y:1.0},{at:3.4,w:1.25,h:1.25,y:1.0}]
   }
  });

  /* West Lime-Filter Vault & East Apothecary Vault */
  mcVaultWing(-9.3,-2.7,-4.7,6.4,yC,hB,{
   style:'dikengyuan',rims:'we',
   holes:{e:[{at:-1.2,w:1.7,h:2.22,door:true,name:'cistern-filter-door'}]}
  });
  mcVaultWing(4.7,-2.7,9.3,6.4,yC,hB,{
   style:'dikengyuan',floorMk:'floor',rims:'we',gapW:1.5,
   holes:{w:[{at:3.2,w:1.75,h:2.24,door:true,name:'cistern-healer-door'}]}
  });

  mcTerraceLink(-7.0,-2.9,yB,2.8,.32);
  mcTerraceLink(7.0,-2.9,yB,2.8,.32);
  mcCourtyardStair(3.2,4.2,-1.6,yC,yB,4.7,{style:'dikengyuan'});

  mcCisternWell(1.4,yC,2.2,{r:.86});
  mcVentHood(-4.8,yB,-5.8,0,{smoke:true});
  mcVentHood(2.4,yB,-5.8,0,{smoke:true});
  mcDryingMats(7.0,yB,1.8,1,2);

  mcTarget(1.2,yC,4.8,'cistern-courtyard-apron',false);
  mcTarget(0,yC,-5.8,'steam-bath-and-clinic-vault',true);
  mcTarget(-7.0,yC,1.8,'west-lime-filter-vault',true);
  mcTarget(7.0,yC,1.8,'east-apothecary-vault',true);
  mcTarget(0,yB,-5.8,'cistern-catchment-terrace',false);

  mcFurnList([
   ['molu_hearth_brazier',-4.2,yC,-5.8,0],
   ['molu_kang_hearth_bed',1.8,yC,-6.4,0],
   ['molu_molefelt_divan',5.6,yC,-5.8,-PI/2],
   ['molu_tuber_seep_planter',-7.0,yC,2.8,PI],
   ['molu_cucuteni_grain_pithos',-7.0,yC,-.4,0],
   ['molu_amber_tally_rack',7.0,yC,-.8,-PI/2],
   ['molu_tapetum_oil_cresset',7.0,yC,4.2,0]
  ]);
 }
});

/* 5. Sunken Hearth-Pit Drovers' Tavern & Tuber-Ale Cellar */
defBuilding({
 key:'mc_pit_tavern_inn',
 name:'Sunken Hearth-Pit Drovers Tavern and Tuber-Ale Cellar',
 seed:8305,w:24,d:22,h:8.8,budget:114000,cut:true,
 front:{x:0,z:10.1,yaw:0},
 tags:{style:'dikengyuan',wealth:'middle',types:['tavern','inn','infrastructure'],role:'inn',job:'brewing'},
 build(){
  const yC=.38,hB=3.86,yB=yC+hB;
  mcBasePad(0,-.4,21.0,18.4,yC,{style:'dikengyuan',mk:'cobble'});
  mcEntryRamp(0,0,10.0,0,yC,8.2,3.0,{style:'dikengyuan'});

  /* Rear Taproom & Tuber-Ale Mash Vault [-10.2..10.2, -9.4..-4.0] */
  mcVaultWing(-10.2,-9.4,10.2,-4.0,yC,hB,{
   style:'dikengyuan',floorMk:'floor',rims:'ns',
   holes:{
    s:[
     {at:-4.4,w:1.9,h:2.3,door:true,name:'tavern-ale-vault-door'},
     {at:.4,w:2.05,h:2.38,door:true,name:'tavern-hearth-door'},
     {at:5.2,w:1.35,h:1.28,y:.98}
    ],
    n:[{at:-3.8,w:1.3,h:1.25,y:1.0},{at:3.8,w:1.3,h:1.25,y:1.0}]
   }
  });

  /* West Bunk-Yaodong & East Sled-Harness Tack Wing */
  mcVaultWing(-10.2,-3.6,-5.2,7.0,yC,hB,{
   style:'dikengyuan',floorMk:'floor',rims:'we',
   holes:{
    e:[{at:-.8,w:1.8,h:2.26,door:true,name:'tavern-bunk-door'},{at:3.4,w:1.8,h:2.26,door:true,name:'tavern-south-bunk-door'}]
   }
  });
  mcVaultWing(5.2,-3.6,10.2,7.0,yC,hB,{
   style:'dikengyuan',floorMk:'floor',rims:'we',gapW:1.5,
   holes:{
    w:[{at:3.4,w:1.85,h:2.26,door:true,name:'tavern-kitchen-door'}]
   }
  });

  mcTerraceLink(-7.7,-3.8,yB,3.0,.32);
  mcTerraceLink(7.7,-3.8,yB,3.0,.32);
  mcCourtyardStair(3.7,4.2,-1.6,yC,yB,5.2,{style:'dikengyuan'});

  /* Sheltered timber drinking porch on north courtyard edge + parked freight sled */
  mcArcadeColonnade(-4.6,-3.5,2.2,-3.5,yC,3.1,{style:'dikengyuan',n:3});
  mcCaravanSled(-2.2,yC,2.4,0,{load:'grain'});
  mcVentHood(-4.8,yB,-6.7,0,{smoke:true});
  mcVentHood(4.8,yB,-6.7,0,{smoke:true});
  mcDryingMats(-7.7,yB,1.6,1,2);
  mcBanner(-2.4,yB,-3.8,0,3.2,'feltOchre');

  mcTarget(.6,yC,2.8,'sunken-drovers-yard',false);
  mcTarget(0,yC,-6.7,'taproom-and-tuber-ale-vault',true);
  mcTarget(-7.7,yC,1.6,'drovers-bunk-yaodong',true);
  mcTarget(7.7,yC,1.6,'roast-kitchen-yaodong',true);
  mcTarget(0,yB,-6.7,'tavern-loess-terrace',false);

  mcFurnList([
   ['molu_hearth_brazier',.4,yC,-6.4,0],
   ['molu_molefelt_divan',-3.6,yC,-6.8,0],
   ['molu_molefelt_divan',4.4,yC,-6.8,0],
   ['molu_cucuteni_grain_pithos',-8.2,yC,-7.6,0],
   ['molu_cucuteni_grain_pithos',-6.4,yC,-7.6,0],
   ['molu_drover_bunk',-7.7,yC,-1.2,PI/2],
   ['molu_drover_bunk',-7.7,yC,3.8,PI/2],
   ['molu_curd_press_table',7.7,yC,1.2,-PI/2],
   ['molu_tapetum_oil_cresset',1.8,yC,-.4,0]
  ]);
 }
});
