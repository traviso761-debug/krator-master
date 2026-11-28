// prefix: tk
// ================================================================= TIMPAR-KURAN DWELLINGS (PLAN.md §3.1-§3.2 & §4, seeds 35001..35010)
// Ten stratified dwellings covering the full 6/6 residential matrix (poor/middle/rich x dwelling-single/dwelling-multi):
//   35001 tk_jomon_pit_poor        Jomon semi-sunken timber-crib & megabreccia pit-house w/ kaen-doki flame-pot crown (poor, single)
//   35002 tk_bark_cise_poor        Stepped Ainu bark/reed cise lodge w/ west sem vestibule & east spirit-window (poor, single)
//   35003 tk_twin_pit_kin_poor     Paired semi-sunken hunter/forager kin pit-lodges joined by bark winter breezeway (poor, multi)
//   35004 tk_plank_cise_mid        Hybrid split-cypress & stepped-reed cise house w/ black-red-teal formline gable (middle, single)
//   35005 tk_cedar_plank_mid       Tlingit vertical-plank lodge w/ Bear-Clan screen, cobble-weighted roof & pu cache (middle, single)
//   35006 tk_spur_stilt_mid        Rainforest valley-slope rat-baffled stilt plank-house w/ Raven gable & under-croft (middle, single)
//   35007 tk_lineage_longhouse_mid Two-hearth extended-lineage split-cypress plank longhouse w/ twin house-posts (middle, multi)
//   35008 tk_timpar_cise_rich      18.6 m Timpar-Cise Storm-Bird clan hall w/ 10.5 m totem-mouth portal & daak tiers (rich, single)
//   35009 tk_chieftain_totem_hall  19.4 m Bear-Chief great-house w/ 11.8 m totem-mouth portal, war-visors & loot heads (rich, single)
//   35010 tk_twin_hearth_clan_rich 21.2 m multi-lineage Hueru-Whale & Raven great-hall w/ twin irori pits & 2-step daak (rich, multi)

/* 1. Poor Jomon Semi-Sunken Timber-Crib Pit-House */
defBuilding({key:'tk_jomon_pit_poor',name:'Jomon Timber-Crib Pit Lodge',seed:35001,cut:true,
 w:10.6,d:11.0,h:6.6,budget:65000,
 tags:{types:['dwelling-single'],wealth:'poor',style:'jomon'},
 note:'semi-sunken megabreccia and tarred-cedar crib pit-lodge under conical bark-and-reed rafters vented by a cord-marked kaen-doki flame-pot crown',
 build(){
  pushM(TF(0,0,-.35));
  const P0=tkPitBase(8.4,8.2,{yFloor:.12,rimH:.84,kerbT:.84,doorW:1.48});
  /* Four interior adzed cedar support posts around sunken floor + conical cypress-bark & reed roof */
  svNoWalk(()=>{
   for(const sx of [-1.85,1.85])for(const sz of [-1.75,1.75]){
    cyl('cypress',sx,P0.yFloor,sz,.16,2.85,hc(SVPAL.cypressD[0]),10);
   }
   /* Conical layered bark skirt + reed cone + kaen-doki sculptural smoke collar */
   cyl('bark',0,.84,0,4.55,1.35,hc(SVPAL.bark[0]),12,2.95);
   cyl('reed',0,2.19,0,3.02,1.65,hc(SVPAL.reed[0]),12,.72);
   /* Gabled entry hood over +z threshold */
   for(const sx of [-.86,.86])cyl('cypress',sx,.36,P0.doorZ+.35,.11,1.88,hc(SVPAL.cypressD[0]),8);
   plane4('bark',[-1.08,2.12,P0.doorZ-.35],[0,2.68,P0.doorZ-.35],[-1.08,2.12,P0.doorZ+.62],.09,hc(SVPAL.bark[1]));
   plane4('bark',[0,2.68,P0.doorZ-.35],[1.08,2.12,P0.doorZ-.35],[0,2.68,P0.doorZ+.62],.09,hc(SVPAL.bark[1]));
  });
  tkKaenCrown(0,3.84,0,.44,.78,4,{smoke:true});
  tkDoor(0,P0.doorY,P0.doorZ,0,1.16,1.88,{inau:true});
  tkWindBanner(-3.4,0,4.25,.2,1.35,1.95,{mk:'attus'});
  tkFurnList([
   ['timpar_irori_kaen_hearth',0,P0.yFloor,-.25,0],
   ['timpar_attus_bale_bench',-2.1,P0.yFloor,-.3,PI/2],
   ['scrap_poor_bed',2.05,P0.yFloor,-.6,-PI/2],
   ['timpar_inau_nusa_rack',0,P0.yFloor,-2.55,0],
   ['generic_storage_jar',-2.1,P0.yFloor,1.65,0],
   ['generic_basket',2.15,P0.yFloor,1.65,0]
  ]);
  tkTarget(0,P0.yFloor,-.2,'pit-hearth');
  popM();
 }});

