// prefix: sk
// ================================================================= SHORE-KIN HINTERLAND WORKS, HARBOUR SHEDS & TIDE SHRINE (58-sk-works.js)
// Eight village works, yard sheds & sacred intertidal structures feeding Arcoforte's spring campaigns:
//   9.  sk_ash_kelp_kiln   — Pycnandra nickel-shrub turf-sealed ash clamp + stone kelp trench kiln + mangrove drying racks
//   10. sk_spar_sawpit     — Araucaria/Agathis trestle saw pit, kauri-gum pitch pot & steaming trough for mangrove knees
//   11. sk_ropewalk_pitch  — Coir/hibiscus/byssus rope walk under sharkskin canopy + gjar bitumen & kauri-gum boiler
//   12. sk_paktong_foundry — Casuarina-bedded copper/zinc roast heap + serpentinite/laterite paktong cupola with kaen crown, bellows & ingot racks
//   13. sk_fish_saltery    — Intertidal basalt & wattled mangrove fish weir (core/water) + brucite salt pans + twin-crown smokehouse
//   14. sk_lime_kiln       — Battered serpentinite & laterite draw-arch shell & limeshelf travertine kiln + slaking shed
//   15. sk_boat_grid_shed  — Tarred mangrove-crib skiff & tender careening grid and repair shed with launch skids & hull in frame
//   16. sk_tide_shrine     — Stepped serpentinite/brucite shrine with spring/neap/Double-Dark paktong-inlaid tide post & shell chimes

/* 9. Pycnandra Nickel-Shrub Ash Clamp & Intertidal Kelp-Burning Trench Kiln */
defBuilding({
 key:'sk_ash_kelp_kiln',
 name:'Pycnandra Nickel-Ash Clamp and Kelp Kiln',
 seed:8609,w:18.8,d:15.4,h:8.4,budget:52000,cut:true,
 front:{x:0,z:6.4,yaw:0},
 materials:SK_BILLS.sk_ash_kelp_kiln.materials,
 bill:SK_BILLS.sk_ash_kelp_kiln.bill,
 tags:{types:['industry'],wealth:'poor',style:'hinterland-kiln',role:'ash-kiln',job:'alchemy'},
 note:'Pycnandra and verdigris-mangrove nickel-shrub turf-sealed ash clamp, stone-lined intertidal kelp-burning trench kiln, mangrove kelp drying racks and ash-sifter storehouse',
 build(){
  skAttachBill('sk_ash_kelp_kiln');
  const y1=.36;
  skFloorSlab(0,y1,0,17.2,12.8,{th:.36,mk:'paving'});
  skStair(0,0,7.2,0,y1,6.4,2.6,{mk:'laterite',sideMk:'pillowbasalt'});

  /* West ash-sifting & dry-sack storehouse [-7.8..-1.8, -5.2..1.6] */
  skWallRing(-7.8,-5.2,-1.8,1.6,y1,2.95,{
   mk:'salvage',socMk:'dunite',postMk:'mangrove',
   holes:{
    s:[{at:-4.8,w:1.35,h:2.08,door:true,leafMk:'salvage',maskMat:'terracotta',name:'ash-shed-door'}],
    e:[{at:-1.8,w:1.0,h:1.05,y:.96,screen:true}]
   }
  });
  skGableRoof(-4.8,y1+2.95,-1.8,6.4,7.2,1.45,{mk:'thatch',wallMk:'paperbark',alongZ:true,over:.48});

  svNoWalk(()=>{
   /* North-East turf-sealed Pycnandra nickel-shrub ash clamp at (3.8, -2.6) with blue-green verdigris ash crust */
   cyl('dunite',3.8,y1+.01,-2.6,2.65,.62,P('dunite'),16);
   lathe('turf',3.8,-2.6,[[2.55,y1+.63],[2.05,y1+1.55],[.95,y1+2.15]],16,P('turf'));
   cyl('verdigris',3.8,y1+2.15,-2.6,.98,.12,P('verdigris'),14);
   cyl('glow',3.8,y1+2.28,-2.6,.56,.05,P('ember'),12);
   smokeAt(3.8,y1+2.45,-2.6,{r:.52,kind:'fire'});
   haloAt(3.8,y1+2.35,-2.6,0xff8e38,true);

   /* South-East pillow-basalt intertidal kelp-burning trench kiln at (3.8, 2.6) */
   for(const sz of [1.75,3.45])box('pillowbasalt',3.8,y1+.01,sz,6.4,.54,.38,P('pillowbasalt'));
   for(const sx of [.79,6.81])box('pillowbasalt',sx,y1+.01,2.6,.38,.54,1.32,P('pillowbasalt'));
   box('ash',3.8,y1+.01,2.6,5.64,.24,1.32,P('ash'));
   box('glow',2.9,y1+.26,2.6,2.4,.04,.62,P('ember'));
   smokeAt(2.9,y1+.55,2.6,{r:.48,kind:'fire'});
   /* Stacked Casuarina fuelwood billets */
   const casCol=P('casuarina');
   for(let k=0;k<4;k++)beam('casuarina',[7.2,y1+.12+k*.2,-.9],[7.2,y1+.12+k*.2,.5],.08,casCol,true,8);
  });
  skWallBlock(3.8,y1,-2.6,5.1,1.6,5.1,0);
  skWallBlock(3.8,y1,2.6,6.4,.85,2.1,0);

  /* Drying shoalkelp racks in ATMOS wind */
  skWindRack(-4.8,y1,4.2,0,3.2,2.35,{mk:'kelp',panels:3,pumiceFloats:false});

  skTarget(-4.8,y1,-1.8,'ash-sifting-shed',true);
  skTarget(0,y1,4.8,'kiln-working-apron',false);
  skFurnList([
   ['sk_brucite_salt_jar_rack',-4.8,y1,-3.8,0],
   ['sk_catechu_sea_chest',-6.4,y1,-.8,PI/2],
   ['generic_sack',-3.2,y1,-2.8,0],
   ['generic_barrel',-3.2,y1,.2,0],
   ['sk_shell_oil_lamp',-6.2,y1,.4,0],
   ['job_winnowing_tub',-.2,y1,3.2,0,{setting:'outdoor'}]
  ]);
 }
});

