// prefix: sk
// ================================================================= SHORE-KIN HOUSES, COMPOUNDS & CLIENT MOOT HALL (50-sk-houses.js)
// Eight residential & moot-hall buildings spanning poor -> middle -> rich across single-family, multi-family & civic:
//   1. sk_stilt_cot        — Poor fisherman/gatherer stilt cot on arched basalt/laterite flood socle + mangrove drying deck
//   2. sk_boardwalk_shack  — Poor salvaged hull-plank & Melaleuca paperbark shore cot on tarred mangrove-pile cribs
//   3. sk_crib_rowhouse    — Poor multi-family two-door harbour-crew rowhouse on shared arched laterite & mangrove boardwalk
//   4. sk_hex_lime_house   — Middling hexagonal shell-limewash artisan house with brucite pierced screens & clay door mask
//   5. sk_serpentine_lodge — Middling extended-family battered serpentinite ring-wall lodge with mangrove-knee & whale-rib vault
//   6. sk_compound_house   — Prosperous factor/shipwright two-storey arched-socle & tiered-roof house with paktong fittings
//   7. sk_byssus_court     — Prosperous multi-family sea-silk weaver courtyard house with hex gatehouse & rainwater court
//   8. sk_client_hall      — Caretaker House's grand Shore-kin client moot & tally hall (hex pavilion + arched colonnade + paktong mask)

/* 1. Arched Flood-Socle Fisherman and Gatherer Stilt Cot (Rian + Fleet-born strand) */
defBuilding({
 key:'sk_stilt_cot',
 name:'Arched-Socle Fisherman Stilt Cot',
 seed:8601,w:13.6,d:14.8,h:9.6,budget:48000,cut:true,
 front:{x:0,z:6.2,yaw:0},
 materials:SK_BILLS.sk_stilt_cot.materials,
 bill:SK_BILLS.sk_stilt_cot.bill,
 tags:{types:['dwelling-single'],wealth:'poor',style:'rian-strand',role:'cot',job:'fishing'},
 note:'poor fisherman and gatherer stilt house on an arched pillow-basalt and laterite flood socle, mangrove drying deck, tiered Costularia thatch roof with ohia horns, and pumice-float net rack',
 build(){
  skAttachBill('sk_stilt_cot');
  const y1=.82,gh=2.85,yRoof=y1+gh;
  skArchedSocle(9.4,9.6,y1,{pierMk:'pillowbasalt',archMk:'laterite',topMk:'mangrove',stepW:2.0,stepRun:1.65});

  /* Open front drying deck (z = 1.8..4.6) with mangrove posts & pumice-float coir net rack */
  svNoWalk(()=>{
   for(const px of [-4.1,4.1]){
    box('laterite',px,y1,4.2,.34,.26,.34,P('laterite'));
    cyl('mangrove',px,y1+.26,4.2,.13,gh-.26,P('mangrove'),8);
   }
   box('araucaria',0,yRoof-.14,4.2,8.8,.14,.22,P('araucaria'));
  });
  skWindRack(2.5,y1,3.9,0,2.4,2.15,{mk:'netting',panels:2});

  /* Enclosed paperbark & shell-limewash room [-4.2..4.2, -4.3..1.8] */
  skWallRing(-4.2,-4.3,4.2,1.8,y1,gh,{
   mk:'limewash',socMk:'laterite',dado:0.2,dadoMk:'catechutrim',postMk:'mangrove',
   holes:{
    s:[{at:-1.1,w:1.32,h:2.1,door:true,leafMk:'salvage',maskMat:'terracotta',name:'cot-door'}],
    e:[{at:-1.2,w:1.05,h:1.15,y:.96,screen:true}],
    w:[{at:-1.2,w:1.05,h:1.15,y:.96,shutMk:'verdigris'}]
   }
  });
  skCeilingSlab(0,yRoof-.08,3.2,8.6,2.6,{mk:'paperbark',beamMk:'mangrove'});
  skTieredRoof(0,yRoof,-.1,9.0,9.2,2,{
   gableAxis:'z',mk:'thatch',soffitMk:'paperbark',trimMk:'ohia',neckMk:'araucaria',over:.58,tierRise:.96,neckH:.32
  });

  skTarget(-1.1,y1,3.1,'drying-deck',true);
  skTarget(0,y1,-1.3,'cot-living-room',true);
  skFurnList([
   ['sk_pandan_sleep_mat',-2.3,y1,-2.8,0],
   ['sk_araucaria_trestle_table',1.8,y1,-2.2,PI/2],
   ['sk_mangrove_knee_stool',.5,y1,-2.2,0],
   ['sk_brucite_salt_jar_rack',2.6,y1,.4,PI],
   ['sk_pumice_net_tub',-2.8,y1,3.2,0,{setting:'outdoor'}],
   ['job_fish_tray',-1.2,y1,3.8,0,{setting:'outdoor'}]
  ]);
 }
});