/* 2. Poor Stepped Ainu Bark-and-Reed Cise Lodge */
defBuilding({key:'tk_bark_cise_poor',name:'Stepped Bark and Reed Cise Lodge',seed:35002,cut:true,
 w:11.2,d:11.6,h:6.8,budget:70000,
 tags:{types:['dwelling-single'],wealth:'poor',style:'jomon'},
 note:'Ainu-derived stepped reed-and-cypress-bark cise lodge with entry sem vestibule, east rorun-puyar spirit-window hung with inau curls & kaen-doki crown',
 build(){
  const G=.3,W=7.8,D=7.6,H=2.45;
  pushM(TF(0,0,-.45));
  tkPlinth(W+.5,D+1.6,G,{stepW:2.1});
  /* Main cise room */
  tkPlankBox(W,D,G,H,{
   mk:'bark',socle:.34,postR:.2,
   holes:{
    s:[{x:0,y:0,w:1.68,h:2.18}],
    e:[{x:0,y:.88,w:1.12,h:.92}],
    w:[{x:0,y:.92,w:.92,h:.82}]
   }
  });
  /* Projecting +z entry vestibule (sem) */
  svNoWalk(()=>{
   for(const sx of [-1.05,1.05])cyl('cypress',sx,G,D/2+.92,.13,2.08,hc(SVPAL.cypressD[0]),8);
   plane4('reed',[-1.35,G+1.98,D/2-.1],[0,G+2.58,D/2-.1],[-1.35,G+1.98,D/2+1.12],.11,hc(SVPAL.reed[0]));
   plane4('reed',[0,G+2.58,D/2-.1],[1.35,G+1.98,D/2-.1],[0,G+2.58,D/2+1.12],.11,hc(SVPAL.reed[0]));
  });
  tkDoor(0,G,D/2-.17,0,1.22,2.0,{inau:true});
  /* Sacred east-facing rorun-puyar spirit window hung with shaved-willow inau curls */
  tkWindow(W/2-.17,G+.88,0,PI/2,.92,.78,{spirit:true,lit:true});
  tkWindow(-W/2+.17,G+.92,0,-PI/2,.74,.68,{lit:false});
  tkCiseRoof(W,D,G+H,2.35,{courses:6,crownR:.36,crownH:.68});
  tkFormlineGable(0,G+H+.1,D/2+.3,0,W*.72,1.6,{crest:'rapan'});
  tkDryingLine(-3.6,D/2+.85,-1.8,D/2+.85,G+1.85,{mk:'hide'});
  tkFurnList([
   ['timpar_irori_kaen_hearth',0,G,-.35,0],
   ['timpar_attus_bale_bench',-2.3,G,-1.2,PI/2],
   ['painted_common_bed',-2.2,G,1.4,PI/2],
   ['timpar_inau_nusa_rack',2.45,G,-.1,-PI/2],
   ['timpar_smoked_salmon_frame',2.1,G,-2.2,0],
   ['painted_common_chest',0,G,-2.85,0]
  ]);
  tkTarget(0,G,.5,'cise-floor');
  popM();
 }});

