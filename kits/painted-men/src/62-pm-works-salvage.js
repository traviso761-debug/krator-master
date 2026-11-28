// prefix: pm
// ================================================================= PLATEAU WORKS, CRAFTS, GRANARIES, GARDENS & SALVAGE (seeds 36301..36314)
// Covers every active Voth census trade on the Painted Highlands without a single potters kiln or bamboo stalk (PLAN.md §2.4 & §3):
//   36301 pm_pigment_quarry         36306 pm_niche_granary_wall     36311 pm_paintbrush_healer
//   36302 pm_pitch_basket_shed      36307 pm_amaranth_roast_oven    36312 pm_ledge_seep_garden
//   36303 pm_woomera_obsidian_shop  36308 pm_smokehouse_jerky       36313 pm_pronghorn_corral
//   36304 pm_salvage_scrap_forge    36309 pm_rattlepod_brew_hut     36314 pm_salvage_tank_round
//   36305 pm_talus_granary          36310 pm_bark_dye_court

/* 19. Danxia & Badland Mineral Pigment Quarry (36301 — links to kits/resources via role: 'mine') */
defBuilding({
 key:'pm_pigment_quarry',
 name:'Danxia Ochre and Celadonite Pigment Quarry',
 seed:36301,
 cls:'building',
 cut:true,
 w:13.8,d:11.6,h:6.6,
 front:{x:0,z:4.8,yaw:0},
 tags:{style:'alcove',wealth:'poor',types:['industry'],role:'mine',job:'quarrying'},
 note:'stepped danxia & badland quarry bench cutting iron red-ochre, celadonite-teal and lignite-black seams (linked to kits/resources via resSource)',
 build(){
  pmPlinth(12.4,9.8,.26,{baseMk:'danxia',topMk:'paving',stepW:2.8});
  /* Stepped mineral bench along rear (-z) exposing red ochre, celadonite-teal, pipeclay & lignite beds */
  svNoWalk(()=>{
   box('danxia',0,.26,-3.8,11.6,1.35,1.8,P('danxia'));
   box('ochreRed',-2.8,1.61,-4.05,5.2,.85,1.25,P('ochreRed'));
   box('celadoniteTeal',2.8,1.61,-4.05,5.2,.85,1.25,P('celadoniteTeal'));
   box('pipeclay',0,2.46,-4.25,9.6,.72,.92,P('pipeclay'));
   box('lignite',0,3.18,-4.38,8.2,.58,.68,P('lignite'));
  });
  /* Pigment-cutter sorting shed on west side (viga span 3.8 m <= 4.2 m) */
  const S=pmAlcoveRoom(-3.6,.95,.26,4.0,3.8,2.65,{
   mk:'bentonite',col:'bentonite',socleMk:'danxia',
   s:[{x:0,w:1.12,h:2.0,kind:'door',leafMk:'curedBark',name:'quarry-shed-door'}],
   parapet:false
  });
  pmSilkCanopy(2.4,3.1,1.1,4.2,3.4,.18,{mk:'hide',col:'hide'});
  svNoWalk(()=>{
   for(const sx of [.5,4.3])for(const sz of [-.4,2.6]){
    pole('juniper',[sx,.26,sz],[sx,3.15,sz],.085,P('juniper'),7);
   }
  });
  pmHandStencilCluster(-3.6,1.4,2.86,0,1.4,.8,{count:3});

  pmTarget(-3.6,S.yFloor,.95,'pigment-sorting-shed');
  pmTarget(2.4,.26,1.1,'pigment-crushing-yard');

  pmFurnList([
   ['painted_ochre_grinding_slab',1.4,.26,.8,0],
   ['painted_ochre_grinding_slab',3.3,.26,.8,PI],
   ['painted_burl_coolamon_set',2.4,.26,2.1,0],
   ['generic_sack',-4.3,S.yFloor,.25,PI/2],
   ['generic_crate',-2.8,S.yFloor,.15,-PI/2],
   ['painted_pitch_tus_rack',-3.6,S.yFloor,-.35,0]
  ]);
 }
});

/* 20. Pinyon-Pitch Coiled Basketry & Burl Coolamon Shed (36302 — replaces all pottery kilns!) */
defBuilding({
 key:'pm_pitch_basket_shed',
 name:'Pinyon-Pitch Tus Basketry and Coolamon Shed',
 seed:36302,
 cls:'building',
 cut:true,
 w:11.2,d:9.4,h:5.6,
 front:{x:-1.8,z:3.8,yaw:0},
 tags:{style:'alcove',wealth:'middle',types:['industry','shop'],role:'basketry',job:'weaving'},
 note:'workshop boiling paintedpinyon resin over river cobbles to waterproof coiled willow tus water-jugs and carving burl coolamons (zero kiln pottery)',
 build(){
  pmPlinth(9.8,7.8,.26,{stepX:-1.8,stepW:2.4});
  const W1=pmAlcoveRoom(-2.1,-.35,.26,4.2,4.0,2.75,{
   mk:'plasterOchre',col:'plasterOchre',socleMk:'danxiaBuff',
   s:[{x:.3,w:1.14,h:2.02,kind:'door',leafMk:'curedBark',name:'basket-shed-door'}],
   e:[{x:0,w:1.05,h:1.95,kind:'door',open:true,transom:false}],
   parapet:false
  });
  /* Open-sided juniper-pole resin-heating & willow-soaking porch on east side */
  pmRecordViga(3.6,5);
  svNoWalk(()=>{
   for(const sx of [.6,3.9])for(const sz of [-2.1,1.6]){
    pole('juniper',[sx,.26,sz],[sx,2.85,sz],.09,P('juniper'),8);
   }
   box('latilla',2.25,2.86,-.25,3.8,.05,4.1,P('latilla'));
  });
  pmHerbSwag(.6,2.72,1.6,3.9,2.72,1.6,5);
  pmRarrkPanel(-2.1,1.4,1.66,0,1.5,.85,{bg:'ochreRed'});
  smokeAt(2.3,.95,-.2,{r:.22});

  pmTarget(-2.1,W1.yFloor,-.35,'basketry-weaving-room');
  pmTarget(2.25,.26,-.25,'resin-pitching-porch');

  pmFurnList([
   ['painted_pitch_tus_rack',-3.1,W1.yFloor,-1.25,0],
   ['painted_pitch_tus_rack',-1.2,W1.yFloor,-1.25,0],
   ['painted_burl_coolamon_set',-2.8,W1.yFloor,.45,PI/2],
   ['painted_hotstone_boiling_basket',2.15,.26,-.85,0],
   ['painted_raided_iron_kettle',2.35,.26,.55,0],
   ['generic_basket',3.35,.26,-.95,-PI/2],
   ['job_winnowing_mat',1.25,.26,1.05,0]
  ]);
 }
});