/* 2. Salvaged Hull-Plank & Paperbark Shore Shack on Tarred Mangrove Cribs (Eternian wooden harbour + Hueru-Kuran awning) */
defBuilding({
 key:'sk_boardwalk_shack',
 name:'Tarred-Crib Salvage Plank and Paperbark Shack',
 seed:8602,w:13.4,d:14.2,h:8.4,budget:44000,cut:true,
 front:{x:0,z:5.9,yaw:0},
 materials:SK_BILLS.sk_boardwalk_shack.materials,
 bill:SK_BILLS.sk_boardwalk_shack.bill,
 tags:{types:['dwelling-single'],wealth:'poor',style:'harbour-crib',role:'shack',job:'carpentry'},
 note:'salvaged ship hull-plank and Melaleuca paperbark shore cot on braced tarred mangrove-pile cribs, mangrove boardwalk apron, oiled sharkskin rain-hood and clay door mask',
 build(){
  skAttachBill('sk_boardwalk_shack');
  const y1=.68,gh=2.82,yRoof=y1+gh;
  skWoodCrib(0,-.4,8.8,8.4,y1,{deckMk:'mangrove',steps:false});
  skBoardwalk(-4.4,4.2,4.4,4.2,0,y1,1.7,{rails:true});
  skStair(0,0,6.2,0,y1,5.0,1.75,{mk:'mangrove',sideMk:'tarmangrove',openUnder:true});

  skWallRing(-4.1,-4.2,4.1,2.4,y1,gh,{
   mk:'salvage',socMk:'tarmangrove',socle:.32,postMk:'tarmangrove',
   holes:{
    s:[{at:0,w:1.3,h:2.08,door:true,frameMk:'araucaria',leafMk:'salvage',maskMat:'terracotta',name:'shack-door'},
       {at:-2.4,w:.95,h:1.05,y:.96,frameMk:'araucaria',shutMk:'catechutrim'}],
    e:[{at:-.9,w:1.0,h:1.1,y:.96,frameMk:'araucaria',shutMk:'verdigris'}],
    w:[{at:-.9,w:1.0,h:1.1,y:.96,frameMk:'araucaria',shutMk:'verdigris'}]
   }
  });
  skGableRoof(0,yRoof,-.9,8.6,7.0,1.75,{mk:'thatch',wallMk:'paperbark',alongZ:true,decoCrown:true,over:.52});
  skSharkskinAwning(-3.2,2.5,3.2,4.8,y1,y1+2.55,{mk:'sharkhide',sag:.22});

  skTarget(0,y1,3.8,'boardwalk-apron',false);
  skTarget(0,y1,-.9,'shack-room',true);
  skFurnList([
   ['sk_pandan_sleep_mat',-2.2,y1,-2.6,0],
   ['sk_araucaria_trestle_table',1.9,y1,-1.8,PI/2],
   ['sk_mangrove_knee_stool',.6,y1,-1.8,0],
   ['sk_catechu_sea_chest',-2.2,y1,.8,PI],
   ['sk_shell_oil_lamp',2.6,y1,.9,0],
   ['generic_barrel',3.2,y1,3.2,0,{setting:'outdoor'}]
  ]);
 }
});