/* 3. Poor Paired Hunter/Forager Kin Pit-Lodges (poor dwelling-multi) */
defBuilding({key:'tk_twin_pit_kin_poor',name:'Twin Hunter Kin Pit-Lodges',seed:35003,cut:true,
 w:16.4,d:11.2,h:6.6,budget:90000,
 tags:{types:['dwelling-multi'],wealth:'poor',style:'jomon'},
 note:'two semi-sunken Jomon bark-and-cedar hunter lodges linked by a covered winter plank breezeway and shared nusa skull-altar',
 build(){
  const G=.32;
  pushM(TF(0,0,-.4));
  tkPlinth(14.6,8.2,G,{stepW:2.8,stepX:0});
  /* Central covered winter breezeway + left (-4.3) and right (+4.3) octagonal/square bark lodges */
  for(const sx of [-4.3,4.3]){
   pushM(TF(sx,0,-.2));
   tkPlankBox(5.2,6.4,G,2.35,{
    mk:'bark',socle:.38,postR:.19,
    holes:{
     s:[{x:0,y:.88,w:.92,h:.82}],
     e:sx<0?[{x:0,y:0,w:1.52,h:2.05}]:[{x:0,y:.88,w:.88,h:.78}],
     w:sx>0?[{x:0,y:0,w:1.52,h:2.05}]:[{x:0,y:.88,w:.88,h:.78}]
    }
   });
   tkWindow(0,G+.88,3.2-.17,0,.74,.68,{lit:true});
   tkWindow(sx<0?-2.6+.17:2.6-.17,G+.88,0,sx<0?-PI/2:PI/2,.72,.66,{spirit:sx>0});
   tkCiseRoof(5.2,6.4,G+2.35,2.05,{courses:5,crownR:.3,crownH:.56});
   popM();
  }
  /* Central connecting vestibule between the two kin lodges */
  tkPlankWall(-1.7,-3.1,1.7,-3.1,G,2.25,{mk:'cedar',socle:.34});
  tkPlankWall(-1.7,2.7,1.7,2.7,G,2.25,{mk:'cedar',socle:.34,holes:[{at:1.7,y:0,w:1.68,h:2.1}]});
  tkDoor(0,G,2.7,0,1.24,1.98,{inau:true});
  /* Unlocked interior doors into west & east lodges */
  tkDoor(-1.7,G,-.2,-PI/2,1.14,1.92,{inau:false});
  tkDoor(1.7,G,-.2,PI/2,1.14,1.92,{inau:false});
  svNoWalk(()=>{
   box('bark',0,G+2.25,-.2,3.6,.18,6.2,hc(SVPAL.bark[0]));
   box('reed',0,G+2.43,-.2,3.3,.22,5.9,hc(SVPAL.reed[0]));
  });
  tkNusaFence(0,0,-4.45,PI,3.2,4,{h:1.95,curve:.2});
  tkWindBanner(0,0,3.65,0,1.5,1.9,{mk:'attus'});
  tkFurnList([
   ['timpar_irori_kaen_hearth',-4.3,G,-.4,0],
   ['scrap_poor_bed',-5.8,G,-1.6,PI/2],
   ['timpar_attus_bale_bench',-4.3,G,1.6,PI],
   ['timpar_irori_kaen_hearth',4.3,G,-.4,0],
   ['painted_common_bed',5.7,G,-1.5,-PI/2],
   ['timpar_smoked_salmon_frame',4.3,G,-2.1,0],
   ['timpar_dugout_paddle_rack',0,G,-2.1,0]
  ]);
  tkTarget(-4.3,G,-.2,'west-kin-lodge');
  tkTarget(0,G,.8,'central-breezeway');
  tkTarget(4.3,G,-.2,'east-kin-lodge');
  popM();
 }});

/* 4. Middle Hybrid Split-Cypress & Cise House */
defBuilding({key:'tk_plank_cise_mid',name:'Split-Cypress and Cise Frieze House',seed:35004,cut:true,
 w:12.6,d:12.8,h:7.8,budget:85000,
 tags:{types:['dwelling-single'],wealth:'middle',style:'plank'},
 note:'post-and-beam split red-cypress house under a stepped cise reed-and-shake roof with Storm-Eagle formline frieze and kaen-doki smoke-crown',
 build(){
  const G=.38,W=9.8,D=9.2,H=3.15;
  pushM(TF(0,0,-.45));
  tkPlinth(W+.6,D+.6,G,{stepW:2.4});
  tkPlankBox(W,D,G,H,{
   mk:'cypress',socle:.4,postR:.24,
   holes:{
    s:[{x:0,y:0,w:1.78,h:2.26},{x:-2.9,y:.96,w:1.06,h:1.02},{x:2.9,y:.96,w:1.06,h:1.02}],
    n:[{x:-2.4,y:1.0,w:1.0,h:.96},{x:2.4,y:1.0,w:1.0,h:.96}],
    e:[{x:0,y:.96,w:1.08,h:.96}]
   }
  });
  tkDoor(0,G,D/2-.17,0,1.32,2.1,{inau:true,visor:true,crest:'kapac'});
  for(const sx of [-2.9,2.9])tkWindow(sx,G+.96,D/2-.17,0,.88,.88,{lit:true});
  for(const sx of [-2.4,2.4])tkWindow(sx,G+1.0,-D/2+.17,PI,.82,.82,{lit:false});
  tkWindow(W/2-.17,G+.96,0,PI/2,.9,.82,{spirit:true,lit:true});
  /* Black-red-teal formline frieze board above front lintel */
  tkFormlineScreen(0,G+2.36,D/2,.0,W-.7,.72,{crest:'kapac'});
  tkPlankRoof(W,D,G+H,2.15,{mk:'shingle',cobbles:true,smokeShutter:true,kaenFinials:true});
  tkFormlineGable(0,G+H+.08,D/2-.1,0,W-.5,2.05,{crest:'kapac'});
  tkWindBanner(-4.1,0,D/2+.75,.15,1.45,2.15,{mk:'chilkat'});
  tkFurnList([
   ['timpar_irori_kaen_hearth',0,G,-.35,0],
   ['timpar_kerfed_bentwood_chest',-3.4,G,-3.2,0,0],
   ['timpar_kerfed_bentwood_chest',3.4,G,-3.2,0,1],
   ['painted_common_bed',-3.3,G,.4,PI/2],
   ['painted_common_table',2.8,G,.6,-PI/2],
   ['timpar_inau_nusa_rack',0,G,-3.55,0],
   ['timpar_kanopi_alloy_lamp',-1.8,G,2.4,0]
  ]);
  tkTarget(0,G,.8,'plank-cise-hall');
  popM();
 }});