/* 10. Araucaria/Agathis Spar-Cutter's Saw Pit, Kauri-Gum Pitch Pot & Mangrove-Knee Steaming Trough */
defBuilding({
 key:'sk_spar_sawpit',
 name:'Araucaria Spar Saw-Pit and Knee Steaming Trough',
 seed:8610,w:20.4,d:16.2,h:9.4,budget:62000,cut:true,
 front:{x:0,z:6.8,yaw:0},
 materials:SK_BILLS.sk_spar_sawpit.materials,
 bill:SK_BILLS.sk_spar_sawpit.bill,
 tags:{types:['industry'],wealth:'middle',style:'timber-yard',role:'sawpit',job:'carpentry'},
 note:'Araucaria and Agathis spar-cutter trestle and lined saw pit, stone-hearth kauri-gum varnish and pitch pot, steaming trough for curved mangrove boat-knees, and offcut loft under tiered thatch',
 build(){
  skAttachBill('sk_spar_sawpit');
  const y1=.42;
  skFloorSlab(0,y1,0,18.8,13.6,{th:.42,mk:'paving'});
  skStair(0,0,7.6,0,y1,6.8,2.8,{mk:'laterite',sideMk:'pillowbasalt'});

  /* West tool & pattern loft [-8.4..-2.0, -5.6..2.2] */
  skWallRing(-8.4,-5.6,-2.0,2.2,y1,3.1,{
   mk:'araucaria',socMk:'laterite',postMk:'tarmangrove',
   holes:{
    s:[{at:-5.2,w:1.42,h:2.12,door:true,frameMk:'ohia',leafMk:'araucaria',maskMat:'terracotta',name:'sawyer-shed-door'}],
    e:[{at:-1.6,w:1.2,h:1.2,y:.96,shutMk:'verdigris'}],
    w:[{at:-1.6,w:1.2,h:1.2,y:.96,shutMk:'verdigris'}]
   }
  });
  skTieredRoof(-5.2,y1+3.1,-1.7,6.8,8.2,2,{
   gableAxis:'z',mk:'thatch',soffitMk:'paperbark',trimMk:'ohia',neckMk:'araucaria',over:.55,tierRise:.95,neckH:.3
  });

  /* East elevated whip-saw trestle & lined saw pit [1.2..7.8, -4.8..-.4] */
  svNoWalk(()=>{
   for(const sz of [-4.4,-1.0]){
    box('laterite',4.5,y1+.01,sz,6.8,.42,.36,P('laterite'));
   }
   box('bitumen',4.5,y1+.01,-2.7,6.2,.08,3.0,P('bitumen'));
   for(const sx of [1.6,4.5,7.4]){
    for(const sz of [-3.9,-1.5])box('tarmangrove',sx,y1+.43,sz,.28,1.72,.28,P('tarmangrove'));
    box('tarmangrove',sx,y1+2.15,-2.7,.3,0.22,2.8,P('tarmangrove'));
   }
   /* Massive squared Araucaria spar baulk on the trestles + vertical iron pit-saw blade */
   box('araucaria',4.5,y1+2.38,-2.7,7.4,.52,.54,P('araucaria'));
   box('iron',4.2,y1+.75,-2.7,.04,2.15,.22,P('iron'));
   beam('ohia',[4.2,y1+2.92,-3.15],[4.2,y1+2.92,-2.25],.045,P('ohia'),true,6);

   /* South-East brucite-travertine mangrove-knee steaming trough at (4.5, 2.8) + steamed knees */
   for(const sz of [1.95,3.65])box('brucite',4.5,y1+.01,sz,5.8,.62,.28,P('brucite'));
   for(const sx of [1.74,7.26])box('brucite',sx,y1+.01,2.8,.28,.62,1.42,P('brucite'));
   box('laterite',4.5,y1+.01,2.8,5.24,.14,1.42,P('laterite'));
   smokeAt(4.5,y1+.72,2.8,{r:.45,kind:'steam'});
   for(let i=0;i<3;i++){
    const kx=2.8+i*1.6;
    tube('mangrove',t=>[kx,y1+.58+.36*Math.sin(PI*t),2.8+(t-.5)*.95],()=>[.07,.09],7,6,P('mangrove'),{caps:true});
   }
  });
  skWallBlock(4.5,y1,-2.7,6.6,1.2,3.4,0);
  skWallBlock(4.5,y1,2.8,5.8,.85,1.95,0);
  skWaterStill('knee-steaming-trough',4.5,2.8,2.55,0.68,y1+.5,{shallow:0x4a8e8c,deep:0x22565e});
  skSharkskinAwning(1.0,-5.0,8.0,-.2,y1,y1+3.85,{mk:'sharkhide',sag:.24});

  skTarget(-5.2,y1,-1.7,'sawyer-pattern-shed',true);
  skTarget(0,y1,4.8,'sawpit-yard',false);
  skFurnList([
   ['job_saw_bench',-5.2,y1,-3.8,0],
   ['job_plank_stack',-6.8,y1,-.8,PI/2],
   ['sk_araucaria_trestle_table',-3.6,y1,-.8,-PI/2],
   ['sk_catechu_sea_chest',-6.8,y1,1.1,0],
   ['sk_shell_oil_lamp',-3.6,y1,1.1,0],
   ['sk_kauri_gum_cauldron',-.2,y1,3.6,0,{setting:'outdoor'}],
   ['job_pole_rack',-6.8,y1,4.4,0,{setting:'outdoor'}]
  ]);
 }
});