/* 21. Korona Obsidian-Pancake Knapping & Woomera Shop (36303) */
defBuilding({
 key:'pm_woomera_obsidian_shop',
 name:'Korona Obsidian and Woomera Knapping Shop',
 seed:36303,
 cls:'building',
 cut:true,
 w:10.6,d:9.2,h:5.6,
 front:{x:0,z:3.8,yaw:0},
 tags:{style:'alcove',wealth:'middle',types:['shop','industry'],role:'knapper',job:'knapping'},
 note:'craft shop flaking traded Korona Silkhead Gorge obsidian-pancake cores into dart blades and carving mountain-mahogany woomeras and bullroarers',
 build(){
  pmPlinth(9.4,7.6,.26,{stepW:2.3});
  const R=pmAlcoveRoom(-1.8,-.35,.26,4.2,4.0,2.78,{
   mk:'bentonite',col:'bentonite',socleMk:'danxia',
   s:[{x:.2,w:1.14,h:2.02,kind:'door',leafMk:'mahogany',name:'knapper-door'}],
   w:[{x:0,y:1.2,w:.55,h:.62,kind:'win'}],
   parapet:false
  });
  /* Knapping boulder bench & obsidian core pile on east flaking terrace */
  svNoWalk(()=>{
   box('danxiaCut',2.45,.26,-.65,2.4,.44,1.2,P('danxiaCut'));
   box('obsidian',2.15,.71,-.65,.52,.28,.46,P('obsidian'));
   box('obsidian',2.85,.71,-.55,.38,.22,.36,P('obsidian'));
  });
  pmSilkCanopy(2.35,2.95,-.15,3.4,3.4,.18,{mk:'wildSilk',col:'wildSilkTeal'});
  svNoWalk(()=>{
   for(const sx of [.8,3.9])for(const sz of [-1.7,1.4]){
    pole('juniper',[sx,.26,sz],[sx,2.98,sz],.08,P('juniper'),7);
   }
  });
  pmXrayBeastPanel(-1.8,1.45,1.66,0,1.5,.9,{beast:'raptor'});

  pmTarget(-1.8,R.yFloor,-.35,'woomera-shop-room');
  pmTarget(2.35,.26,.45,'obsidian-flaking-terrace');

  pmFurnList([
   ['painted_woomera_dart_rack',-2.8,R.yFloor,-1.25,0],
   ['painted_woomera_dart_rack',-.8,R.yFloor,-1.25,0],
   ['painted_bark_shield_stand',-2.95,R.yFloor,.45,PI/2],
   ['painted_burl_coolamon_set',2.35,.26,.85,0],
   ['job_pole_rack',3.35,.26,-.25,-PI/2]
  ]);
 }
});

/* 22. Reclaimed Ancient Salvage Scrap-Forge (36304) */
defBuilding({
 key:'pm_salvage_scrap_forge',
 name:'Rarrk-Painted Ancient Salvage Scrap Forge',
 seed:36304,
 cls:'building',
 cut:true,
 w:11.4,d:9.6,h:5.8,
 front:{x:-1.6,z:3.9,yaw:0},
 tags:{style:'salvage',state:'reclaimed',wealth:'middle',types:['industry','shop'],role:'smithy',job:'smithing'},
 note:'reclaimed Ancient corrugated bulkhead shelter painted in 5-colour Arnhem rarrk where smiths charcoal-forge salvaged steel into raid blades and adzes',
 build(){
  pmPlinth(10.2,8.0,.28,{baseMk:'danxia',topMk:'paving',stepX:-1.6,stepW:2.4});
  const F1=pmAlcoveRoom(-1.9,-.3,.28,4.2,4.1,2.8,{
   mk:'salvageRust',col:'salvageRust',socleMk:'danxia',socleH:.62,
   s:[{x:.2,w:1.18,h:2.05,kind:'door',leafMk:'iron',name:'salvage-forge-door'}],
   parapet:false,roofMk:'salvagePlate',roofCol:'salvagePlate'
  });
  /* Open charcoal hearth & Danxia stone chimney hood on east yard */
  svNoWalk(()=>{
   box('danxia',2.55,.28,-1.35,2.2,1.15,1.8,P('danxia'));
   box('salvagePlate',2.55,1.43,-1.35,1.5,1.95,1.2,P('salvagePlate'));
   cyl('iron',2.55,3.39,-1.35,.34,.95,P('iron'),12);
   box('glow',2.55,1.05,-.4,.72,.14,.32,P('ember'));
  });
  haloAt(2.55,1.25,-.25,0xff7a28,true);
  smokeAt(2.55,4.4,-1.35,{r:.3});
  pmRarrkPanel(-1.9,1.4,1.76,0,1.75,.95,{bg:'ochreRed'});
  pmHandStencilCluster(2.55,2.05,-.74,0,1.1,.72,{count:2});

  pmTarget(-1.9,F1.yFloor,-.3,'salvage-smithy-room');
  pmTarget(2.3,.28,.85,'forge-hearth-yard');

  pmFurnList([
   ['pa_vice_bench',-2.7,F1.yFloor,-1.25,0],
   ['painted_woomera_dart_rack',-.9,F1.yFloor,-1.25,0],
   ['pa_drum',-3.0,F1.yFloor,.55,0],
   ['painted_raided_iron_kettle',1.35,.28,.75,0],
   ['pa_water_trough',3.35,.28,.85,-PI/2],
   ['painted_pitch_tus_rack',-1.9,F1.yFloor,1.1,PI]
  ]);
 }
});