/* 5. Middle Classic Tlingit Split-Cypress Plank Lodge w/ Bear Screen & Side Pu Cache */
defBuilding({key:'tk_cedar_plank_mid',name:'Bear-Crest Split-Cedar Plank Lodge',seed:35005,cut:true,
 w:15.2,d:13.2,h:8.2,budget:95000,
 tags:{types:['dwelling-single'],wealth:'middle',style:'plank'},
 note:'slotted vertical split-cypress Tlingit plank-house with Bear-Clan front screen, cobble-weighted gale roof and side rat-baffled pu cache',
 build(){
  const G=.4,W=10.2,D=9.4,H=3.35;
  pushM(TF(-1.4,0,-.45));
  tkPlinth(W+.6,D+.6,G,{stepW:2.5});
  tkPlankBox(W,D,G,H,{
   mk:'cypress',socle:.42,postR:.26,
   holes:{
    s:[{x:0,y:0,w:1.82,h:2.28}],
    n:[{x:-2.6,y:1.02,w:1.05,h:.98},{x:2.6,y:1.02,w:1.05,h:.98}],
    w:[{x:0,y:1.0,w:1.05,h:.98}]
   }
  });
  tkDoor(0,G,D/2-.17,0,1.36,2.12,{inau:true});
  for(const sx of [-2.6,2.6])tkWindow(sx,G+1.02,-D/2+.17,PI,.86,.84,{lit:true});
  tkWindow(-W/2+.17,G+1.0,0,-PI/2,.86,.84,{lit:true});
  /* Full Bear-Clan front formline screen with clean portal cutout */
  tkFormlineScreen(0,G+.44,D/2+.01,0,W-.75,H-.52,{crest:'kuma',cutW:2.25,cutH:2.42});
  tkPlankRoof(W,D,G+H,2.25,{mk:'cedar',cobbles:true,smokeShutter:true,kaenFinials:true});
  tkFormlineGable(0,G+H+.08,D/2-.1,0,W-.4,2.15,{crest:'kuma'});
  /* Single-step interior daak bench along back wall */
  const ys=tkDaakTiers(W-.8,D-.8,G,1,{stepH:.36,benchD:1.75});
  tkFurnList([
   ['timpar_irori_kaen_hearth',0,G,.35,0],
   ['painted_common_bed',-2.8,ys[1],-3.1,0],
   ['timpar_kerfed_bentwood_chest',2.8,ys[1],-3.2,0,0],
   ['timpar_slat_cuirass_stand',-3.6,G,2.6,PI/4],
   ['timpar_bear_feast_trough',2.6,G,1.2,PI/2],
   ['timpar_totem_house_post',-3.6,G,-1.4,PI/2],
   ['timpar_totem_house_post',3.6,G,-1.4,-PI/2]
  ]);
  tkTarget(0,G,.9,'bear-plank-floor');
  tkTarget(0,ys[1],-3.1,'bear-daak-tier');
  popM();
  /* Side household rat-baffled pu food cache at +x = 5.3 */
  pushM(TF(5.3,0,-.8));
  const pDeck=tkPuStilts(2.8,2.8,0,1.62,{postR:.15});
  tkPlankBox(2.6,2.5,pDeck,1.85,{mk:'cedar',socle:0,postR:.14,holes:{s:[{x:0,y:0,w:1.18,h:1.68}]}});
  tkDoor(0,pDeck,1.25-.17,0,.86,1.58,{inau:false});
  tkCiseRoof(2.6,2.5,pDeck+1.85,1.25,{courses:4,smoke:false,crownR:.2,crownH:.36});
  tkTarget(0,pDeck,0,'side-pu-cache');
  popM();
 }});