/* 11. Coir, Hibiscus & Sea-Byssus Ropewalk and Gjar Bitumen Boiler */
defBuilding({
 key:'sk_ropewalk_pitch',
 name:'Coir and Byssus Ropewalk and Bitumen Boiler',
 seed:8611,w:22.4,d:14.6,h:8.8,budget:58000,cut:true,
 front:{x:0,z:5.9,yaw:0},
 materials:SK_BILLS.sk_ropewalk_pitch.materials,
 bill:SK_BILLS.sk_ropewalk_pitch.bill,
 tags:{types:['industry'],wealth:'middle',style:'harbour-crib',role:'ropewalk',job:'ropemaking'},
 note:'long coir, Hibiscus bast and spun sea-byssus rope walk with twisting jack-posts under an oiled sharkskin canopy, plus a gjar-seep bitumen and kauri-gum caulking boiler with laterite flame-crown',
 build(){
  skAttachBill('sk_ropewalk_pitch');
  const y1=.42;
  skFloorSlab(0,y1,0,20.8,12.2,{th:.42,mk:'paving'});
  skStair(-3.0,0,6.9,-3.0,y1,6.1,2.6,{mk:'laterite',sideMk:'pillowbasalt'});

  /* West cordage & tarred-hawser loft [-9.6..-3.2, -5.0..2.2] */
  skWallRing(-9.6,-5.0,-3.2,2.2,y1,3.05,{
   mk:'salvage',socMk:'tarmangrove',postMk:'tarmangrove',
   holes:{
    s:[{at:-6.4,w:1.38,h:2.1,door:true,frameMk:'araucaria',leafMk:'salvage',maskMat:'terracotta',name:'ropewalk-loft-door'}],
    e:[{at:-1.4,w:1.3,h:2.0,gap:true}],
    w:[{at:-1.4,w:1.05,h:1.1,y:.96,shutMk:'verdigris'}]
   }
  });
  skGableRoof(-6.4,y1+3.05,-1.4,6.8,7.6,1.6,{mk:'thatch',wallMk:'salvage',alongZ:true,decoCrown:true,over:.5});

  /* Long spinning & cable-laying walk [-2.4..9.4, -3.6..-.4] under oiled sharkskin sun-canopy */
  svNoWalk(()=>{
   for(const sx of [-2.0,1.8,5.6,9.0]){
    box('laterite',sx,y1+.01,-2.0,.42,.38,2.2,P('laterite'));
    for(const sz of [-2.8,-1.2]){
     box('mangrove',sx,y1+.39,sz,.18,1.12,.18,P('mangrove'));
     cyl('paktong',sx,y1+1.36,sz,.11,.06,P('paktong'),10);
    }
   }
   for(const sz of [-2.8,-2.0,-1.2]){
    const cMk=sz===-2.0?'byssus':'rope';
    sagRope(cMk,[-2.0,y1+1.42,sz],[9.0,y1+1.42,sz],.16,.024,P(cMk),12);
    sagRope('rope',[-2.0,y1+1.06,sz],[9.0,y1+1.06,sz],.14,.018,P('rope'),12);
   }

   /* South-East gjár bitumen & kauri-gum boiling furnace at (6.4, 3.0) with laterite flame-crown */
   box('laterite',6.4,y1+.01,3.0,4.2,1.08,2.4,P('laterite'));
   box('glow',6.4,y1+.16,4.22,.48,.42,.08,P('ember'));
   cyl('iron',5.5,y1+1.09,3.0,.78,.56,P('iron'),14);
   cyl('bitumen',5.5,y1+1.66,3.0,.68,.04,P('bitumen'),14);
   skKaenCrown(7.5,y1+1.09,2.5,.36,1.35,4,{smokeKind:'fire',bigHalo:true});
  });
  skWallBlock(6.4,y1,3.0,4.2,1.2,2.4,0);
  skSharkskinAwning(-2.4,-3.8,9.4,0.2,y1,y1+3.25,{mk:'sharkhide',sag:.25});
  skWindRack(1.2,y1,4.4,0,2.8,2.25,{mk:'catechu',panels:2,pumiceFloats:false});

  skTarget(-6.4,y1,-1.4,'cordage-store-loft',true);
  skTarget(2.2,y1,1.6,'ropewalk-alley',false);
  skFurnList([
   ['sk_byssus_spindle_frame',-6.4,y1,-3.4,0],
   ['sk_pumice_net_tub',-8.2,y1,-.8,0],
   ['sk_catechu_sea_chest',-8.0,y1,1.0,PI],
   ['job_bales',-4.8,y1,-3.4,0],
   ['sk_shell_oil_lamp',-4.8,y1,1.0,0],
   ['job_oil_drum_rack',3.2,y1,3.2,0,{setting:'outdoor'}],
   ['generic_barrel',8.8,y1,3.0,0,{setting:'outdoor'}]
  ]);
 }
});