/* 23. Dogon-Style Conical Bunchgrass Talus Granary Cluster (36305) */
defBuilding({
 key:'pm_talus_granary',
 name:'Dogon Boulder-Stilt Bunchgrass Talus Granary',
 seed:36305,
 cls:'building',
 cut:true,
 w:11.6,d:9.8,h:6.2,
 front:{x:0,z:4.0,yaw:0},
 tags:{style:'maloca',wealth:'middle',types:['farm','infrastructure'],role:'granary',job:'milling'},
 note:'trio of rodent-proof boulder-stilted bentonite clay silos capped with conical Stripe bunchgrass hats beside a keeper grinding cell',
 build(){
  pmPlinth(10.4,8.2,.26,{stepW:2.4});
  /* Keeper tally & metate milling cell on west side */
  const K=pmAlcoveRoom(-2.65,-.25,.26,3.9,3.9,2.68,{
   mk:'bentonite',col:'bentonite',socleMk:'danxia',
   s:[{x:.2,w:1.08,h:1.98,kind:'door',leafMk:'curedBark',name:'granary-keeper-door'}],
   parapet:false
  });
  /* Three Dogon conical bunchgrass-hatted silos on east boulder-pad court */
  pmGranaryTower(1.45,-1.45,.26,2.15,2.35,1.75,{mk:'plasterOchre'});
  pmGranaryTower(3.85,-1.15,.26,2.05,2.15,1.65,{mk:'ochreRed'});
  pmGranaryTower(2.65,1.45,.26,2.1,2.25,1.7,{mk:'bentonite'});

  pmTrackRingMap(-2.65,1.45,1.71,0,.62,{flat:false});

  pmTarget(-2.65,K.yFloor,-.25,'granary-milling-cell');
  pmTarget(.15,.26,1.6,'granary-silo-court');

  pmFurnList([
   ['painted_amaranth_mano_metate',-3.3,K.yFloor,-.95,0],
   ['painted_amaranth_mano_metate',-1.9,K.yFloor,-.95,0],
   ['painted_burl_coolamon_set',-2.65,K.yFloor,.55,0],
   ['generic_sack',-3.45,K.yFloor,.65,PI/2],
   ['job_winnowing_mat',-.2,.26,1.8,0]
  ]);
 }
});

/* 24. Cliff-Niche Shuttered Masonry Granary Wall (36306) */
defBuilding({
 key:'pm_niche_granary_wall',
 name:'Cliff-Niche Shuttered Sandstone Granary Wall',
 seed:36306,
 cls:'building',
 cut:true,
 w:11.8,d:8.6,h:7.6,
 front:{x:0,z:3.5,yaw:0},
 tags:{style:'alcove',wealth:'middle',types:['infrastructure','farm'],role:'warehouse',job:'warehousing'},
 note:'sheer danxia cliff pocket mortared with two tiers of shuttered bentonite seed-lockers reached by single-trunk notched Dogon ladders',
 build(){
  pmPlinth(10.6,6.8,.28,{stepW:2.6});
  /* overhanging danxia cliff brow sheltering upper & lower storage cells */
  svNoWalk(()=>{
   box('danxia',0,.28,-2.75,10.2,6.4,1.2,P('danxia'));
   box('danxiaBuff',0,6.68,-1.85,9.8,.68,3.0,P('danxiaBuff'));
  });
  const G1=pmAlcoveRoom(-2.25,-.25,.28,3.9,3.4,2.6,{
   mk:'bentonite',col:'bentonite',socleMk:'danxiaCut',
   s:[{x:0,w:1.04,h:1.94,kind:'door',leafMk:'curedBark',name:'niche-west-door'}],
   parapetGaps:{s:[-1.0]}
  });
  const G2=pmAlcoveRoom(2.25,-.38,.28,3.9,3.4,2.6,{
   mk:'plasterOchre',col:'plasterOchre',socleMk:'danxiaCut',
   s:[{x:0,w:1.04,h:1.94,kind:'door',leafMk:'curedBark',name:'niche-east-door'}],
   parapet:false
  });
  /* Upper cliff-pocket locker gallery with Dogon shutter hatches */
  const U1=pmAlcoveRoom(-2.25,-.45,G1.yRoof,3.6,2.9,2.35,{
   mk:'ochreRed',col:'ochreRed',socleMk:'danxiaCut',
   s:[{x:0,w:.98,h:1.86,kind:'door',leafMk:'mahogany',name:'niche-upper-door'}],
   parapet:false
  });
  pmDogonLadder(-3.25,.28,2.25,-3.25,G1.yRoof,1.52);
  pmHandStencilCluster(2.25,G2.yRoof+.85,-2.14,0,2.2,.95,{count:4});

  pmTarget(-2.25,G1.yFloor,-.25,'west-grain-vault');
  pmTarget(2.25,G2.yFloor,-.38,'east-grain-vault');
  pmTarget(-2.25,U1.yFloor,-.45,'upper-niche-locker');

  pmFurnList([
   ['painted_pitch_tus_rack',-2.25,G1.yFloor,-1.1,0],
   ['generic_sack',-3.1,G1.yFloor,-.2,PI/2],
   ['generic_basket',2.25,G2.yFloor,-1.2,0],
   ['painted_burl_coolamon_set',1.4,G2.yFloor,-.2,PI/2],
   ['painted_dogon_notched_ladder',3.1,G2.yFloor,-.2,-PI/2],
   ['generic_crate',-2.25,U1.yFloor,-1.1,0]
  ]);
 }
});