/* 6. Middle Rainforest Spur Rat-Baffled Stilt Plank-House */
defBuilding({key:'tk_spur_stilt_mid',name:'Valley-Spur Stilt Plank House',seed:35006,cut:true,
 w:12.8,d:14.2,h:9.6,budget:95000,
 tags:{types:['dwelling-single'],wealth:'middle',style:'plank'},
 note:'elevated damp-valley split-cypress plank-house raised 1.9 m on rat-baffled cedar piers over a dry firewood and dugout under-croft',
 build(){
  const W=9.4,D=8.6,stiltH=1.88,H=3.1;
  pushM(TF(0,0,-.95));
  svNoWalk(()=>box('cobble',0,0,0,W+.8,.12,D+.8,hc(SVPAL.cobble[0])));
  wkPad(0,0,W+.6,D+.6,.12);
  const deckY=tkPuStilts(W,D,.12,stiltH,{postR:.21,stairX:0});
  tkPlankBox(W,D,deckY,H,{
   mk:'cypress',socle:0,postR:.23,
   holes:{
    s:[{x:0,y:0,w:1.76,h:2.22},{x:-2.8,y:.92,w:1.02,h:.96},{x:2.8,y:.92,w:1.02,h:.96}],
    n:[{x:0,y:.96,w:1.2,h:1.0}],
    e:[{x:0,y:.92,w:1.0,h:.96}]
   }
  });
  tkDoor(0,deckY,D/2-.17,0,1.3,2.08,{inau:true,visor:true,crest:'rapan'});
  for(const sx of [-2.8,2.8])tkWindow(sx,deckY+.92,D/2-.17,0,.84,.82,{lit:true});
  tkWindow(0,deckY+.96,-D/2+.17,PI,1.0,.86,{lit:false});
  tkWindow(W/2-.17,deckY+.92,0,PI/2,.82,.82,{spirit:true,lit:true});
  tkFormlineScreen(0,deckY+2.28,D/2+.01,0,W-.7,.76,{crest:'rapan'});
  tkPlankRoof(W,D,deckY+H,2.1,{mk:'shingle',cobbles:true,smokeShutter:true,kaenFinials:true});
  tkFormlineGable(0,deckY+H+.08,D/2-.1,0,W-.5,2.0,{crest:'rapan'});
  tkDryingLine(-3.6,-D/2+.3,3.6,-D/2+.3,1.45,{mk:'hide'});
  tkFurnList([
   ['timpar_irori_kaen_hearth',0,deckY,-.3,0],
   ['painted_common_bed',-3.2,deckY,-1.8,PI/2],
   ['timpar_kerfed_bentwood_chest',3.2,deckY,-2.8,0,1],
   ['timpar_attus_bale_bench',2.9,deckY,1.2,-PI/2],
   ['timpar_inau_nusa_rack',-3.1,deckY,2.2,PI/2],
   ['timpar_dugout_paddle_rack',-3.2,.12,0,PI/2],
   ['generic_crate',3.1,.12,-.8,0]
  ]);
  tkTarget(0,.12,1.6,'stilt-undercroft');
  tkTarget(0,deckY,.6,'stilt-plank-hall');
  popM();
 }});

/* 7. Middle Two-Hearth Extended-Lineage Plank Longhouse (middle dwelling-multi) */
defBuilding({key:'tk_lineage_longhouse_mid',name:'Extended-Lineage Split-Cypress Longhouse',seed:35007,cut:true,
 w:17.6,d:12.6,h:8.4,budget:115000,
 tags:{types:['dwelling-multi'],wealth:'middle',style:'plank'},
 note:'two-hearth multi-family split-cypress longhouse with Cloud-Wolf & Mist-Raven formline facade, twin doorways and carved house-posts',
 build(){
  const G=.4,W=15.2,D=9.4,H=3.35;
  pushM(TF(0,0,-.45));
  tkPlinth(W+.6,D+.6,G,{stepW:3.4,stepX:0});
  tkPlankBox(W,D,G,H,{
   mk:'cypress',socle:.42,postR:.26,
   holes:{
    s:[{x:-3.6,y:0,w:1.72,h:2.24},{x:3.6,y:0,w:1.72,h:2.24},{x:0,y:.95,w:1.35,h:1.05}],
    n:[{x:-3.8,y:1.0,w:1.05,h:.96},{x:3.8,y:1.0,w:1.05,h:.96}],
    e:[{x:0,y:.98,w:1.05,h:.96}],
    w:[{x:0,y:.98,w:1.05,h:.96}]
   }
  });
  tkDoor(-3.6,G,D/2-.17,0,1.28,2.1,{inau:true,visor:true,crest:'wurup'});
  tkDoor(3.6,G,D/2-.17,0,1.28,2.1,{inau:true,visor:true,crest:'rapan'});
  tkWindow(0,G+.95,D/2-.17,0,1.15,.9,{lit:true});
  for(const sx of [-3.8,3.8])tkWindow(sx,G+1.0,-D/2+.17,PI,.86,.82,{lit:false});
  tkWindow(W/2-.17,G+.98,0,PI/2,.86,.82,{spirit:true,lit:true});
  tkWindow(-W/2+.17,G+.98,0,-PI/2,.86,.82,{lit:true});
  /* Upper continuous formline frieze across entire 15.2 m longhouse front */
  tkFormlineScreen(0,G+2.42,D/2+.01,0,W-.8,.84,{crest:'wurup'});
  tkPlankRoof(W,D,G+H,2.3,{mk:'cedar',cobbles:true,smokeShutter:true,kaenFinials:true});
  tkTotemPole(0,0,D/2+1.25,0,6.4,.34,{crest:'wurup',figures:3,wings:false});
  tkFurnList([
   ['timpar_irori_kaen_hearth',-3.6,G,-.3,0],
   ['timpar_irori_kaen_hearth',3.6,G,-.3,0],
   ['painted_common_bed',-6.1,G,-2.2,PI/2],
   ['painted_common_bed',6.1,G,-2.2,-PI/2],
   ['timpar_kerfed_bentwood_chest',-1.2,G,-3.4,0,0],
   ['timpar_kerfed_bentwood_chest',1.2,G,-3.4,0,1],
   ['timpar_totem_house_post',0,G,-3.2,0],
   ['timpar_smoked_salmon_frame',-6.0,G,2.1,PI/2],
   ['timpar_attus_bale_bench',6.0,G,2.1,-PI/2]
  ]);
  tkTarget(-3.6,G,.9,'west-lineage-hearth');
  tkTarget(3.6,G,.9,'east-lineage-hearth');
  popM();
 }});