/* 3. Two-Household Yard-Crew Rowhouse on Shared Tarred Mangrove Boardwalk (poor, dwelling-multi) */
defBuilding({
 key:'sk_crib_rowhouse',
 name:'Yard-Crew Mangrove-Boardwalk Rowhouse',
 seed:8603,w:18.6,d:13.8,h:9.2,budget:56000,cut:true,
 front:{x:0,z:5.9,yaw:0},
 materials:SK_BILLS.sk_crib_rowhouse.materials,
 bill:SK_BILLS.sk_crib_rowhouse.bill,
 tags:{types:['dwelling-multi'],wealth:'poor',style:'harbour-crib',role:'rowhouse',job:'fishing'},
 note:'two-family Shore-kin yard-crew rowhouse on shared arched laterite piers and a tarred mangrove boardwalk, pierced brucite vents, sharkskin awning and tiered uluhe thatch',
 build(){
  skAttachBill('sk_crib_rowhouse');
  const y1=.74,gh=2.92,yRoof=y1+gh;
  skArchedSocle(15.4,9.0,y1,{pierMk:'pillowbasalt',archMk:'laterite',topMk:'mangrove',stepW:2.4,stepRun:1.55});

  skWallRing(-7.2,-4.1,7.2,2.1,y1,gh,{
   mk:'salvage',socMk:'laterite',dado:.18,dadoMk:'catechutrim',postMk:'tarmangrove',
   holes:{
    s:[{at:-3.6,w:1.3,h:2.1,door:true,leafMk:'araucaria',maskMat:'terracotta',name:'rowhouse-west-door'},
       {at:3.6,w:1.3,h:2.1,door:true,leafMk:'araucaria',maskMat:'terracotta',name:'rowhouse-east-door'},
       {at:0,w:1.2,h:1.15,y:.96,screen:true}],
    n:[{at:-3.6,w:1.05,h:1.1,y:.98,screen:true},{at:3.6,w:1.05,h:1.1,y:.98,screen:true}],
    e:[{at:-1.0,w:1.05,h:1.1,y:.98,shutMk:'verdigris'}],
    w:[{at:-1.0,w:1.05,h:1.1,y:.98,shutMk:'verdigris'}]
   }
  });
  /* Internal party wall with open central passage so both flats connect cleanly */
  skWall(0,-3.8,0,1.8,y1,gh-.12,{mk:'paperbark',socMk:'laterite',t:.24,holes:[{at:3.0,w:1.2,h:2.05,gap:true}]});

  skSharkskinAwning(-6.4,2.2,6.4,4.3,y1,y1+2.6,{mk:'rayhide',sag:.24});
  skTieredRoof(0,yRoof,-1.0,15.0,6.8,2,{
   gableAxis:'x',mk:'thatch',soffitMk:'paperbark',trimMk:'ohia',neckMk:'araucaria',over:.58,tierRise:.95,neckH:.32
  });

  skTarget(-3.6,y1,-1.0,'west-crew-flat',true);
  skTarget(3.6,y1,-1.0,'east-crew-flat',true);
  skTarget(0,y1,3.3,'shared-porch-deck',false);
  skFurnList([
   ['sk_pandan_sleep_mat',-5.2,y1,-2.6,0],
   ['sk_araucaria_trestle_table',-2.2,y1,-2.0,0],
   ['sk_catechu_sea_chest',-5.4,y1,.6,PI/2],
   ['sk_pandan_sleep_mat',5.2,y1,-2.6,0],
   ['sk_araucaria_trestle_table',2.2,y1,-2.0,0],
   ['sk_brucite_salt_jar_rack',5.4,y1,.5,-PI/2],
   ['sk_pumice_net_tub',-5.6,y1,3.3,0,{setting:'outdoor'}],
   ['job_net_frame',5.4,y1,3.3,0,{setting:'outdoor'}]
  ]);
 }
});