/* 25. Basin-Amaranth Slab Roast Oven & Metate Court (36307) */
defBuilding({
 key:'pm_amaranth_roast_oven',
 name:'Basin-Amaranth Danxia Slab Roast Oven',
 seed:36307,
 cls:'building',
 cut:true,
 w:10.6,d:9.2,h:5.4,
 front:{x:-1.7,z:3.8,yaw:0},
 tags:{style:'alcove',wealth:'poor',types:['shop','industry'],role:'bakery',job:'baking'},
 note:'communal parching house & domed bentonite earth-ovens baking basin-amaranth seed cakes, pinyon meal and murnong tubers on heated danxia slabs',
 build(){
  pmPlinth(9.4,7.6,.26,{stepX:-1.7,stepW:2.3});
  const B=pmAlcoveRoom(-1.95,-.3,.26,4.1,4.0,2.7,{
   mk:'bentonite',col:'bentonitePink',socleMk:'danxia',
   s:[{x:.2,w:1.12,h:2.0,kind:'door',leafMk:'curedBark',name:'bake-door'}],
   parapet:false
  });
  /* Twin domed sun-baked bentonite & cobble earth-ovens (hornos, unfired clay!) on east terrace */
  svNoWalk(()=>{
   for(const [ox,oz] of [[2.25,-1.15],[2.55,1.15]]){
    cyl('danxia',ox,.26,oz,1.05,.38,P('danxia'),14);
    lathe('plasterOchre',ox,oz,[[.98,.64],[.92,1.1],[.62,1.52],[.18,1.74]],14,P('plasterOchre'));
    box('glow',ox,.68,oz+.72,.38,.28,.16,P('ember'));
    haloAt(ox,.85,oz+.95,0xff8632,true);
    smokeAt(ox,1.82,oz,{r:.2});
   }
  });
  pmRarrkPanel(-1.95,1.35,1.71,0,1.45,.82,{bg:'ochreRed'});

  pmTarget(-1.95,B.yFloor,-.3,'amaranth-kneading-room');
  pmTarget(1.1,.26,.1,'earth-oven-court');

  pmFurnList([
   ['painted_amaranth_mano_metate',-2.8,B.yFloor,-1.1,0],
   ['painted_amaranth_mano_metate',-1.1,B.yFloor,-1.1,0],
   ['painted_hotstone_boiling_basket',-2.8,B.yFloor,.45,PI/2],
   ['painted_burl_coolamon_set',.95,.26,.15,0],
   ['generic_veg_basket',1.15,.26,1.55,0]
  ]);
 }
});

/* 26. Pronghorn Jerky Smokehouse & Pemmican Shed (36308) */
defBuilding({
 key:'pm_smokehouse_jerky',
 name:'Juniper-Smoke Pronghorn Jerky Smokehouse',
 seed:36308,
 cls:'building',
 cut:true,
 w:10.8,d:9.2,h:5.8,
 front:{x:1.8,z:3.8,yaw:0},
 tags:{style:'alcove',wealth:'poor',types:['industry','shop'],role:'butcher',job:'butchery'},
 note:'juniper-bough smokehouse & open curing racks drying plateau pronghorn strips, pounding marrow pemmican and stretching rawhide',
 build(){
  pmPlinth(9.6,7.6,.26,{stepX:1.8,stepW:2.3});
  const SM=pmAlcoveRoom(1.95,-.3,.26,4.1,4.0,2.85,{
   mk:'danxia',col:'danxia',socleMk:'danxiaCut',socleH:.9,
   s:[{x:-.2,w:1.1,h:2.0,kind:'door',leafMk:'juniper',name:'smokehouse-door'}],
   parapet:false,roofMk:'plasterOchre',roofCol:'plasterOchre'
  });
  /* Juniper-pole jerky drying & hide-stretching frame on west court */
  svNoWalk(()=>{
   for(const sx of [-3.8,-1.1])for(const sz of [-1.6,1.5]){
    pole('juniper',[sx,.26,sz],[sx,2.55,sz],.08,P('juniper'),7);
   }
   beam('juniper',[-3.9,2.45,-1.6],[-1.0,2.45,-1.6],.09,P('juniper'));
   beam('juniper',[-3.9,2.45,1.5],[-1.0,2.45,1.5],.09,P('juniper'));
  });
  pmHideCurtain(-2.45,2.42,-1.58,0,2.1,1.55);
  pmHerbSwag(-3.8,2.42,1.5,-1.1,2.42,1.5,5);
  pmXrayBeastPanel(1.95,1.45,1.71,0,1.55,.92,{beast:'pronghorn'});
  smokeAt(1.95,3.45,-.3,{r:.28});

  pmTarget(1.95,SM.yFloor,-.3,'smokehouse-curing-cell');
  pmTarget(-2.45,.26,0,'jerky-drying-yard');

  pmFurnList([
   ['painted_sage_smudge_pit',1.95,SM.yFloor,-.45,0],
   ['generic_cured_meat',2.85,SM.yFloor,-1.15,-PI/2],
   ['generic_roast',1.05,SM.yFloor,-1.15,PI/2],
   ['painted_burl_coolamon_set',-2.45,.26,-.2,0],
   ['painted_raided_iron_kettle',-2.45,.26,1.15,0]
  ]);
 }
});