/* 12. Copper/Zinc Roast Heap & Spring-Campaign Paktong Cupola Foundry */
defBuilding({
 key:'sk_paktong_foundry',
 name:'Paktong Cupola Foundry and Nickel-Ash Roast Yard',
 seed:8612,w:20.6,d:17.2,h:10.8,budget:68000,cut:true,
 front:{x:0,z:7.2,yaw:0},
 materials:SK_BILLS.sk_paktong_foundry.materials,
 bill:SK_BILLS.sk_paktong_foundry.bill,
 tags:{types:['industry'],wealth:'rich',style:'serpentine-foundry',role:'foundry',job:'smithing'},
 note:'Casuarina-bedded copper and zinc ore roast heap with Pycnandra nickel-ash flux, battered serpentinite and laterite reverberatory and paktong cupola furnace crowned by a tall flame-terracotta chimney, ray-hide bellows and white paktong ingot racks',
 build(){
  skAttachBill('sk_paktong_foundry');
  const y1=.54;
  skArchedSocle(18.4,14.2,y1,{pierMk:'pillowbasalt',archMk:'serpentinite',topMk:'paving',stepW:2.8,stepRun:1.25});

  /* West assay, bellows & ingot casting hall [-8.2..-.2, -5.8..2.6] */
  skWallRing(-8.2,-5.8,-.2,2.6,y1,3.45,{
   mk:'limewash',socMk:'serpentinite',dado:.24,dadoMk:'verdigris',postMk:'brucite',
   holes:{
    s:[{at:-4.2,w:1.55,h:2.22,door:true,frameMk:'brucite',leafMk:'araucaria',maskMat:'paktong',doorStyle:'double',name:'foundry-hall-door'}],
    e:[{at:-1.6,w:1.6,h:2.25,gap:true}],
    n:[{at:-4.2,w:1.25,h:1.2,y:1.0,screen:true}],
    w:[{at:-1.6,w:1.25,h:1.2,y:1.0,screen:true}]
   }
  });
  skTieredRoof(-4.2,y1+3.45,-1.6,8.4,8.8,2,{
   gableAxis:'z',mk:'thatch',soffitMk:'paperbark',trimMk:'ohia',neckMk:'catechutrim',over:.6,tierRise:1.05,neckH:.34
  });

  svNoWalk(()=>{
   /* Central-East battered serpentinite & laterite paktong cupola + reverberatory hearth at (3.6, -2.4) */
   box('serpentinite',3.6,y1+.01,-2.4,4.6,1.35,4.2,P('serpentinite'));
   lathe('laterite',3.6,-2.4,[[2.1,y1+1.36],[1.75,y1+2.95],[1.12,y1+4.45]],16,P('laterite'));
   skKaenCrown(3.6,y1+4.47,-2.4,.68,1.55,6,{smokeKind:'fire',bigHalo:true});
   /* Glowing tap-breast & brucite pig/ingot sand-bed along +z face */
   box('brucite',3.6,y1+.01,.45,3.2,.34,1.35,P('brucite'));
   box('glow',3.6,y1+.52,-.26,.54,.46,.08,P('flame'));
   haloAt(3.6,y1+.8,.1,0xffa848,true);
   for(let i=-2;i<=2;i++)box('paktong',3.6+i*.48,y1+.36,.45,.28,.08,.78,P('paktong'));

   /* South-East Casuarina-bedded copper/zinc & verdigris nickel-ash roast heap at (5.6, 3.6) */
   for(let k=0;k<5;k++)cyl('casuarina',4.2+k*.68,y1+.12,3.6,.11,2.2,P('casuarina'),8);
   ellip('copperore',5.6,y1+.32,3.6,1.55,.68,1.15,P('copperore'),0,12);
   ellip('verdigris',5.6,y1+.78,3.6,.95,.36,.72,P('verdigris'),.4,10);
   smokeAt(5.6,y1+1.2,3.6,{r:.42,kind:'fire'});
  });
  skWallBlock(3.6,y1,-2.4,4.6,2.2,4.2,0);
  skWallBlock(3.6,y1,.45,3.2,.85,1.35,0);
  skWallBlock(5.6,y1,3.6,3.2,1.1,2.4,0);
  skSharkskinAwning(1.0,-4.8,6.4,1.4,y1,y1+4.15,{mk:'rayhide',sag:.2});

  skTarget(-4.2,y1,-1.6,'foundry-assay-floor',true);
  skTarget(1.2,y1,3.6,'cupola-tapping-yard',false);
  skFurnList([
   ['sk_sharkskin_bellows',-1.8,y1,-2.4,0],
   ['sk_paktong_ingot_rack',-6.4,y1,-3.8,0],
   ['sk_paktong_ingot_rack',-6.4,y1,-1.2,PI/2],
   ['sk_paktong_tally_scale',-4.2,y1,0.8,PI],
   ['sk_laterite_hearth_brazier',-3.8,y1,-3.8,0],
   ['sk_catechu_sea_chest',-6.4,y1,1.2,PI/2]
  ]);
 }
});