/* 4. Hexagonal Shell-Limewash Artisan House (Eternian hex plan + brucite screens + Rian ohia-crowned thatch) */
defBuilding({
 key:'sk_hex_lime_house',
 name:'Hexagonal Shell-Limewash Artisan House',
 seed:8604,w:14.6,d:15.4,h:10.4,budget:56000,cut:true,
 front:{x:0,z:6.4,yaw:0},
 materials:SK_BILLS.sk_hex_lime_house.materials,
 bill:SK_BILLS.sk_hex_lime_house.bill,
 tags:{types:['dwelling-single'],wealth:'middle',style:'eternian-hex',role:'house',job:'weaving'},
 note:'six-sided shell-limewashed pumice and laterite artisan house with pierced brucite-travertine screens, verdigris shutters, closed-eyed laterite-clay door mask and hexagonal Costularia thatch cone',
 build(){
  skAttachBill('sk_hex_lime_house');
  const R=5.2,y1=.64,gh=3.25,yRoof=y1+gh;
  skHexCrib(0,-.2,R+.35,y1,{masonry:true,baseMk:'laterite',capMk:'brucite',topMk:'paving',stepW:2.2,stepRun:1.35});

  W(0,0,-.2,0,()=>{
   skHexWallRing(0,0,R,y1,gh,{
    mk:'limewash',socMk:'laterite',dado:.22,dadoMk:'verdigris',postMk:'brucite',
    faces:{
     1:[{x:0,w:1.45,h:2.18,door:true,frameMk:'brucite',leafMk:'araucaria',maskMat:'terracotta',name:'hex-house-door'}],
     0:[{x:0,w:1.25,h:1.25,y:.96,screen:true}],
     2:[{x:0,w:1.25,h:1.25,y:.96,screen:true}],
     3:[{x:0,w:1.15,h:1.2,y:.98,shutMk:'verdigris'}],
     4:[{x:0,w:1.25,h:1.25,y:.96,screen:true}],
     5:[{x:0,w:1.15,h:1.2,y:.98,shutMk:'verdigris'}]
    }
   });
   skHexRoof(0,yRoof,0,R,2.85,{mk:'thatch',finialMk:'ohia',over:.62});
  });

  skWindRack(-4.6,0,4.8,.35,2.2,2.25,{mk:'byssus',panels:2,pumiceFloats:false});
  skTarget(0,y1,-.2,'hex-artisan-hall',true);
  skFurnList([
   ['sk_byssus_spindle_frame',-2.4,y1,-1.8,.5],
   ['sk_araucaria_trestle_table',1.9,y1,-1.4,-PI/3],
   ['sk_mangrove_knee_stool',.8,y1,-.9,0],
   ['sk_pandan_sleep_mat',0,y1,-3.2,0],
   ['sk_ancestor_mask_shrine',-2.8,y1,.9,PI/3],
   ['sk_catechu_sea_chest',2.6,y1,1.1,-2*PI/3],
   ['sk_shell_oil_lamp',1.6,y1,2.1,0]
  ]);
 }
});

/* 5. Extended-Family Battered Serpentinite & Mangrove-Knee Lodge (Hueru-Kuran chise strand in Arch serpentinite & dunite) */
defBuilding({
 key:'sk_serpentine_lodge',
 name:'Battered Serpentinite and Mangrove-Rib Clan Lodge',
 seed:8605,w:17.2,d:17.8,h:9.6,budget:64000,cut:true,
 front:{x:0,z:7.2,yaw:0},
 materials:SK_BILLS.sk_serpentine_lodge.materials,
 bill:SK_BILLS.sk_serpentine_lodge.bill,
 tags:{types:['dwelling-multi'],wealth:'middle',style:'serpentine-ring',role:'lodge',job:'herding'},
 note:'extended-family battered white-veined green serpentinite and buff-rind dunite ring-wall lodge with steamed mangrove-knee and drift whale-rib vault, paperbark liner, coastal turf dome, terracotta flame-crown and ray-hide porch awning',
 build(){
  skAttachBill('sk_serpentine_lodge');
  const y1=.48;
  skArchedSocle(14.6,14.2,y1,{pierMk:'pillowbasalt',archMk:'serpentinite',topMk:'paving',stepW:2.6,stepRun:1.15});

  skSerpentineLodgeShell(0,-.5,y1,5.7,1.45,2.85,2.45,{
   ribs:10,crownH:.86,crownFins:4,
   doors:[{yaw:0,w:1.48,h:2.14,frameMk:'brucite',leafMk:'araucaria',maskMat:'terracotta',name:'lodge-main-door'}],
   windows:[{yaw:PI/2,w:1.0,y:.98,h:.96,screen:true},{yaw:-PI/2,w:1.0,y:.98,h:.96,screen:true}]
  });

  /* Front ray-hide & mangrove porch canopy + shell chimes */
  skSharkskinAwning(-2.6,4.6,2.6,6.6,y1,y1+2.65,{mk:'rayhide',sag:.22});
  skShellChimes(-2.2,y1+2.52,6.55,0,1.2,.68,4);

  skTarget(0,y1+.08,-.5,'serpentine-hearth-hall',true);
  skTarget(0,y1,5.6,'lodge-porch',false);
  skFurnList([
   ['sk_laterite_hearth_brazier',0,y1+.08,-.5,0],
   ['sk_pandan_sleep_mat',-2.6,y1+.08,-1.8,PI/4],
   ['sk_pandan_sleep_mat',2.6,y1+.08,-1.8,-PI/4],
   ['sk_araucaria_trestle_table',-2.2,y1+.08,1.3,PI/2],
   ['sk_mangrove_knee_stool',-1.0,y1+.08,1.3,0],
   ['sk_brucite_salt_jar_rack',2.5,y1+.08,1.2,-PI/2],
   ['sk_ancestor_mask_shrine',0,y1+.08,-3.3,0]
  ]);
 }
});