/* 27. Amaranth-Honey & Juniper Brew Maloca Hut (36309) */
defBuilding({
 key:'pm_rattlepod_brew_hut',
 name:'Amaranth-Honey and Juniper Brew Maloca',
 seed:36309,
 cls:'building',
 cut:true,
 w:10.8,d:11.4,h:6.0,
 front:{x:0,z:4.8,yaw:0},
 tags:{style:'maloca',wealth:'middle',types:['tavern','industry'],role:'brewery',job:'brewing'},
 note:'communal Stripe-bunchgrass brew house fermenting roasted amaranth, wild berries and juniper mash in pinyon-pitch-lined willow vats',
 build(){
  pmPlinth(9.4,9.8,.24,{baseMk:'danxiaBuff',topMk:'paving',stepW:2.4});
  const M=pmMalocaHall(0,-.25,.24,7.8,8.2,1.15,5.15,{doorW:1.45,doorH:2.08,doorName:'brew-maloca-door'});
  pmRarrkPanel(-1.7,1.4,3.82,.24,1.3,.9,{barkBoard:true,bg:'celadoniteTeal'});
  pmRarrkPanel(1.7,1.4,3.82,-.24,1.3,.9,{barkBoard:true,bg:'ochreRed'});
  pmPukamaniPole(3.4,.24,3.4,3.7,{feathers:10});
  smokeAt(0,5.45,-.25,{r:.24});

  const fy=.24+M.yFloor;
  pmTarget(0,fy,-.25,'brew-maloca-hall');

  pmFurnList([
   ['painted_raided_iron_kettle',0,fy,-.15,0],
   ['painted_hotstone_boiling_basket',-1.95,fy,-1.2,PI/2],
   ['painted_hotstone_boiling_basket',1.95,fy,-1.2,-PI/2],
   ['painted_pitch_tus_rack',-2.1,fy,.95,PI/2],
   ['painted_pitch_tus_rack',2.1,fy,.95,-PI/2],
   ['generic_poor_log_seat',-1.15,fy,1.1,.4],
   ['generic_poor_log_seat',1.15,fy,1.1,-.4]
  ]);
 }
});

/* 28. Bark-Cloth & Five-Pigment Dye Court (36310) */
defBuilding({
 key:'pm_bark_dye_court',
 name:'Canyon-Oak Bark and Five-Pigment Dye Court',
 seed:36310,
 cls:'building',
 cut:true,
 w:11.6,d:9.8,h:5.6,
 front:{x:-1.9,z:4.0,yaw:0},
 tags:{style:'alcove',wealth:'middle',types:['industry','shop'],role:'dyer',job:'dyeing'},
 note:'beaten canyon-oak bark-screen studio & 5-basin danxia pigment court steeping red ochre, rabbitbrush gold, pipeclay, lignite and celadonite-teal',
 build(){
  pmPlinth(10.4,8.2,.26,{stepX:-1.9,stepW:2.4});
  const D=pmAlcoveRoom(-2.2,-.35,.26,4.2,4.1,2.75,{
   mk:'bentonite',col:'bentonite',socleMk:'danxia',
   s:[{x:.2,w:1.14,h:2.02,kind:'door',leafMk:'curedBark',name:'dye-studio-door'}],
   parapet:false
  });
  /* Five dressed danxia pigment-steeping basins filled with the 5 canonical Payntja-Mana colours! */
  const pigMks=['ochreRed','plasterOchre','pipeclay','lignite','celadoniteTeal'];
  svNoWalk(()=>{
   for(let i=0;i<5;i++){
    const bx=1.15+(i%2)*2.1,bz=-2.1+Math.floor(i/2)*1.65;
    cyl('danxiaCut',bx,.26,bz,.64,.36,P('danxiaCut'),12);
    const pm=pigMks[i];
    cyl(pm,bx,.625,bz,.5,.05,P(pm==='plasterOchre'?'rabbitGold':pm),12);
   }
  });
  pmSilkCanopy(2.2,3.1,-.4,4.2,4.4,.2,{mk:'wildSilk',col:'wildSilk'});
  svNoWalk(()=>{
   for(const sx of [.25,4.15])for(const sz of [-2.45,1.65]){
    pole('juniper',[sx,.26,sz],[sx,3.14,sz],.085,P('juniper'),7);
   }
  });
  pmRarrkPanel(-2.2,1.45,1.71,0,1.75,.95,{barkBoard:true});

  pmTarget(-2.2,D.yFloor,-.35,'bark-painting-studio');
  pmTarget(2.2,.26,2.1,'pigment-vat-court');

  pmFurnList([
   ['painted_rarrk_bark_screen',-2.2,D.yFloor,-1.45,0],
   ['painted_ochre_grinding_slab',-3.1,D.yFloor,.25,PI/2],
   ['painted_burl_coolamon_set',-1.2,D.yFloor,.35,-PI/2],
   ['painted_pitch_tus_rack',-3.1,D.yFloor,-1.1,PI/2],
   ['job_sheaf_rack',2.2,.26,2.35,0]
  ]);
 }
});