/* 13. Intertidal Fish Weir, Brucite/Shell-Lime Salt Pans & Twin-Crown Smokehouse */
defBuilding({
 key:'sk_fish_saltery',
 name:'Intertidal Fish Weir, Brucite Salt Pans and Smokehouse',
 seed:8613,w:21.2,d:17.6,h:9.2,budget:62000,cut:true,
 front:{x:-3.8,z:7.2,yaw:0},
 materials:SK_BILLS.sk_fish_saltery.materials,
 bill:SK_BILLS.sk_fish_saltery.bill,
 tags:{types:['industry','farm'],wealth:'poor',style:'rian-strand',role:'saltery',job:'salt'},
 note:'intertidal pillow-basalt and wattled mangrove V-weir channel on core/water, white brucite-travertine and shell-lime solar salt pans, laterite and paperbark smokehouse with twin flame-terracotta crowns, and pumice-float drying racks',
 build(){
  skAttachBill('sk_fish_saltery');
  const y1=.46;
  /* Raised west & north saltery terrace [-9.6..2.4, -6.8..5.8] + east intertidal weir channel */
  skFloorSlab(-3.6,y1,-.5,12.2,12.6,{th:.46,mk:'paving'});
  skStair(-3.8,0,6.9,-3.8,y1,5.9,2.6,{mk:'laterite',sideMk:'pillowbasalt'});

  /* North-West laterite & paperbark smokehouse [-9.0..-2.2, -6.2..-.4] with twin terracotta smoke crowns */
  skWallRing(-9.0,-6.2,-2.2,-.4,y1,3.05,{
   mk:'laterite',socMk:'pillowbasalt',postMk:'mangrove',
   holes:{
    s:[{at:-5.6,w:1.42,h:2.1,door:true,leafMk:'salvage',maskMat:'terracotta',name:'smokehouse-door'}],
    e:[{at:-3.3,w:1.0,h:1.05,y:.98,screen:true}]
   }
  });
  skGableRoof(-5.6,y1+3.05,-3.3,7.2,6.2,1.5,{mk:'paperbark',wallMk:'laterite',over:.46});
  skKaenCrown(-7.1,y1+4.45,-3.3,.34,.74,4,{smokeKind:'chimney'});
  skKaenCrown(-4.1,y1+4.45,-3.3,.34,.74,4,{smokeKind:'chimney'});

  svNoWalk(()=>{
   /* Two shallow white brucite & shell-lime solar evaporation salt pans at (-6.8, 2.8) and (-1.2, 2.8) */
   for(const px of [-6.8,-1.2]){
    for(const sz of [1.4,4.2])box('brucite',px,y1+.01,sz,4.4,.32,.24,P('brucite'));
    for(const sx of [px-2.08,px+2.08])box('brucite',sx,y1+.01,2.8,.24,.32,2.56,P('brucite'));
    box('salt',px,y1+.01,2.8,3.92,.12,2.56,P('salt'));
   }
   /* East intertidal pillow-basalt & wattled mangrove V-trap fish weir channel [3.6..9.4, -6.8..6.8] */
   for(const sx of [3.4,9.4])box('pillowbasalt',sx,0,0,.68,.58,13.4,P('pillowbasalt'));
   beam('pillowbasalt',[4.0,.28,-1.8],[6.1,.28,1.2],.42,P('pillowbasalt'));
   beam('pillowbasalt',[8.8,.28,-1.8],[6.7,.28,1.2],.42,P('pillowbasalt'));
   for(let i=0;i<7;i++){
    const t=i/6;
    cyl('mangrove',lerp(4.1,6.0,t),0,lerp(-1.7,1.1,t),.055,1.05,P('mangrove'),6);
    cyl('mangrove',lerp(8.7,6.8,t),0,lerp(-1.7,1.1,t),.055,1.05,P('mangrove'),6);
   }
  });
  skWallBlock(-6.8,y1,2.8,4.4,.85,3.0,0);
  skWallBlock(-1.2,y1,2.8,4.4,.85,3.0,0);
  skBoardwalk(2.4,-3.6,6.4,-3.6,0,y1,1.6,{rails:true});
  skWaterStill('solar-salt-pan-west',-6.8,2.8,1.9,1.22,y1+.24,{shallow:0x78b4b8,deep:0x42848c});
  skWaterStill('solar-salt-pan-east',-1.2,2.8,1.9,1.22,y1+.24,{shallow:0x78b4b8,deep:0x42848c});
  skWaterFlow('fish-weir-tide-race',[[6.4,.14,-6.4],[6.4,.14,0],[6.4,.14,6.4]],4.6,.68);

  skWindRack(.6,y1,-4.8,0,2.8,2.35,{mk:'netting',panels:3});

  skTarget(-5.6,y1,-3.3,'smokehouse-floor',true);
  skTarget(-4.0,y1,0.4,'saltery-terrace',false);
  skTarget(5.6,y1,-3.6,'weir-catwalk',false);
  skFurnList([
   ['sk_laterite_hearth_brazier',-7.0,y1,-3.4,0],
   ['sk_brucite_salt_jar_rack',-3.6,y1,-4.8,0],
   ['generic_cured_meat',-5.6,y1,-5.0,0],
   ['sk_pumice_net_tub',-8.0,y1,-1.4,0],
   ['sk_shell_oil_lamp',-3.6,y1,-1.4,0],
   ['job_salt_heap',-4.0,y1,4.9,0,{setting:'outdoor'}],
   ['job_fish_tray',0.8,y1,-.8,0,{setting:'outdoor'}]
  ]);
 }
});