/* 8. Rich Monumental 18.6 m Timpar-Cise Storm-Bird Clan Hall w/ Totem-Mouth Portal & Stepped Daak */
defBuilding({key:'tk_timpar_cise_rich',name:'Timpar-Cise Storm-Bird Clan Great-Hall',seed:35008,cut:true,
 w:20.4,d:16.8,h:11.6,budget:150000,
 tags:{types:['dwelling-single'],wealth:'rich',style:'crest'},
 note:'18.6 m monumental split-cypress Timpar-Cise with full-facade Kapac Storm-Bird formline screen, 10.6 m oval totem-mouth portal & 2-tier daak platforms',
 build(){
  const G=.46,W=18.2,D=13.4,H=4.25;
  pushM(TF(0,0,-.65));
  tkPlinth(W+.8,D+.8,G,{stepW:3.2,stepX:0});
  tkPlankBox(W,D,G,H,{
   mk:'cypress',socle:.48,postR:.32,
   holes:{
    s:[{x:0,y:0,w:2.85,h:2.85}],
    n:[{x:-4.6,y:1.35,w:1.25,h:1.15},{x:4.6,y:1.35,w:1.25,h:1.15}],
    e:[{x:-2.6,y:1.35,w:1.15,h:1.1},{x:2.6,y:1.35,w:1.15,h:1.1}],
    w:[{x:-2.6,y:1.35,w:1.15,h:1.1},{x:2.6,y:1.35,w:1.15,h:1.1}]
   }
  });
  for(const sx of [-4.6,4.6])tkWindow(sx,G+1.35,-D/2+.17,PI,1.02,.96,{lit:true});
  for(const sz of [-2.6,2.6]){
   tkWindow(W/2-.17,G+1.35,sz,PI/2,.96,.94,{spirit:sz<0,lit:true});
   tkWindow(-W/2+.17,G+1.35,sz,-PI/2,.96,.94,{lit:true});
  }
  /* Edge-to-edge Storm-Bird (Kapac) black-red-teal formline screen + 10.6 m Totem-Mouth Portal (pivoting KDOOR!) */
  tkFormlineScreen(0,G+.5,D/2+.01,0,W-.9,H-.58,{crest:'kapac',cutW:3.2,cutH:3.05});
  tkTotemPortal(0,G,D/2-.1,0,10.4,.44,1.42,2.14,{crest:'kapac',wings:true,name:'storm-bird-mouth'});
  tkPlankRoof(W,D,G+H,2.75,{mk:'cypress',cobbles:true,smokeShutter:true,kaenFinials:true});
  tkFormlineGable(0,G+H+.1,D/2-.08,0,W-.5,2.65,{crest:'kapac'});
  /* Two-stepped interior Tlingit daak clan platforms around twin irori hearths */
  const ys=tkDaakTiers(W-.9,D-.9,G,2,{stepH:.36,benchD:1.9});
  tkIroriPit(-2.4,G,.6,1.8,1.8);
  tkIroriPit(2.4,G,.6,1.8,1.8);
  tkWindBanner(-7.2,G,D/2+.95,.12,1.65,2.45,{mk:'chilkat'});
  tkWindBanner(7.2,G,D/2+.95,-.12,1.65,2.45,{mk:'chilkat'});
  tkFurnList([
   ['painted_court_bed',-4.8,ys[2],-4.6,0],
   ['painted_court_bed',4.8,ys[2],-4.6,0],
   ['painted_court_throne',0,ys[2],-4.85,0],
   ['timpar_copper_shield_crest',-2.2,ys[2],-5.1,0],
   ['timpar_copper_shield_crest',2.2,ys[2],-5.1,0],
   ['timpar_bear_feast_trough',0,G,2.3,0],
   ['timpar_totem_house_post',-4.2,G,-1.2,PI/2],
   ['timpar_totem_house_post',4.2,G,-1.2,-PI/2],
   ['timpar_visor_war_helm',-6.2,ys[1],1.8,PI/2],
   ['timpar_kanopi_alloy_lamp',-2.4,G,3.2,0],
   ['timpar_kanopi_alloy_lamp',2.4,G,3.2,0]
  ]);
  tkTarget(0,G,1.2,'great-hall-hearth-floor');
  tkTarget(0,ys[1],-2.6,'daak-lower-tier');
  tkTarget(0,ys[2],-4.4,'daak-chief-tier');
  popM();
 }});