/* 29. Paintbrush & Plateau-Sage Smudge Healer Alcove (36311) */
defBuilding({
 key:'pm_paintbrush_healer',
 name:'Paintbrush and Sage Smudge Healer Alcove',
 seed:36311,
 cls:'building',
 cut:true,
 w:10.4,d:9.2,h:5.8,
 front:{x:0,z:3.8,yaw:0},
 tags:{style:'alcove',wealth:'middle',types:['civic','religious'],role:'healer',job:'healing'},
 note:'seep-herb apothecary & sweat-smudge lodge hung with drying scarlet paintbrush, phsage and juniper bundles',
 build(){
  pmPlinth(9.2,7.6,.28,{stepW:2.2});
  const H=pmAlcoveRoom(0,-.45,.28,4.2,4.2,2.82,{
   mk:'bentonite',col:'bentonite',socleMk:'danxiaCut',
   s:[{x:0,w:1.14,h:2.02,kind:'door',leafMk:'curedBark',name:'healer-door'}],
   e:[{x:0,y:1.2,w:.55,h:.65,kind:'win'}],
   w:[{x:0,y:1.2,w:.55,h:.65,kind:'win'}],
   parapet:false
  });
  pmWandjinaBrow(0,1.65,1.66,0,1.45,.95);
  pmHerbSwag(-3.4,2.55,2.2,-1.2,2.55,2.2,5);
  pmHerbSwag(1.2,2.55,2.2,3.4,2.55,2.2,5);
  svNoWalk(()=>{
   for(const sx of [-3.4,-1.2,1.2,3.4])pole('juniper',[sx,.28,2.2],[sx,2.65,2.2],.075,P('juniper'),7);
  });
  pmPukamaniPole(-3.4,.28,-.6,3.6,{feathers:10});
  smokeAt(0,3.5,-.45,{r:.22});

  pmTarget(0,H.yFloor,-.45,'healer-smudge-sanctuary');

  pmFurnList([
   ['painted_sage_smudge_pit',0,H.yFloor,-.35,0],
   ['painted_pronghorn_pelt_bed',-1.2,H.yFloor,-1.25,0],
   ['painted_pronghorn_pelt_bed',1.2,H.yFloor,-1.25,0],
   ['painted_burl_coolamon_set',-1.25,H.yFloor,.65,PI/2],
   ['painted_pitch_tus_rack',1.25,H.yFloor,.65,-PI/2]
  ]);
 }
});

/* 30. Seep-Irrigated Amaranth & Murnong Ledge Garden (36312 — WATER.still + short WATER.flow!) */
defBuilding({
 key:'pm_ledge_seep_garden',
 name:'Seep-Irrigated Amaranth and Murnong Ledge Garden',
 seed:36312,
 cls:'building',
 cut:true,
 w:14.2,d:11.8,h:5.6,
 front:{x:-3.4,z:4.9,yaw:0},
 tags:{style:'alcove',wealth:'poor',types:['farm'],role:'farm',job:'farming'},
 note:'sandstone-bentonite contact-seep cistern (WATER.still) feeding terraced contour beds of basin amaranth, murnong tubers and scarlet paintbrush via a stone rill (WATER.flow)',
 build(){
  pmPlinth(13.0,10.2,.24,{baseMk:'danxia',topMk:'paving',stepX:-3.4,stepW:2.4});
  /* Keeper tool & seed-drying cell on NW corner */
  const G=pmAlcoveRoom(-3.6,-1.65,.24,4.0,3.8,2.6,{
   mk:'plasterOchre',col:'plasterOchre',socleMk:'danxia',
   s:[{x:.2,w:1.08,h:1.98,kind:'door',leafMk:'curedBark',name:'garden-hut-door'}],
   parapet:false
  });
  /* Rear seep-contact spring basin (WATER.still) + short stone-curbed irrigation rill (WATER.flow, 5.6 m long) */
  pmSeepBasin(2.4,.24,-3.1,3.4,2.1,{name:'garden-seep'});
  pmSeepRill([[2.4,.42,-1.95],[2.4,.36,.45],[2.4,.32,3.1]],.44,.5,'garden-seep');

  /* Stepped dry-stone danxia & turf amaranth/murnong planting beds flanking the rill */
  svNoWalk(()=>{
   for(const [bx,bz] of [[.1,-.4],[.1,2.1],[4.65,-.4],[4.65,2.1]]){
    box('danxia',bx,.24,bz,2.2,.28,1.85,P('danxia'));
    box('turf',bx,.525,bz,1.96,.08,1.62,P('turf'));
    for(let r=-1;r<=1;r++){
     box('herbBundle',bx,.61,bz+r*.46,1.7,.16,.18,P('herbBundle'));
    }
   }
  });
  pmTrackRingMap(-3.6,1.35,.26,0,.58,{flat:false});

  pmTarget(-3.6,G.yFloor,-1.65,'garden-seed-shed');
  pmTarget(-3.4,.24,2.2,'garden-terrace-walk');

  pmFurnList([
   ['painted_pitch_tus_rack',-4.4,G.yFloor,-2.45,0],
   ['painted_amaranth_mano_metate',-2.8,G.yFloor,-2.45,0],
   ['painted_burl_coolamon_set',-3.6,G.yFloor,-.75,0],
   ['generic_veg_basket',-1.5,.24,2.4,0],
   ['job_winnowing_mat',-3.6,.24,2.4,0]
  ]);
 }
});