/* 14. Battered Serpentinite & Laterite Draw-Arch Shell & Limeshelf Lime Kiln */
defBuilding({
 key:'sk_lime_kiln',
 name:'Draw-Arch Shell and Limeshelf Travertine Kiln',
 seed:8614,w:17.6,d:15.4,h:8.8,budget:52000,cut:true,
 front:{x:0,z:6.4,yaw:0},
 materials:SK_BILLS.sk_lime_kiln.materials,
 bill:SK_BILLS.sk_lime_kiln.bill,
 tags:{types:['industry'],wealth:'poor',style:'eternian-kiln',role:'lime-kiln',job:'quarrying'},
 note:'battered serpentinite and laterite draw-arch kiln whitewashed with its own shell and limeshelf lime, mangrove charging ramp, oyster-shell and brucite heaps, and slaking shed',
 build(){
  skAttachBill('sk_lime_kiln');
  const y1=.38;
  skFloorSlab(0,y1,0,16.0,12.8,{th:.38,mk:'paving'});
  skStair(0,0,7.2,0,y1,6.4,2.5,{mk:'laterite',sideMk:'serpentinite'});

  /* West slaking & lime-cask shed [-7.4..-1.4, -5.0..2.0] */
  skWallRing(-7.4,-5.0,-1.4,2.0,y1,2.95,{
   mk:'limewash',socMk:'serpentinite',postMk:'brucite',
   holes:{
    s:[{at:-4.4,w:1.38,h:2.1,door:true,frameMk:'brucite',leafMk:'araucaria',maskMat:'terracotta',name:'slaking-shed-door'}],
    e:[{at:-1.5,w:1.1,h:1.1,y:.96,screen:true}]
   }
  });
  skGableRoof(-4.4,y1+2.95,-1.5,6.4,7.4,1.5,{mk:'thatch',wallMk:'limewash',alongZ:true,over:.48});

  /* East battered round self-limewashed serpentinite kiln at (3.8, -1.2) with glowing laterite draw-arch */
  svNoWalk(()=>{
   cyl('serpentinite',3.8,y1+.01,-1.2,3.15,.95,P('serpentinite'),18);
   lathe('limewash',3.8,-1.2,[[3.05,y1+.96],[2.75,y1+2.85],[2.25,y1+4.85]],18,P('limewash'));
   ring('laterite',3.8,y1+4.88,-1.2,2.15,.22,P('laterite'),0,0,0,18);
   cyl('brucite',3.8,y1+4.65,-1.2,1.85,.18,P('brucite'),16);
   cyl('glow',3.8,y1+4.85,-1.2,1.15,.05,P('ember'),14);
   smokeAt(3.8,y1+5.25,-1.2,{r:.55,kind:'fire'});
   /* Glowing +z draw-arch & laterite jambs */
   for(const sx of [3.05,4.55])box('laterite',sx,y1+.01,1.85,.38,1.75,.48,P('laterite'));
   box('laterite',3.8,y1+1.76,1.85,1.95,.36,.52,P('laterite'));
   box('glow',3.8,y1+.18,1.76,1.02,1.35,.14,P('ember'));
   haloAt(3.8,y1+.85,2.05,0xff9238,true);
   /* Oyster-shell & brucite rubble heaps */
   ellip('shellchime',6.4,y1+.22,3.4,.95,.46,.82,P('shellchime'),.3,10);
   ellip('brucite',1.4,y1+.22,3.8,.88,.42,.78,P('brucite'),-.4,10);
  });
  skWallBlock(3.8,y1,-1.2,6.1,2.5,6.1,0);

  skTarget(-4.4,y1,-1.5,'lime-slaking-shed',true);
  skTarget(3.8,y1,3.8,'kiln-draw-apron',false);
  skFurnList([
   ['sk_brucite_salt_jar_rack',-4.4,y1,-3.8,0],
   ['generic_barrel',-6.0,y1,-1.8,0],
   ['generic_barrel',-6.0,y1,-.4,0],
   ['generic_sack',-2.8,y1,-2.4,0],
   ['sk_shell_oil_lamp',-2.8,y1,.6,0],
   ['job_winnowing_tub',-.2,y1,3.6,0,{setting:'outdoor'}]
  ]);
 }
});