/* 9. Rich Bear-Chieftain Totem Great-House w/ War-Visors & Captured Eternian Trophy Heads */
defBuilding({key:'tk_chieftain_totem_hall',name:'Kuma War-Chief Totem Great-House',seed:35009,cut:true,
 w:21.2,d:17.4,h:12.6,budget:165000,
 tags:{types:['dwelling-single'],wealth:'rich',style:'crest'},
 note:'19.4 m Kuma Bear-Chief plank great-hall with 11.4 m totem-mouth portal, open-eyed wooden war-visors and inverted Eternian bronze war-loot heads',
 build(){
  const G=.48,W=19.2,D=13.8,H=4.4;
  pushM(TF(0,0,-.7));
  tkPlinth(W+.8,D+.8,G,{stepW:3.4,stepX:0});
  tkPlankBox(W,D,G,H,{
   mk:'cypress',socle:.5,postR:.34,
   holes:{
    s:[{x:0,y:0,w:2.95,h:2.9}],
    n:[{x:-5.0,y:1.4,w:1.25,h:1.15},{x:5.0,y:1.4,w:1.25,h:1.15}],
    e:[{x:0,y:1.4,w:1.3,h:1.15}],
    w:[{x:0,y:1.4,w:1.3,h:1.15}]
   }
  });
  for(const sx of [-5.0,5.0])tkWindow(sx,G+1.4,-D/2+.17,PI,1.05,.98,{lit:true});
  tkWindow(W/2-.17,G+1.4,0,PI/2,1.08,.98,{spirit:true,lit:true});
  tkWindow(-W/2+.17,G+1.4,0,-PI/2,1.08,.98,{lit:true});
  /* Bear-Clan full-facade screen + 11.4 m frontal totem-mouth portal */
  tkFormlineScreen(0,G+.52,D/2+.01,0,W-.9,H-.6,{crest:'kuma',cutW:3.3,cutH:3.1});
  tkTotemPortal(0,G,D/2-.1,0,11.2,.46,1.46,2.18,{crest:'kuma',wings:true,name:'bear-chief-mouth'});
  /* Open-eyed Timpar-Kuran war-visors high on corner posts vs inverted closed-eyed Eternian trophy heads on flank pikes! */
  for(const sx of [-1,1]){
   tkWarVisor(sx*6.2,G+3.35,D/2+.22,0,.54,{crest:'kuma'});
   tkLootHead(sx*4.2,G+1.65,D/2+.65,0,.52,{mk:sx<0?'bronze':'stone',inverted:true,warPaint:true});
  }
  tkPlankRoof(W,D,G+H,2.85,{mk:'cypress',cobbles:true,smokeShutter:true,kaenFinials:true});
  tkFormlineGable(0,G+H+.1,D/2-.08,0,W-.5,2.7,{crest:'kuma'});
  const ys=tkDaakTiers(W-.9,D-.9,G,2,{stepH:.38,benchD:1.95});
  tkIroriPit(0,G,.5,2.1,2.1);
  tkNusaFence(-6.8,0,D/2+1.45,.25,2.8,4,{h:2.1});
  tkFurnList([
   ['painted_court_throne',0,ys[2],-5.0,0],
   ['painted_court_bed',-5.4,ys[2],-4.8,0],
   ['painted_court_bed',5.4,ys[2],-4.8,0],
   ['timpar_eternian_trophy_rack',-3.0,ys[2],-5.2,0],
   ['timpar_copper_shield_crest',3.0,ys[2],-5.2,0],
   ['timpar_slat_cuirass_stand',-6.8,ys[1],1.4,PI/2],
   ['timpar_visor_war_helm',6.8,ys[1],1.4,-PI/2],
   ['timpar_bear_feast_trough',-2.8,G,2.2,PI/2],
   ['timpar_bear_feast_trough',2.8,G,2.2,-PI/2],
   ['timpar_totem_house_post',-4.4,G,-1.4,PI/2],
   ['timpar_totem_house_post',4.4,G,-1.4,-PI/2]
  ]);
  tkTarget(0,G,1.4,'chieftain-hearth-floor');
  tkTarget(0,ys[2],-4.5,'chieftain-throne-daak');
  popM();
 }});