/* 31. Plateau Pronghorn & Cliff-Goat Corral (36313) */
defBuilding({
 key:'pm_pronghorn_corral',
 name:'Danxia and Juniper Plateau Pronghorn Corral',
 seed:36313,
 cls:'building',
 cut:true,
 w:13.4,d:11.2,h:5.4,
 front:{x:2.4,z:4.6,yaw:0},
 tags:{style:'alcove',wealth:'poor',types:['farm'],role:'corral',job:'herding'},
 note:'dry-laid danxia & lashed juniper-pole plateau pronghorn pen with bunchgrass fodder byre and pelt-curing rack',
 build(){
  pmPlinth(12.2,9.6,.22,{baseMk:'stone',topMk:'earth',stepX:2.4,stepW:2.4});
  /* Herder shelter & fodder loft on west side */
  const B=pmAlcoveRoom(-3.2,-.85,.22,4.1,4.2,2.65,{
   mk:'bentonite',col:'bentonite',socleMk:'danxia',
   s:[{x:.3,w:1.12,h:2.0,kind:'door',leafMk:'juniper',name:'corral-hut-door'}],
   parapet:false
  });
  /* Lashed juniper-pole & dry-stone corral enclosure on east side with operable gate on +z */
  const x0=-.5,x1=5.4,z0=-3.8,z1=3.8;
  svNoWalk(()=>{
   const posts=[[x0,z0],[2.45,z0],[x1,z0],[x1,0],[x1,z1],[3.4,z1],[1.4,z1],[x0,z1]];
   for(const [px,pz] of posts)pole('juniper',[px,.22,pz],[px,1.58,pz],.085,P('juniper'),7);
   const rails=[[x0,z0,x1,z0],[x1,z0,x1,z1],[x1,z1,3.4,z1],[1.4,z1,x0,z1],[x0,z1,x0,z0]];
   for(const [ax,az,bx,bz] of rails){
    for(const ry of [.62,1.08,1.46])pole('juniper',[ax,ry,az],[bx,ry,bz],.055,P('juniper'),6);
   }
   /* Bunchgrass shade lean-to over north side of corral */
   box('bunchgrass',2.45,2.25,-2.75,5.4,.18,2.1,P('bunchgrass'));
   for(const sx of [0,4.9])pole('canyonOak',[sx,.22,-1.85],[sx,2.25,-1.85],.09,P('canyonOak'),7);
  });
  svLeaf(2.4,.24,z1,0,1.85,1.35,{mk:'juniper',col:P('juniper'),style:'plank',name:'corral-gate'});
  door(2.4,.22,z1,0,1.95,1.45);
  pmXrayBeastPanel(-3.2,1.35,1.26,0,1.55,.88,{beast:'pronghorn'});

  pmTarget(-3.2,B.yFloor,-.85,'herder-fodder-hut');
  pmTarget(2.4,.22,.5,'pronghorn-pen-yard');

  pmFurnList([
   ['painted_pronghorn_pelt_bed',-3.9,B.yFloor,-1.55,PI/2],
   ['painted_pitch_tus_rack',-2.3,B.yFloor,-1.85,0],
   ['painted_burl_coolamon_set',-3.2,B.yFloor,.25,0],
   ['pa_water_trough',3.8,.22,.65,-PI/2],
   ['job_bales',1.2,.22,-2.65,0]
  ]);
 }
});

/* 32. Rarrk-Painted Reclaimed Ancient Salvage Tank Store (36314) */
defBuilding({
 key:'pm_salvage_tank_round',
 name:'Rarrk-Painted Ancient Salvage Tank Store',
 seed:36314,
 cls:'building',
 cut:true,
 w:9.6,d:9.8,h:6.4,
 front:{x:0,z:4.1,yaw:0},
 tags:{style:'salvage',state:'reclaimed',wealth:'middle',types:['infrastructure','shop'],role:'warehouse',job:'warehousing'},
 note:'reclaimed cylindrical Ancient pressure tank set on a danxia plinth, cut with a Mesa Verde keyhole door, capped in Stripe bunchgrass and painted in 5-colour Arnhem rarrk',
 build(){
  pmPlinth(8.2,8.2,.3,{baseMk:'danxia',topMk:'paving',stepW:2.2});
  const rIn=2.65,rOut=2.88,hWall=3.15;
  pmRecordViga(3.8,4);

  /* Cylindrical rusted Ancient steel shell split cleanly around +z Mesa Verde keyhole portal */
  svNoWalk(()=>{
   sector('salvageRust',0,0,rIn,rOut,PI*.6,TAU+PI*.4,.3,.3+hWall,P('salvageRust'),28);
   ring('salvagePlate',0,1.85,0,rOut+.04,.055,P('salvagePlate'),0,PI/2,0,28);
   /* Conical Stripe bunchgrass thatch roof cap over salvaged steel ring */
   cone('bunchgrass',0,.3+hWall-.04,0,rOut+.48,2.35,P('bunchgrass'),24);
   cyl('salvagePlate',0,.3+hWall+2.25,0,.38,.28,P('salvagePlate'),12);
  });
  pmWallBlock(-2.55,.3,0,.35,hWall,3.6);
  pmWallBlock(2.55,.3,0,.35,hWall,3.6);
  pmWallBlock(0,.3,-2.55,3.6,hWall,.35);

  pmKeyholeDoor(0,.3,rOut-.12,0,1.22,2.08,{leafMk:'iron',name:'salvage-tank-door'});
  /* Vivid 5-colour rarrk & Yanta-Rringka bark/mural plaques mounted round the tank drum */
  pmRarrkPanel(-2.45,1.55,1.65,.62,1.35,.95,{barkBoard:true,bg:'ochreRed'});
  pmRarrkPanel(2.45,1.55,1.65,-.62,1.35,.95,{barkBoard:true,bg:'celadoniteTeal'});
  pmPukamaniPole(3.15,.3,2.95,4.1,{feathers:10});

  pmTarget(0,.3,0,'salvage-tank-interior');

  pmFurnList([
   ['painted_pitch_tus_rack',-1.45,.3,-1.2,PI/4],
   ['painted_pitch_tus_rack',1.45,.3,-1.2,-PI/4],
   ['pa_crate',0,.3,-1.65,0],
   ['generic_sack',-1.55,.3,.55,PI/2],
   ['painted_woomera_dart_rack',1.55,.3,.55,-PI/2]
  ]);
 }
});