/* 6. Prosperous Factor & Master-Shipwright Two-Storey House (Rian socle & tiered roof + Eternian limewash + paktong) */
defBuilding({
 key:'sk_compound_house',
 name:'Shipwright Two-Storey Socle and Tiered-Roof House',
 seed:8606,w:18.4,d:17.8,h:14.2,budget:78000,cut:true,
 front:{x:0,z:7.5,yaw:0},
 materials:SK_BILLS.sk_compound_house.materials,
 bill:SK_BILLS.sk_compound_house.bill,
 tags:{types:['dwelling-single','shop'],wealth:'rich',style:'rian-eternian',role:'manor',job:'shipwrighting'},
 note:'prosperous factor and master-shipwright two-storey house on an arched laterite and basalt flood socle, shell-limewashed ground shop-hall with brucite screens, exterior stair to upper Araucaria-offcut gallery, two-tier thatch roof with ohia horns and paktong mask',
 build(){
  skAttachBill('sk_compound_house');
  const y1=.92,h1=3.25,y2=y1+h1,h2=3.05,yRoof=y2+h2;
  skArchedSocle(14.8,13.6,y1,{pierMk:'pillowbasalt',archMk:'laterite',topMk:'paving',stepW:2.6,stepRun:1.9});

  /* Ground-floor shell-limewash factor hall [-6.2..4.2, -5.8..2.2] leaving east stair bay & front arcade */
  skWallRing(-6.2,-5.8,4.2,2.2,y1,h1,{
   mk:'limewash',socMk:'laterite',dado:.24,dadoMk:'catechutrim',postMk:'brucite',
   holes:{
    s:[{at:-1.0,w:1.52,h:2.22,door:true,frameMk:'brucite',leafMk:'araucaria',maskMat:'paktong',doorStyle:'double',name:'compound-ground-door'},
       {at:-4.2,w:1.3,h:1.3,y:.96,screen:true},{at:2.0,w:1.3,h:1.3,y:.96,screen:true}],
    n:[{at:-3.2,w:1.25,h:1.25,y:.98,screen:true},{at:1.2,w:1.25,h:1.25,y:.98,screen:true}],
    w:[{at:-1.8,w:1.25,h:1.25,y:.98,shutMk:'verdigris'}]
   }
  });
  skArcade(-6.2,5.6,4.2,5.6,y1,h1,{mk:'brucite',trimMk:'laterite',bays:3,block:false});

  /* Covered east shipwright stair climbing cleanly from ground veranda (5.6, y1, 4.4) to upper gallery (5.6, y2, -1.6) */
  skStair(5.6,y1,4.4,5.6,y2,-1.6,1.65,{mk:'araucaria',sideMk:'mangrove',openUnder:true});

  /* Second-storey Araucaria-offcut & mangrove floor + front veranda + upper family hall */
  skFloorSlab(-1.0,y2,-.2,11.2,11.6,{th:.14,mk:'floor'});
  skFloorSlab(5.6,y2,-3.8,2.2,3.8,{th:.14,mk:'floor'});
  skWallRing(-6.2,-5.6,4.2,2.0,y2,h2,{
   mk:'araucaria',socMk:'catechutrim',socle:.28,postMk:'mangrove',
   holes:{
    s:[{at:-1.0,w:1.42,h:2.12,door:true,frameMk:'ohia',leafMk:'araucaria',maskMat:'terracotta',name:'compound-upper-door'},
       {at:-4.0,w:1.2,h:1.2,y:.92,shutMk:'verdigris'},{at:2.0,w:1.2,h:1.2,y:.92,shutMk:'verdigris'}],
    e:[{at:-3.6,w:1.32,h:2.1,door:true,frameMk:'ohia',leafMk:'araucaria',mask:false,name:'compound-stair-door'}],
    n:[{at:-1.0,w:1.3,h:1.2,y:.95,screen:true}],
    w:[{at:-1.8,w:1.2,h:1.2,y:.95,shutMk:'verdigris'}]
   }
  });
  /* Upper front veranda posts, catechu balustrade & solid veranda ceiling */
  svNoWalk(()=>{
   for(const px of [-6.0,-2.5,1.0,4.2,6.4]){
    cyl('mangrove',px,y2,5.2,.13,h2-.12,P('mangrove'),8);
   }
   box('catechutrim',-.6,y2+.02,5.2,11.4,.78,.09,P('catechutrim'));
   box('paktong',-.6,y2+.81,5.2,11.45,.05,.12,P('paktong'));
  });
  skCeilingSlab(0,yRoof-.08,0,13.6,11.8,{mk:'paperbark',beamMk:'araucaria'});
  skTieredRoof(0,yRoof,-.2,13.8,12.0,2,{
   gableAxis:'x',mk:'thatch',soffitMk:'paperbark',trimMk:'ohia',neckMk:'catechutrim',over:.68,tierRise:1.18,neckH:.38
  });
  skWindRack(-6.8,0,5.2,0,1.8,3.2,{mk:'catechu',panels:1,pumiceFloats:false});

  skTarget(-1.0,y1,-1.8,'factor-ground-hall',true);
  skTarget(-1.0,y1,3.8,'arcaded-veranda',true);
  skTarget(-1.0,y2,-1.8,'shipwright-upper-hall',true);
  skFurnList([
   ['sk_paktong_tally_scale',-1.0,y1,-3.8,0],
   ['sk_catechu_sea_chest',-4.4,y1,-3.6,PI/2],
   ['sk_brucite_salt_jar_rack',2.4,y1,-3.6,-PI/2],
   ['sk_shell_oil_lamp',2.2,y1,.6,0],
   ['sk_pandan_sleep_mat',-3.8,y2,-3.6,0],
   ['sk_araucaria_trestle_table',1.4,y2,-2.2,0],
   ['sk_mangrove_knee_stool',1.4,y2,-1.0,PI],
   ['sk_ancestor_mask_shrine',-4.2,y2,.4,PI/2]
  ]);
 }
});