/* 10. Rich 21.2 m Multi-Lineage Ancestral Hueru-Whale & Raven Great-Hall (rich dwelling-multi) */
defBuilding({key:'tk_twin_hearth_clan_rich',name:'Ancestral Hueru-Whale Multi-Lineage Great-Hall',seed:35010,cut:true,
 w:22.6,d:17.8,h:12.4,budget:175000,
 tags:{types:['dwelling-multi'],wealth:'rich',style:'crest'},
 note:'21.2 m multi-lineage Timpar-Cise remembering coastal Hueru-Kuran kin in its Leviathan Whale & Raven facade, housing four sub-clans around twin irori pits',
 build(){
  const G=.48,W=21.0,D=14.2,H=4.35;
  pushM(TF(0,0,-.7));
  tkPlinth(W+.8,D+.8,G,{stepW:3.8,stepX:0});
  tkPlankBox(W,D,G,H,{
   mk:'cypress',socle:.5,postR:.34,
   holes:{
    s:[{x:0,y:0,w:2.95,h:2.9},{x:-6.6,y:1.3,w:1.25,h:1.15},{x:6.6,y:1.3,w:1.25,h:1.15}],
    n:[{x:-5.6,y:1.35,w:1.25,h:1.15},{x:0,y:1.35,w:1.35,h:1.15},{x:5.6,y:1.35,w:1.25,h:1.15}],
    e:[{x:-2.8,y:1.35,w:1.15,h:1.1},{x:2.8,y:1.35,w:1.15,h:1.1}],
    w:[{x:-2.8,y:1.35,w:1.15,h:1.1},{x:2.8,y:1.35,w:1.15,h:1.1}]
   }
  });
  for(const sx of [-6.6,6.6])tkWindow(sx,G+1.3,D/2-.17,0,1.04,.98,{lit:true});
  for(const sx of [-5.6,0,5.6])tkWindow(sx,G+1.35,-D/2+.17,PI,1.04,.96,{lit:true});
  for(const sz of [-2.8,2.8]){
   tkWindow(W/2-.17,G+1.35,sz,PI/2,.96,.94,{spirit:sz<0,lit:true});
   tkWindow(-W/2+.17,G+1.35,sz,-PI/2,.96,.94,{lit:true});
  }
  /* Ancestral Hueru Whale formline facade + 11.0 m Whale-and-Raven totem-mouth entrance */
  tkFormlineScreen(0,G+.52,D/2+.01,0,W-1.0,H-.6,{crest:'hueru',cutW:3.3,cutH:3.1});
  tkTotemPortal(0,G,D/2-.1,0,11.0,.45,1.46,2.16,{crest:'hueru',wings:true,name:'hueru-whale-mouth'});
  tkPlankRoof(W,D,G+H,2.9,{mk:'cypress',cobbles:true,smokeShutter:true,kaenFinials:true});
  tkFormlineGable(0,G+H+.1,D/2-.08,0,W-.6,2.75,{crest:'hueru'});
  const ys=tkDaakTiers(W-.9,D-.9,G,2,{stepH:.36,benchD:1.95});
  tkIroriPit(-3.4,G,.6,1.95,1.95);
  tkIroriPit(3.4,G,.6,1.95,1.95);
  tkWindBanner(-8.4,G,D/2+.95,.1,1.7,2.45,{mk:'chilkat'});
  tkWindBanner(8.4,G,D/2+.95,-.1,1.7,2.45,{mk:'attus'});
  tkFurnList([
   ['painted_court_bed',-6.4,ys[2],-4.9,0],
   ['painted_court_bed',-2.2,ys[2],-4.9,0],
   ['painted_court_bed',2.2,ys[2],-4.9,0],
   ['painted_court_bed',6.4,ys[2],-4.9,0],
   ['timpar_kerfed_bentwood_chest',-8.2,ys[1],-1.6,PI/2,0],
   ['timpar_kerfed_bentwood_chest',8.2,ys[1],-1.6,-PI/2,1],
   ['timpar_copper_shield_crest',0,ys[2],-5.3,0],
   ['timpar_bear_feast_trough',-3.4,G,2.8,0],
   ['timpar_bear_feast_trough',3.4,G,2.8,0],
   ['timpar_totem_house_post',-5.2,G,-1.4,PI/2],
   ['timpar_totem_house_post',5.2,G,-1.4,-PI/2],
   ['timpar_inau_nusa_rack',0,G,-2.2,0]
  ]);
  tkTarget(-3.4,G,1.5,'west-clan-floor');
  tkTarget(3.4,G,1.5,'east-clan-floor');
  tkTarget(0,ys[2],-4.6,'upper-lineage-daak');
  popM();
 }});