/* 15. Tarred Mangrove-Crib Skiff & Fleet-Born Tender Careening Grid and Repair Shed */
defBuilding({
 key:'sk_boat_grid_shed',
 name:'Tarred Mangrove-Crib Skiff and Tender Repair Shed',
 seed:8615,w:16.8,d:20.4,h:10.2,budget:64000,cut:true,
 front:{x:3.8,z:8.2,yaw:0},
 materials:SK_BILLS.sk_boat_grid_shed.materials,
 bill:SK_BILLS.sk_boat_grid_shed.bill,
 tags:{types:['industry','infrastructure'],wealth:'middle',style:'harbour-crib',role:'boathouse',job:'shipwrighting'},
 note:'tarred mangrove-pile crib skiff and Fleet-born tender repair boathouse with open slipway portal, greased mangrove tidal skids, clinker hull in frame with steamed mangrove knees, catechu sail rack and clay door mask',
 build(){
  skAttachBill('sk_boat_grid_shed');
  const y1=.58,gh=3.85,yRoof=y1+gh;
  skWoodCrib(0,-1.0,13.6,14.8,y1,{deckMk:'mangrove',steps:false});
  skStair(3.8,0,8.2,3.8,y1,6.5,1.95,{mk:'mangrove',sideMk:'tarmangrove',openUnder:true});

  /* Heavy salvage-plank & tarred-mangrove shed [-6.4..6.4, -8.0..6.0] with wide slipway portal + shipwright door */
  skWallRing(-6.4,-8.0,6.4,6.0,y1,gh,{
   mk:'salvage',socMk:'tarmangrove',socle:.34,postMk:'tarmangrove',
   holes:{
    s:[{at:-1.6,w:5.0,h:3.35,gap:true},
       {at:3.8,w:1.38,h:2.18,door:true,frameMk:'araucaria',leafMk:'araucaria',maskMat:'terracotta',name:'boatshed-door'}],
    n:[{at:-2.8,w:1.25,h:1.25,y:1.05,shutMk:'verdigris'},{at:2.8,w:1.25,h:1.25,y:1.05,shutMk:'verdigris'}],
    e:[{at:-3.2,w:1.25,h:1.25,y:1.05,shutMk:'verdigris'},{at:2.2,w:1.25,h:1.25,y:1.05,shutMk:'verdigris'}],
    w:[{at:-3.2,w:1.25,h:1.25,y:1.05,shutMk:'verdigris'},{at:2.2,w:1.25,h:1.25,y:1.05,shutMk:'verdigris'}]
   }
  });
  /* Stepped Deco timber portal crest & closed-eyed clay mask over slipway opening */
  svNoWalk(()=>{
   box('ohia',-1.6,y1+3.38,6.22,5.3,.18,.22,P('ohia'));
   skMask(-1.6,y1+3.88,6.32,.46,'terracotta');
   /* Greased mangrove launch skids + clinker tender hull on keel blocks with steamed mangrove ribs */
   for(const sx of [-2.7,-.5])beam('tarmangrove',[sx,y1+.08,-6.2],[sx,.08,8.8],.18,P('tarmangrove'));
   for(let k=0;k<7;k++)box('mangrove',-1.6,y1+.12,-5.4+k*1.75,2.4,.12,.2,P('mangrove'));
   box('araucaria',-1.6,y1+.34,-1.0,.24,.34,8.6,P('araucaria'));
   for(let i=0;i<8;i++){
    const zz=-4.6+i*1.05,hw=1.48*Math.sin(PI*(i+.6)/8.6)+.32;
    tube('mangrove',t=>{const a=(t-.5)*PI*1.05;return [-1.6+Math.sin(a)*hw,y1+.52+(1-Math.cos(a))*1.05,zz];},()=>[.06,.075],8,6,P('mangrove'),{caps:true});
   }
  });
  skWallBlock(-1.6,y1,-1.0,2.8,1.3,8.4,0);
  skWaterFlow('boatshed-tidal-slip',[[-1.6,.08,6.6],[-1.6,.08,9.4]],3.4,.42);

  skTieredRoof(0,yRoof,-1.0,13.2,14.4,2,{
   gableAxis:'z',mk:'thatch',soffitMk:'paperbark',trimMk:'ohia',neckMk:'araucaria',over:.62,tierRise:1.15,neckH:.34
  });
  skWindRack(5.2,0,7.8,0,2.2,2.45,{mk:'catechu',panels:2,pumiceFloats:false});

  skTarget(3.6,y1,-1.2,'shipwright-bench-aisle',true);
  skTarget(3.8,y1,4.4,'boatshed-threshold',true);
  skFurnList([
   ['job_saw_bench',3.8,y1,-3.8,PI/2],
   ['job_plank_stack',4.6,y1,-6.4,0],
   ['sk_araucaria_trestle_table',4.2,y1,0.8,PI/2],
   ['sk_kauri_gum_cauldron',-4.8,y1,-6.2,0],
   ['sk_catechu_sea_chest',4.6,y1,3.2,-PI/2],
   ['sk_pumice_net_tub',-4.8,y1,3.6,0],
   ['sk_shell_oil_lamp',2.6,y1,0.8,0]
  ]);
 }
});