/* 7. Clan Sea-Silk Dyer & Factor Courtyard House (rich, dwelling-multi + shop) */
defBuilding({
 key:'sk_byssus_court',
 name:'Sea-Byssus and Catechu Courtyard House',
 seed:8607,w:20.4,d:19.2,h:11.4,budget:82000,cut:true,
 front:{x:0,z:8.2,yaw:0},
 materials:SK_BILLS.sk_byssus_court.materials,
 bill:SK_BILLS.sk_byssus_court.bill,
 tags:{types:['dwelling-multi','shop'],wealth:'rich',style:'eternian-rian',role:'court',job:'dyeing'},
 note:'prosperous multi-family sea-silk weaver and catechu-dyer courtyard house with a serpentinite and brucite plinth, twin arcaded wings around a rainwater basin, paktong portal mask and golden sea-byssus drying skeins',
 build(){
  skAttachBill('sk_byssus_court');
  const y1=.66,gh=3.35,yRoof=y1+gh;
  skArchedSocle(17.8,15.6,y1,{pierMk:'serpentinite',archMk:'brucite',topMk:'paving',stepW:2.8,stepRun:1.45});

  /* Rear main weaver hall [-8.0..8.0, -7.0..-1.2] + West & East residential/shop wings */
  skWallRing(-8.0,-7.0,8.0,-1.2,y1,gh,{
   mk:'limewash',socMk:'serpentinite',dado:.22,dadoMk:'verdigris',postMk:'brucite',
   holes:{
    s:[{at:0,w:1.58,h:2.24,door:true,frameMk:'brucite',leafMk:'araucaria',maskMat:'paktong',doorStyle:'double',name:'court-hall-door'},
       {at:-4.6,w:1.35,h:1.3,y:.96,screen:true},{at:4.6,w:1.35,h:1.3,y:.96,screen:true}],
    n:[{at:-4.0,w:1.25,h:1.25,y:.98,screen:true},{at:4.0,w:1.25,h:1.25,y:.98,screen:true}]
   }
  });
  skTieredRoof(0,yRoof,-4.1,16.4,6.2,2,{
   gableAxis:'x',mk:'thatch',soffitMk:'paperbark',trimMk:'ohia',neckMk:'araucaria',over:.62,tierRise:1.08,neckH:.34
  });

  /* West & East residential wings [-8.0..-4.2, -.4..6.4] and [4.2..8.0, -.4..6.4] */
  for(const s of [-1,1]){
   const x0=s<0?-8.0:4.2,x1=s<0?-4.2:8.0,cx=(x0+x1)/2;
   skWallRing(x0,-.4,x1,6.4,y1,gh*.92,{
    mk:'limewash',socMk:'serpentinite',postMk:'brucite',
    holes:s<0?{
     e:[{at:3.0,w:1.35,h:2.12,door:true,leafMk:'araucaria',maskMat:'terracotta',name:'court-west-wing-door'}],
     s:[{at:cx,w:1.15,h:1.18,y:.96,screen:true}]
    }:{
     w:[{at:3.0,w:1.35,h:2.12,door:true,leafMk:'araucaria',maskMat:'terracotta',name:'court-east-wing-door'}],
     s:[{at:cx,w:1.15,h:1.18,y:.96,screen:true}]
    }
   });
   skGableRoof(cx,y1+gh*.92,3.0,4.1,7.0,1.45,{mk:'thatch',wallMk:'limewash',alongZ:true,decoCrown:true,over:.45});
  }

  /* Front arched brucite gate-beam + central rainwater & rinsing basin (core/water still) + byssus skein rack */
  skArcade(-4.1,6.4,4.1,6.4,y1,gh*.92,{mk:'brucite',trimMk:'serpentinite',bays:1,block:false});
  svNoWalk(()=>{
   skMask(0,y1+gh*.92+.38,6.68,.46,'paktong');
   /* Curbed brucite rainwater basin at (0, 2.4) */
   for(const sz of [-1.25,1.25])box('brucite',0,y1+.01,2.4+sz,3.2,.44,.24,P('brucite'));
   for(const sx of [-1.48,1.48])box('brucite',sx,y1+.01,2.4,.24,.44,2.02,P('brucite'));
   box('serpentinite',0,y1+.01,2.4,2.72,.08,2.02,P('serpentinite'));
  });
  skWallBlock(0,y1,2.4,3.2,.85,2.5,0);
  skWaterStill('byssus-court-basin',0,2.4,1.3,0.95,y1+.34,{shallow:0x3e8c8e,deep:0x1b4e58});
  skWindRack(-2.6,y1,4.8,0,2.0,2.3,{mk:'byssus',panels:2,pumiceFloats:false});
  skWindRack(2.6,y1,4.8,0,2.0,2.3,{mk:'catechu',panels:2,pumiceFloats:false});

  skTarget(0,y1,-4.1,'byssus-main-hall',true);
  skTarget(-6.1,y1,3.0,'west-dyer-wing',true);
  skTarget(6.1,y1,3.0,'east-factor-wing',true);
  skTarget(0,y1,5.4,'court-entry',false);
  skFurnList([
   ['sk_byssus_spindle_frame',-4.6,y1,-4.2,0],
   ['sk_byssus_spindle_frame',4.6,y1,-4.2,0],
   ['sk_paktong_tally_scale',0,y1,-5.2,0],
   ['sk_araucaria_trestle_table',-6.1,y1,1.4,PI/2],
   ['sk_pandan_sleep_mat',6.1,y1,1.4,PI/2],
   ['sk_catechu_sea_chest',6.1,y1,4.8,PI],
   ['sk_shell_oil_lamp',-2.2,y1,-2.2,0],
   ['sk_kauri_gum_cauldron',-6.1,y1,4.8,0]
  ]);
 }
});