/* 33. Mineral Paint-Cake Press & Korona Orchil Barter Shed (36315 — TRADE-SCOPE.md §7.1 & §7.6) */
defBuilding({
 key:'pm_ochre_cake_press',
 name:'Mineral Paint-Cake Press and Korona Orchil Shed',
 seed:36315,
 cls:'building',
 cut:true,
 w:13.6,d:11.0,h:6.8,
 front:{x:1.8,z:4.3,yaw:0},
 tags:{style:'alcove',wealth:'middle',types:['shop','industry'],role:'dye-press',job:'dyeing'},
 note:'tabular danxia & bentonite workshop pressing 5-pigment plateau mineral clays and imported Korona hoar-table orchil lichen into stamped trade cakes alongside dried paintbrush medicine bundles',
 build(){
  pmPlinth(12.2,9.2,.28,{stepX:1.8,stepW:2.6});

  /* West pigment-blending & trade-pack workshop (viga span 4.2 m <= 4.20 m) + walkable cake-drying roof */
  const W1=pmAlcoveRoom(-3.35,-.35,.28,4.2,4.2,2.82,{
   mk:'plasterOchre',col:'plasterOchre',socleMk:'danxia',
   s:[{x:.25,w:1.16,h:2.04,kind:'door',leafMk:'curedBark',name:'cake-press-door'}],
   e:[{x:.4,w:1.08,h:1.98,kind:'door',open:true,transom:false}],
   parapetGaps:{s:[-1.1]}
  });
  pmDogonLadder(-4.45,.28,2.65,-4.45,W1.yRoof,1.82);

  /* Twin canyon-oak & mahogany screw/lever slab-presses stamping mineral & purple-red Korona orchil dye cakes */
  const cakeSpecs=[
   ['ochreRed','ochreRed'],['celadoniteTeal','celadoniteTeal'],['pipeclay','pipeclay'],
   ['ochreRed','orchil'],['plasterOchre','rabbitGold']
  ];
  svNoWalk(()=>{
   const cBed=P('danxiaCut'),cOak=P('canyonOak'),cMah=P('mahogany');
   for(const [px,pz] of [[.95,-1.55],[3.75,-1.55]]){
    box('danxiaCut',px,.286,pz,1.48,.44,.92,cBed);
    for(const sx of [-.84,.84]){
     box('canyonOak',px+sx,.286,pz,.14,1.38,.18,cOak);
    }
    box('canyonOak',px,1.68,pz,1.94,.14,.22,cOak);
    cyl('mahogany',px,1.02,pz,.055,.65,cMah,8);
    pole('juniper',[px-.56,1.36,pz+.06],[px+.56,1.36,pz-.06],.038,P('juniper'),6);
    box('mahogany',px,.88,pz,1.08,.08,.62,cMah);
    /* Stamped trade cakes on press bed (1 cm clear above bed top y = 0.726) */
    for(let c=0;c<5;c++){
     const [mk,ck]=cakeSpecs[c];
     box(mk,px-.48+c*.24,.738,pz,.18,.055,.22,P(ck));
    }
   }
   /* Rooftop sun-curing racks of stamped ochre, celadonite-teal & Korona orchil cakes */
   box('planks',-3.35,W1.yRoof+.01,-1.55,2.8,.08,.72,P('planks'));
   for(let i=0;i<5;i++){
    const [mk,ck]=cakeSpecs[i];
    box(mk,-4.35+i*.5,W1.yRoof+.1,-1.55,.32,.06,.48,P(ck));
   }
   /* East juniper shade-arbor posts over barter court */
   for(const sx of [-.4,4.9])for(const sz of [-2.8,2.6]){
    pole('juniper',[sx,.28,sz],[sx,3.2,sz],.085,P('juniper'),7);
   }
  });
  pmSilkCanopy(2.25,3.22,-.1,5.1,5.2,.22,{mk:'wildSilk',col:'wildSilk'});
  /* Hanging bundles of scarlet paintbrush medicine (TRADE-SCOPE.md §7.6, SV_CLOTH wind sway) */
  pmHerbSwag(-.4,3.08,2.6,4.9,3.08,2.6,6);
  pmHerbSwag(-.4,3.08,-2.8,4.9,3.08,-2.8,5);

  pmRarrkPanel(-3.35,1.45,1.76,0,1.65,.92,{barkBoard:true,bg:'ochreRed'});
  pmTrackRingMap(2.25,.28,1.35,0,1.15,{flat:true});

  pmTarget(-3.35,W1.yFloor,-.35,'paint-cake-workshop');
  pmTarget(2.25,.28,1.35,'orchil-barter-court');
  pmTarget(-3.35,W1.yRoof,.45,'cake-drying-terrace');

  pmFurnList([
   ['painted_ochre_grinding_slab',-4.25,W1.yFloor,-1.35,0],
   ['painted_ochre_grinding_slab',.45,.28,1.55,PI/2],
   ['painted_pitch_tus_rack',-2.35,W1.yFloor,-1.55,0],
   ['painted_pitch_tus_rack',4.25,.28,1.45,-PI/2],
   ['painted_burl_coolamon_set',-4.25,W1.yFloor,.55,PI/2],
   ['generic_sack',2.35,.28,-.15,0],
   ['generic_crate',3.95,.28,-.15,PI/2]
  ]);
 }
});