/* 16. Stepped Serpentinite & Brucite Tide Shrine with Spring / Neap / Double-Dark Paktong-Inlaid Tide Post */
defBuilding({
 key:'sk_tide_shrine',
 name:'Stepped Serpentinite and Paktong Tide-Post Shrine',
 seed:8616,w:16.4,d:17.2,h:11.6,budget:62000,cut:true,
 front:{x:0,z:7.2,yaw:0},
 materials:SK_BILLS.sk_tide_shrine.materials,
 bill:SK_BILLS.sk_tide_shrine.bill,
 tags:{types:['religious','civic'],wealth:'middle',style:'tide-sanctuary',role:'shrine',job:'worship'},
 note:'stepped white-veined green serpentinite and brucite-travertine shrine with an arched baldachin, tidal mirror basin, carved ohia tide-gauge post inlaid with gleaming paktong rings for Neap, Mean, Spring and Double-Dark water marks, and nacreous shell chimes',
 build(){
  skAttachBill('sk_tide_shrine');
  const y1=.88,gh=3.45,yRoof=y1+gh,R=4.2;
  skArchedSocle(13.4,13.6,y1,{pierMk:'pillowbasalt',archMk:'serpentinite',topMk:'paving',stepW:2.8,stepRun:1.85});

  /* Rear hexagonal brucite & serpentinite baldachin sanctuary around (0, -1.6) */
  W(0,0,-1.6,0,()=>{
   skHexWallRing(0,0,R,y1,gh,{
    mk:'brucite',socMk:'serpentinite',dado:.24,dadoMk:'verdigris',postMk:'serpentinite',
    faces:{
     1:[{x:0,w:1.65,h:2.32,door:true,frameMk:'brucite',leafMk:'ohia',trimMk:'paktong',maskMat:'paktong',doorStyle:'double',name:'tide-shrine-door'}],
     0:[{x:0,w:1.35,h:1.4,y:.95,screen:true}],
     2:[{x:0,w:1.35,h:1.4,y:.95,screen:true}],
     3:[{x:0,w:1.2,h:1.3,y:.98,screen:true}],
     4:[{x:0,w:1.2,h:1.3,y:.98,screen:true}],
     5:[{x:0,w:1.2,h:1.3,y:.98,screen:true}]
    }
   });
   skHexRoof(0,yRoof,0,R,3.05,{mk:'thatch',finialMk:'paktong',over:.62});
  });

  /* Forecourt tidal mirror basin & 1:3 scale carved ohia + serpentinite Tide-Gauge Post at (-3.8, 3.8)
     Inlaid with gleaming white paktong bands at Neap (+1.37 m), Mean (+2.00 m), Spring (+2.38 m), and Double-Dark (+2.60 m)! */
  svNoWalk(()=>{
   for(const sz of [2.5,5.1])box('serpentinite',-3.6,y1+.01,sz,3.6,.42,.26,P('serpentinite'));
   for(const sx of [-5.27,-1.93])box('serpentinite',sx,y1+.01,3.8,.26,.42,2.34,P('serpentinite'));
   box('pillowbasalt',-3.6,y1+.01,3.8,3.08,.08,2.34,P('pillowbasalt'));

   const px=-3.6,pz=3.8,yBase=y1+.1,sc=0.3333;
   cyl('serpentinite',px,yBase,pz,.34,.42,P('serpentinite'),12);
   cyl('ohia',px,yBase+.42,pz,.16,3.45,P('ohia'),12);
   /* Four calibrated paktong tidal-range inlay rings: Neap (8.2m), Mean (12.0m), Spring (14.3m), Double-Dark (15.6m) */
   const marks=[
    [SK.TIDE_NEAP,.028],
    [SK.TIDE_MEAN,.034],
    [SK.TIDE_SPRING,.04],
    [SK.TIDE_DOUBLE_DARK,.052]
   ];
   for(let i=0;i<marks.length;i++){
    const ym=skRigMath.tideMarkY(yBase+.45,sc,marks[i][0]);
    ring('paktong',px,ym,pz,.185,marks[i][1],P('paktong'),0,0,0,16);
   }
   /* Double-Dark twin-new-moon paktong disc finial atop the tide post */
   cyl('paktong',px,yBase+3.87,pz,.22,.08,P('paktong'),12);
   ring('paktong',px,yBase+4.18,pz,.24,.045,P('paktong'),0,PI/2,0,16);
  });
  skWallBlock(-3.6,y1,3.8,3.6,1.2,2.6,0);
  skWaterStill('tide-shrine-basin',-3.6,3.8,1.48,1.12,y1+.32,{shallow:0x3e8c92,deep:0x174854});

  /* Suspended nacreous oyster & conch shell chimes + golden sea-byssus votive ribbons */
  skShellChimes(3.6,y1+2.55,3.8,0,2.2,.95,6);
  svNoWalk(()=>{
   for(const sx of [2.4,4.8]){
    box('brucite',sx,y1+.01,3.8,.28,.24,.28,P('brucite'));
    cyl('ohia',sx,y1+.25,3.8,.08,2.35,P('ohia'),8);
   }
  });
  skWindRack(5.4,0,6.2,-.25,1.8,2.8,{mk:'byssus',panels:2,pumiceFloats:false});

  skTarget(0,y1,-1.6,'tide-shrine-cell',true);
  skTarget(1.2,y1,4.2,'shrine-forecourt',false);
  skFurnList([
   ['sk_ancestor_mask_shrine',0,y1,-3.8,0],
   ['sk_laterite_hearth_brazier',0,y1,-1.6,0],
   ['sk_shell_oil_lamp',-2.0,y1,-2.2,PI/3],
   ['sk_shell_oil_lamp',2.0,y1,-2.2,-PI/3],
   ['sk_catechu_sea_chest',-2.2,y1,-.2,2*PI/3],
   ['sk_paktong_tally_scale',2.1,y1,-.2,-2*PI/3]
  ]);
 }
});