/* 8. Caretaker House's Grand Shore-Kin Client Moot & Tally Hall (Hex Pavilion + Arched Colonnade + 3-Tier Roof + Paktong Mask) */
defBuilding({
 key:'sk_client_hall',
 name:'Shore-Kin Client Moot and Paktong Tally Hall',
 seed:8608,w:22.8,d:23.6,h:15.8,budget:96000,cut:true,
 front:{x:0,z:9.8,yaw:0},
 materials:SK_BILLS.sk_client_hall.materials,
 bill:SK_BILLS.sk_client_hall.bill,
 tags:{types:['civic','market'],wealth:'rich',style:'caretaker-client',role:'moot-hall',job:'customs'},
 note:'the Fleet-born caretaker house grand Shore-kin client moot and tally hall: hexagonal shell-limewash pavilion encircled by an arched brucite-travertine and laterite colonnade on a stepped flood socle, 3-tier Costularia roof with ohia horns, paktong ancestor mask and spun sea-byssus banners',
 build(){
  skAttachBill('sk_client_hall');
  const y1=1.08,gh=4.15,yRoof=y1+gh,R=6.2;
  skArchedSocle(19.4,19.4,y1,{pierMk:'pillowbasalt',archMk:'laterite',topMk:'paving',stepW:3.4,stepRun:2.2});

  /* Outer arched brucite-travertine & laterite peristyle colonnade [-9.0..9.0, -9.0..9.0] */
  skArcade(-9.0,9.0,9.0,9.0,y1,gh,{mk:'brucite',trimMk:'laterite',bays:5,block:false});
  skArcade(9.0,-9.0,-9.0,-9.0,y1,gh,{mk:'brucite',trimMk:'laterite',bays:5,block:false});
  skArcade(9.0,9.0,9.0,-9.0,y1,gh,{mk:'brucite',trimMk:'laterite',bays:5,block:false});
  skArcade(-9.0,-9.0,-9.0,9.0,y1,gh,{mk:'brucite',trimMk:'laterite',bays:5,block:false});

  /* Inner hexagonal shell-limewash moot & tally chamber (R = 6.2) */
  skHexWallRing(0,0,R,y1,gh,{
   mk:'limewash',socMk:'serpentinite',dado:.28,dadoMk:'catechutrim',postMk:'brucite',
   faces:{
    1:[{x:0,w:1.85,h:2.55,door:true,frameMk:'brucite',leafMk:'ohia',trimMk:'paktong',maskMat:'paktong',doorStyle:'double',name:'client-hall-main-door'}],
    4:[{x:0,w:1.55,h:2.35,door:true,frameMk:'brucite',leafMk:'araucaria',maskMat:'paktong',doorStyle:'double',name:'client-hall-rear-door'}],
    0:[{x:0,w:1.55,h:1.55,y:1.05,screen:true}],
    2:[{x:0,w:1.55,h:1.55,y:1.05,screen:true}],
    3:[{x:0,w:1.55,h:1.55,y:1.05,screen:true}],
    5:[{x:0,w:1.55,h:1.55,y:1.05,screen:true}]
   }
  });

  /* Solid coffered ceiling across full colonnade + 3-tier Rian Costularia thatch roof with ohia horns & paktong finial */
  skTieredRoof(0,yRoof,0,18.4,18.4,3,{
   gableAxis:'z',mk:'thatch',soffitMk:'paperbark',trimMk:'ohia',neckMk:'catechutrim',
   over:.72,stepIn:.72,tierRise:1.35,neckH:.42
  });

  /* Fleet-born catechu & spun sea-byssus client banners flanking the grand stair */
  skWindRack(-5.6,0,9.8,0,2.1,3.6,{mk:'byssus',panels:2,pumiceFloats:false});
  skWindRack(5.6,0,9.8,0,2.1,3.6,{mk:'catechu',panels:2,pumiceFloats:false});
  skShellChimes(-3.4,y1+gh-.25,9.1,0,1.6,.8,5);
  skShellChimes(3.4,y1+gh-.25,9.1,0,1.6,.8,5);

  skTarget(0,y1,0,'client-moot-rotunda',true);
  skTarget(0,y1,7.4,'south-tally-loggia',true);
  skTarget(7.4,y1,0,'east-tally-loggia',true);
  skFurnList([
   ['sk_paktong_tally_scale',0,y1,-2.8,0],
   ['sk_paktong_ingot_rack',-3.0,y1,-2.0,PI/3],
   ['sk_paktong_ingot_rack',3.0,y1,-2.0,-PI/3],
   ['sk_laterite_hearth_brazier',0,y1,.4,0],
   ['sk_araucaria_trestle_table',-2.8,y1,1.8,PI/6],
   ['sk_araucaria_trestle_table',2.8,y1,1.8,-PI/6],
   ['sk_mangrove_knee_stool',-1.8,y1,2.4,0],
   ['sk_mangrove_knee_stool',1.8,y1,2.4,0],
   ['sk_ancestor_mask_shrine',0,y1,-4.6,0],
   ['sk_shell_oil_lamp',-3.4,y1,7.2,0],
   ['sk_shell_oil_lamp',3.4,y1,7.2,0]
  ]);
 }
});
