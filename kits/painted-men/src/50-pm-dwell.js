// prefix: pm
// ================================================================= DWELLINGS: POOR, MIDDLE & RICH RESIDENTIAL MATRIX (seeds 36001..36010)
// Full 6/6 wealth x single/multi matrix across alcove, maloca, and hung cliff-ledge styles (PLAN.md §2.1-§2.3 & §3):
//   Poor (36001-36003):   pm_alcove_cell_poor, pm_talus_hut_poor, pm_bark_shelter_poor
//   Middle (36004-36007): pm_alcove_house_mid, pm_hung_ledge_mid, pm_house_maloca_mid, pm_terrace_duplex_mid
//   Rich (36008-36010):   pm_alcove_compound_rich, pm_spring_palace_rich, pm_chief_maloca_rich

/* 1. Poor Single-Room Seep-Alcove Cell (36001) */
defBuilding({
 key:'pm_alcove_cell_poor',
 name:'Poor Seep-Alcove Sandstone Cell',
 seed:36001,
 cls:'building',
 cut:true,
 w:6.8,d:7.6,h:4.9,
 front:{x:0,z:2.9,yaw:0},
 tags:{style:'alcove',wealth:'poor',types:['dwelling-single'],role:'house'},
 note:'single-room tabular danxia sandstone & cream bentonite cell (3.8 m juniper viga span) with Mesa Verde keyhole door and notched Dogon rooftop ladder',
 build(){
  pmPlinth(5.6,5.6,.24,{stepW:1.8});
  const R=pmAlcoveRoom(0,-.2,.24,4.2,3.9,2.75,{
   mk:'bentonite',col:'bentonite',socleMk:'danxia',
   s:[{x:0,w:1.08,h:2.0,kind:'door',leafMk:'curedBark',name:'cell-front'}],
   e:[{x:0,y:1.25,w:.56,h:.62,kind:'win'}],
   parapetGaps:{s:[-1.35]}
  });
  pmDogonLadder(-1.35,.24,2.68,-1.35,R.yRoof,1.82);
  pmRarrkPanel(1.15,1.25,1.76,0,1.25,.85,{bg:'ochreRed'});
  pmHandStencilCluster(-1.25,1.35,1.76,0,.95,.75,{count:2});
  pmHerbSwag(-1.6,R.yRoof+.42,1.82,1.6,R.yRoof+.42,1.82,4);

  pmTarget(0,R.yFloor,-.2,'alcove-cell-room');
  pmTarget(.4,R.yRoof,-.2,'alcove-cell-roof');

  pmFurnList([
   ['painted_pronghorn_pelt_bed',-1.15,R.yFloor,-.95,0],
   ['painted_sage_smudge_pit',.45,R.yFloor,-.25,0],
   ['painted_pitch_tus_rack',1.2,R.yFloor,-1.15,PI],
   ['painted_burl_coolamon_set',1.1,R.yFloor,.65,-PI/2],
   ['painted_amaranth_mano_metate',.65,R.yRoof,-.35,0]
  ]);
 }
});

/* 2. Poor Talus Boulder-Pad & Stripe-Bunchgrass Hut (36002) */
defBuilding({
 key:'pm_talus_hut_poor',
 name:'Poor Talus Boulder and Bunchgrass Hut',
 seed:36002,
 cls:'building',
 cut:true,
 w:7.4,d:7.8,h:5.2,
 front:{x:0,z:3.1,yaw:0},
 tags:{style:'maloca',wealth:'poor',types:['dwelling-single'],role:'house'},
 note:'dry-laid danxia boulder-ring talus hut roofed in conical golden Stripe bunchgrass with cured-bark hood',
 build(){
  pmPlinth(6.2,6.2,.22,{baseMk:'stone',topMk:'earth',stepW:1.8});
  const M=pmMalocaHall(0,-.15,.22,5.0,5.2,1.15,4.35,{doorW:1.22,doorH:1.98,doorName:'talus-door'});
  pmRarrkPanel(-1.25,1.35,2.55,.22,1.05,.82,{barkBoard:true});
  pmRarrkPanel(1.25,1.35,2.55,-.22,1.05,.82,{barkBoard:true,bg:'celadoniteTeal'});
  pmPukamaniPole(2.45,.22,2.15,3.1,{feathers:8});

  pmTarget(0,.22+M.yFloor,-.2,'talus-hut-floor');

  pmFurnList([
   ['generic_poor_straw_bed',-1.15,.22+M.yFloor,-.75,.2],
   ['painted_hotstone_boiling_basket',.85,.22+M.yFloor,-.55,-PI/2],
   ['painted_burl_coolamon_set',-.85,.22+M.yFloor,.85,0],
   ['painted_woomera_dart_rack',1.15,.22+M.yFloor,.65,-PI/2],
   ['generic_basket',0,.22+M.yFloor,-1.35,0]
  ]);
 }
});

/* 3. Poor Multi-Shelter Hogback Bark Eyrie (36003) */
defBuilding({
 key:'pm_bark_shelter_poor',
 name:'Poor Hogback Cured-Bark Multi Shelter',
 seed:36003,
 cls:'building',
 cut:true,
 w:9.8,d:7.6,h:4.7,
 front:{x:0,z:3.0,yaw:0},
 tags:{style:'alcove',wealth:'poor',types:['dwelling-multi'],role:'house'},
 note:'paired seasonal hogback shelters of cured canyon-oak bark slabs, juniper vigas and danxia wind-walls sharing a smudge hearth',
 build(){
  pmPlinth(8.8,6.0,.22,{baseMk:'danxia',topMk:'paving',stepW:2.2});
  const L=pmAlcoveRoom(-2.2,-.25,.22,3.8,3.6,2.55,{
   mk:'curedBark',col:'curedBark',socleMk:'danxia',parapet:false,
   s:[{x:.25,w:1.04,h:1.94,kind:'door',leafMk:'curedBark',transom:false,name:'bark-west-door'}]
  });
  const R=pmAlcoveRoom(2.2,-.1,.22,3.8,3.6,2.55,{
   mk:'plasterOchre',col:'plasterOchre',socleMk:'danxiaBuff',parapet:false,
   s:[{x:-.25,w:1.04,h:1.94,kind:'door',leafMk:'curedBark',transom:false,name:'bark-east-door'}]
  });
  /* Shared central juniper shade-pergola (< 1.2 m clear gap) */
  pmSilkCanopy(0,2.88,.45,1.6,2.4,.14,{mk:'hide',col:'hide'});
  pmHandStencilCluster(-2.2,1.3,1.56,0,1.1,.75,{count:3});
  pmXrayBeastPanel(2.2,1.25,1.71,0,1.25,.85,{beast:'pronghorn'});

  pmTarget(-2.2,L.yFloor,-.25,'west-bark-cell');
  pmTarget(2.2,R.yFloor,-.1,'east-bark-cell');

  pmFurnList([
   ['generic_poor_straw_bed',-2.6,L.yFloor,-.85,0],
   ['painted_burl_coolamon_set',-1.6,L.yFloor,.35,-PI/2],
   ['painted_pronghorn_pelt_bed',2.55,R.yFloor,-.7,0],
   ['painted_pitch_tus_rack',1.55,R.yFloor,-.95,0],
   ['painted_sage_smudge_pit',0,.22,1.35,0],
   ['painted_dogon_notched_ladder',-3.85,.22,1.2,PI/4]
  ]);
 }
});

/* 4. Middle Two-Storey Seep-Alcove House (36004) */
defBuilding({
 key:'pm_alcove_house_mid',
 name:'Middle Two-Storey Seep-Alcove House',
 seed:36004,
 cls:'building',
 cut:true,
 w:9.8,d:9.4,h:7.6,
 front:{x:-1.8,z:3.8,yaw:0},
 tags:{style:'alcove',wealth:'middle',types:['dwelling-single'],role:'house'},
 note:'stepped 2-storey Mesa Verde / Bandiagara sandstone-and-bentonite house with projecting juniper vigas, rooftop work-plaza and notched Dogon ladders',
 build(){
  pmPlinth(8.6,7.6,.28,{stepX:-1.8,stepW:2.2});
  /* Ground west living cell & ground east granary-kitchen cell (stepped in Z by 14 cm -> zero coplanar walls!) */
  const G1=pmAlcoveRoom(-2.05,.25,.28,4.1,4.2,2.85,{
   mk:'bentonite',col:'bentonite',socleMk:'danxia',
   s:[{x:0,w:1.15,h:2.05,kind:'door',leafMk:'curedBark',name:'mid-alcove-main'}],
   w:[{x:0,y:1.2,w:.62,h:.68,kind:'win'}],
   e:[{x:.6,w:1.05,h:1.98,kind:'door',open:true,transom:false}],
   parapetGaps:{s:[-1.1],n:[0]}
  });
  const G2=pmAlcoveRoom(2.15,.11,.28,3.9,4.0,2.85,{
   mk:'bentonite',col:'bentonitePink',socleMk:'danxiaBuff',
   s:[{x:.4,w:1.08,h:2.0,kind:'door',leafMk:'juniper',name:'mid-alcove-east'},{x:-.85,y:1.25,w:.58,h:.65,kind:'win'}],
   parapetGaps:{n:[0]}
  });
  /* Second-storey setback roomblock over rear (-z), inset cleanly on X and Z */
  const U1=pmAlcoveRoom(-.1,-1.45,G1.yRoof,4.2,3.5,2.68,{
   mk:'plasterOchre',col:'plasterOchre',socleMk:'danxiaCut',
   s:[{x:0,w:1.06,h:1.98,kind:'door',leafMk:'curedBark',name:'mid-alcove-upper'}],
   e:[{x:0,y:1.15,w:.55,h:.62,kind:'win'}],
   parapetGaps:{s:[1.2]}
  });

  /* Notched Dogon juniper ladders: ground -> G1 terrace -> U1 roof */
  pmDogonLadder(-3.15,.28,3.25,-3.15,G1.yRoof,2.38);
  pmDogonLadder(1.1,G1.yRoof,1.15,1.1,U1.yRoof,.34);

  pmRarrkPanel(-2.05,1.4,2.36,0,1.55,.88,{bg:'ochreRed'});
  pmXrayBeastPanel(2.15,1.35,2.12,0,1.45,.92,{beast:'raptor'});
  pmHandStencilCluster(-.1,G1.yRoof+1.35,.31,0,1.35,.78,{count:3});
  pmPukamaniPole(3.55,.28,2.85,3.8,{feathers:10});
  smokeAt(.4,U1.yRoof+.35,-1.45,{r:.22});

  pmTarget(-2.05,G1.yFloor,.25,'ground-west-hall');
  pmTarget(2.15,G2.yFloor,.11,'ground-east-kitchen');
  pmTarget(-2.05,G1.yRoof,1.2,'terrace-plaza');
  pmTarget(-.1,U1.yFloor,-1.45,'upper-alcove-chamber');

  pmFurnList([
   ['painted_sage_smudge_pit',-2.05,G1.yFloor,-.35,0],
   ['painted_rarrk_bark_screen',-3.35,G1.yFloor,-.55,PI/2],
   ['painted_woomera_dart_rack',-3.35,G1.yFloor,.95,PI/2],
   ['painted_hotstone_boiling_basket',2.15,G2.yFloor,-.55,0],
   ['painted_pitch_tus_rack',3.25,G2.yFloor,-.65,-PI/2],
   ['painted_burl_coolamon_set',1.25,G2.yFloor,.85,0],
   ['painted_pronghorn_pelt_bed',-.95,U1.yFloor,-1.65,0],
   ['painted_ochre_grinding_slab',-2.45,G1.yRoof,1.25,0]
  ]);
 }
});

/* 5. Middle Hung Moat-Wall Ledge House (36005) */
defBuilding({
 key:'pm_hung_ledge_mid',
 name:'Middle Hung Moat-Wall Cantilever House',
 seed:36005,
 cls:'building',
 cut:true,
 w:9.2,d:8.8,h:7.8,
 front:{x:-2.1,z:3.9,yaw:0},
 tags:{style:'hung',wealth:'middle',types:['dwelling-single'],role:'house'},
 note:'cantilevered Korona moat-lip dwelling riding heavy socketed canyon-oak beams and raking struts with braided wild-silk cargo winch',
 build(){
  const L=pmHungLedge(0,0,2.15,7.6,6.8,{cliffD:1.7,cliffH:6.9,ladderX:-2.1});
  const H1=pmAlcoveRoom(.65,.45,L.yDeck,4.2,3.8,2.65,{
   mk:'bentonite',col:'bentonite',socleMk:'danxiaCut',socleH:.24,
   s:[{x:-.4,w:1.08,h:1.98,kind:'door',leafMk:'curedBark',name:'hung-ledge-door'},{x:1.05,y:1.15,w:.56,h:.64,kind:'win'}],
   w:[{x:0,y:1.15,w:.54,h:.62,kind:'win'}],
   parapet:false
  });
  pmSilkWinch(-2.55,L.yDeck,2.35,0,1.45);
  pmRarrkPanel(.65,L.yDeck+1.25,2.36,0,1.4,.85,{barkBoard:true});
  pmWandjinaBrow(-2.1,4.55,-1.68,0,1.8,1.25);
  pmHideCurtain(-2.1,L.yDeck+2.15,.95,0,1.35,1.25);

  pmTarget(-2.1,L.yDeck,1.8,'cantilever-deck');
  pmTarget(.65,H1.yFloor,.45,'hung-cabin');

  pmFurnList([
   ['painted_pronghorn_pelt_bed',1.65,H1.yFloor,-.25,-PI/2],
   ['painted_pitch_tus_rack',-.65,H1.yFloor,-.75,0],
   ['painted_bark_shield_stand',1.8,H1.yFloor,1.2,-PI/2],
   ['painted_burl_coolamon_set',-1.95,L.yDeck,-.15,0],
   ['generic_basket',-2.75,L.yDeck,.75,0]
  ]);
 }
});

/* 6. Middle Family Oval Maloca (36006) */
defBuilding({
 key:'pm_house_maloca_mid',
 name:'Middle Canyon-Fan Family Maloca',
 seed:36006,
 cls:'building',
 cut:true,
 w:10.4,d:11.6,h:6.2,
 front:{x:0,z:4.8,yaw:0},
 tags:{style:'maloca',wealth:'middle',types:['dwelling-single'],role:'house'},
 note:'family oval maloca framed in bent canyon-oak and juniper cruck-ribs over a 1.1 m danxia wind-wall with stepped Stripe bunchgrass thatch',
 build(){
  pmPlinth(9.0,9.8,.24,{baseMk:'danxia',topMk:'paving',stepW:2.3});
  const M=pmMalocaHall(0,-.2,.24,7.6,8.4,1.18,5.35,{doorW:1.42,doorH:2.08,doorName:'family-maloca-door'});
  pmRarrkPanel(-1.65,1.45,3.95,.25,1.35,.95,{barkBoard:true});
  pmRarrkPanel(1.65,1.45,3.95,-.25,1.35,.95,{barkBoard:true,bg:'celadoniteTeal'});
  pmPukamaniPole(-3.4,.24,3.4,3.6,{feathers:10});
  pmPukamaniPole(3.4,.24,3.4,3.9,{feathers:10});
  smokeAt(0,5.65,-.2,{r:.25});

  const fy=.24+M.yFloor;
  pmTarget(0,fy,-.2,'maloca-hearth-hall');

  pmFurnList([
   ['painted_raided_iron_kettle',0,fy,-.15,0],
   ['painted_pronghorn_pelt_bed',-2.05,fy,-1.35,PI/2],
   ['painted_pronghorn_pelt_bed',2.05,fy,-1.35,-PI/2],
   ['painted_rarrk_bark_screen',0,fy,-2.45,0],
   ['painted_pitch_tus_rack',-2.15,fy,1.15,PI/2],
   ['painted_woomera_dart_rack',2.15,fy,1.15,-PI/2],
   ['painted_burl_coolamon_set',1.15,fy,.35,0]
  ]);
 }
});

/* 7. Middle Stepped Terrace Duplex (36007) */
defBuilding({
 key:'pm_terrace_duplex_mid',
 name:'Middle Stepped Sandstone Terrace Duplex',
 seed:36007,
 cls:'building',
 cut:true,
 w:11.6,d:9.2,h:7.4,
 front:{x:0,z:3.8,yaw:0},
 tags:{style:'alcove',wealth:'middle',types:['dwelling-multi'],role:'house'},
 note:'paired cellular danxia & bentonite family dwellings (<= 4.0 m viga spans) sharing a stepped upper drying court and hand-stencilled facade',
 build(){
  pmPlinth(10.4,7.4,.26,{stepW:2.6});
  const W1=pmAlcoveRoom(-2.65,.2,.26,4.2,4.1,2.8,{
   mk:'bentonite',col:'bentonite',socleMk:'danxia',
   s:[{x:-.2,w:1.12,h:2.02,kind:'door',leafMk:'curedBark',name:'duplex-west-door'},{x:1.15,y:1.2,w:.55,h:.62,kind:'win'}],
   parapetGaps:{s:[1.2]}
  });
  const E1=pmAlcoveRoom(2.65,.05,.26,4.2,4.1,2.8,{
   mk:'plasterOchre',col:'plasterOchre',socleMk:'danxiaBuff',
   s:[{x:.2,w:1.12,h:2.02,kind:'door',leafMk:'curedBark',name:'duplex-east-door'},{x:-1.15,y:1.2,w:.55,h:.62,kind:'win'}],
   parapetGaps:{s:[-1.2]}
  });
  /* Shared central arch-breezeway & upper rear room */
  const U=pmAlcoveRoom(0,-1.35,W1.yRoof,4.1,3.4,2.6,{
   mk:'bentonite',col:'bentonitePink',socleMk:'danxiaCut',
   s:[{x:0,w:1.06,h:1.96,kind:'door',leafMk:'juniper',name:'duplex-upper-door'}],
   parapet:false
  });
  /* Walkable bridge slab linking W1 and E1 terraces across the 1.1 m central gap */
  box('paving',0,W1.yRoof-.12,.85,1.35,.12,2.2,P('paving'));
  pmDogonLadder(-1.45,.26,3.15,-1.45,W1.yRoof,2.28);

  pmHandStencilCluster(-2.65,1.45,2.26,0,1.4,.8,{count:3});
  pmRarrkPanel(2.65,1.45,2.11,0,1.4,.8,{bg:'celadoniteTeal'});
  pmHerbSwag(-3.8,W1.yRoof+.4,2.2,3.8,E1.yRoof+.4,2.05,6);

  pmTarget(-2.65,W1.yFloor,.2,'duplex-west-unit');
  pmTarget(2.65,E1.yFloor,.05,'duplex-east-unit');
  pmTarget(0,U.yFloor,-1.35,'duplex-upper-room');

  pmFurnList([
   ['painted_pronghorn_pelt_bed',-3.35,W1.yFloor,-.75,PI/2],
   ['painted_sage_smudge_pit',-2.15,W1.yFloor,.35,0],
   ['painted_pitch_tus_rack',-1.55,W1.yFloor,-1.15,0],
   ['painted_pronghorn_pelt_bed',3.35,E1.yFloor,-.85,-PI/2],
   ['painted_hotstone_boiling_basket',2.15,E1.yFloor,.25,0],
   ['painted_woomera_dart_rack',1.55,E1.yFloor,-1.1,0],
   ['painted_amaranth_mano_metate',-.85,U.yFloor,-1.55,0],
   ['painted_burl_coolamon_set',.85,U.yFloor,-1.55,PI]
  ]);
 }
});

/* 8. Rich 3-Tier Mesa Verde Seep-Alcove Clan Compound (36008) */
defBuilding({
 key:'pm_alcove_compound_rich',
 name:'Rich Three-Tier Seep-Alcove Clan Compound',
 seed:36008,
 cls:'building',
 cut:true,
 w:15.6,d:13.8,h:11.4,
 front:{x:0,z:5.6,yaw:0},
 tags:{style:'alcove',wealth:'rich',types:['dwelling-multi'],role:'compound'},
 note:'3-tier Mesa Verde / Bandiagara alcove roomblock compound with round danxia watch-tower, WATER.still back-wall seep cistern, Pukamani poles and notched Dogon ladders',
 build(){
  pmPlinth(14.2,11.8,.32,{stepW:3.0});

  /* Tier 1: East & West front courtyard wings flanking paved clan plaza + rear WATER.still seep cistern */
  const W1=pmAlcoveRoom(-4.4,1.6,.32,4.1,4.2,2.9,{
   mk:'bentonite',col:'bentonite',socleMk:'danxia',
   s:[{x:0,w:1.18,h:2.08,kind:'door',leafMk:'curedBark',name:'compound-west-door'}],
   e:[{x:.5,w:1.08,h:2.0,kind:'door',open:true,transom:false}],
   parapetGaps:{e:[0],n:[0]}
  });
  const E1=pmAlcoveRoom(4.4,1.45,.32,4.1,4.2,2.9,{
   mk:'plasterOchre',col:'plasterOchre',socleMk:'danxiaBuff',
   s:[{x:0,w:1.18,h:2.08,kind:'door',leafMk:'curedBark',name:'compound-east-door'}],
   w:[{x:.5,w:1.08,h:2.0,kind:'door',open:true,transom:false}],
   parapetGaps:{w:[0],n:[0]}
  });
  const C1=pmAlcoveRoom(-2.15,-2.35,.32,4.2,5.1,2.9,{
   mk:'bentonite',col:'bentonitePink',socleMk:'danxia',
   s:[{x:.2,w:1.16,h:2.05,kind:'door',leafMk:'juniper',name:'compound-hall-door'}],
   parapetGaps:{s:[-1.15]}
  });

  /* Back-wall WATER.still seep-contact spring basin on east rear court + Wandjina brow wall */
  pmSegmentedWall(3.2,.32,-4.7,0,6.4,5.4,{mk:'danxia',col:'danxia',socleH:1.4,socleMk:'danxiaCut'});
  pmWandjinaBrow(3.2,2.6,-4.46,0,2.6,1.65);
  pmSeepBasin(3.2,.32,-2.95,3.4,2.3,{name:'compound-alcove'});

  /* Tier 2: Central stepped roomblock over C1 leaving 1.55 m deep front terrace [z = -1.35 .. +0.20] */
  const T2=pmAlcoveRoom(-2.15,-3.1,C1.yRoof,3.95,3.5,2.72,{
   mk:'plasterOchre',col:'plasterOchre',socleMk:'danxiaCut',
   s:[{x:-.2,w:1.08,h:1.98,kind:'door',leafMk:'curedBark',name:'compound-t2-door'}],
   parapetGaps:{s:[1.05]}
  });

  /* Tier 3: Crown chief chamber stepped back leaving 1.05 m terrace [z = -2.40 .. -1.35] + round Mesa Verde tower */
  const T3=pmAlcoveRoom(-2.15,-3.65,T2.yRoof,3.6,2.45,2.55,{
   mk:'ochreRed',col:'ochreRed',socleMk:'danxiaCut',
   s:[{x:0,w:1.02,h:1.92,kind:'door',leafMk:'mahogany',name:'compound-t3-door'}],
   parapet:false
  });
  svNoWalk(()=>{
   lathe('danxia',-5.2,-2.9,[
    [1.65,.32],[1.52,3.6],[1.38,6.8],[1.32,8.4]
   ],18,P('danxia'));
   cyl('danxiaCut',-5.2,8.41,-2.9,1.42,.18,P('danxiaCut'),18);
   ring('celadoniteTeal',-5.2,6.2,-2.9,1.46,.05,P('celadoniteTeal'),0,PI/2,0,18);
  });

  /* Dogon notched juniper ladders: courtyard -> C1 terrace (y = C1.yRoof) -> T2 terrace (y = T2.yRoof) */
  pmDogonLadder(-3.3,.32,1.15,-3.3,C1.yRoof,.22);
  pmDogonLadder(-1.1,C1.yRoof,-.45,-1.1,T2.yRoof,-1.32);

  pmRarrkPanel(-4.4,1.55,3.71,0,1.75,.95,{bg:'ochreRed'});
  pmXrayBeastPanel(4.4,1.55,3.56,0,1.75,.95,{beast:'pronghorn'});
  pmTrackRingMap(0,.32,1.6,0,1.35,{flat:true});
  pmPukamaniPole(-1.6,.32,4.4,4.6,{feathers:12});
  pmPukamaniPole(1.6,.32,4.4,4.8,{feathers:12});
  smokeAt(-2.15,T3.yRoof+.3,-3.65,{r:.26});

  pmTarget(0,.32,1.5,'compound-plaza');
  pmTarget(-4.4,W1.yFloor,1.6,'west-clan-room');
  pmTarget(4.4,E1.yFloor,1.45,'east-clan-room');
  pmTarget(-2.15,C1.yFloor,-2.35,'rear-hearth-room');
  pmTarget(-2.15,T2.yFloor,-3.1,'tier2-room');
  pmTarget(-2.15,T3.yFloor,-3.65,'tier3-crown-room');

  pmFurnList([
   ['painted_raided_iron_kettle',0,.32,-.2,0],
   ['painted_pukamani_indoor_post',-2.15,C1.yFloor,-3.8,0],
   ['painted_pronghorn_pelt_bed',-5.1,W1.yFloor,1.4,PI/2],
   ['painted_rarrk_bark_screen',-3.6,W1.yFloor,.6,0],
   ['painted_pitch_tus_rack',5.1,E1.yFloor,1.2,-PI/2],
   ['painted_hotstone_boiling_basket',3.8,E1.yFloor,2.1,0],
   ['painted_feather_diadem_perch',-2.85,T2.yFloor,-3.8,0],
   ['painted_bark_shield_stand',-1.35,T2.yFloor,-3.8,0],
   ['painted_pronghorn_pelt_bed',-2.15,T3.yFloor,-3.85,0],
   ['painted_ochre_grinding_slab',1.4,.32,-2.9,0]
  ]);
 }
});

/* 9. Rich Paramount Paint-Chief Seep-Spring Palace (36009) */
defBuilding({
 key:'pm_spring_palace_rich',
 name:'Rich Paramount Seep-Spring Cliff Palace',
 seed:36009,
 cls:'building',
 cut:true,
 w:16.4,d:14.4,h:10.4,
 front:{x:0,z:5.9,yaw:0},
 tags:{style:'alcove',wealth:'rich',types:['dwelling-single','civic'],role:'palace'},
 note:'Paramount Paint-Chief tiered danxia & polychrome bentonite seep-spring court with Wandjina rock-brow mural, celadonite-ringed WATER.still spring and Pukamani colonnade',
 build(){
  pmPlinth(15.0,12.4,.36,{stepW:3.4});

  /* Monumental rear danxia cliff-overhang brow sheltering the sacred contact spring */
  svNoWalk(()=>{
   box('danxia',0,.36,-5.35,14.6,7.6,1.35,P('danxia'));
   box('danxiaBuff',0,7.96,-4.65,14.2,1.65,2.75,P('danxiaBuff'));
   box('badland',0,9.61,-4.85,13.4,.55,2.35,P('badland'));
  });
  pmWandjinaBrow(0,4.6,-4.66,0,3.6,2.2);
  pmHandStencilCluster(-4.4,3.8,-4.66,0,2.1,1.1,{count:4});
  pmHandStencilCluster(4.4,3.8,-4.66,0,2.1,1.1,{count:4});

  /* Central sacred celadonite-ringed WATER.still seep spring pool */
  pmSeepBasin(0,.36,-3.15,4.2,2.6,{name:'palace-sacred-spring',color:0x1b6264});

  /* Flanking West Audience Wing & East Chief Residence (viga spans <= 4.1 m) + upper Throne Terrace */
  const LW=pmAlcoveRoom(-4.65,.35,.36,4.2,5.6,3.05,{
   mk:'bentonite',col:'bentonite',socleMk:'danxiaCut',
   s:[{x:0,w:1.24,h:2.12,kind:'door',leafMk:'mahogany',name:'palace-west-door'}],
   e:[{x:.8,w:1.16,h:2.05,kind:'door',open:true,transom:false}],
   parapetGaps:{e:[1.1]}
  });
  const RW=pmAlcoveRoom(4.65,.2,.36,4.2,5.6,3.05,{
   mk:'plasterOchre',col:'plasterOchre',socleMk:'danxiaCut',
   s:[{x:0,w:1.24,h:2.12,kind:'door',leafMk:'mahogany',name:'palace-east-door'}],
   w:[{x:.8,w:1.16,h:2.05,kind:'door',open:true,transom:false}],
   parapetGaps:{w:[1.1]}
  });
  const UP=pmAlcoveRoom(-4.65,-.45,LW.yRoof,3.9,3.8,2.75,{
   mk:'ochreRed',col:'ochreRed',socleMk:'danxiaCut',
   s:[{x:0,w:1.1,h:2.0,kind:'door',leafMk:'curedBark',name:'palace-upper-door'}],
   parapet:false
  });

  pmDogonLadder(-2.1,.36,1.45,-2.52,LW.yRoof,1.45);
  pmDogonLadder(2.1,.36,1.3,2.52,RW.yRoof,1.3);

  /* Wild-silk ceremonial awning & 4 feathered Pukamani clan poles framing the entrance court */
  pmSilkCanopy(0,3.65,2.2,4.4,3.2,.24,{mk:'wildSilk',col:'wildSilk'});
  for(const [px,pz,ph] of [[-2.4,4.8,4.9],[2.4,4.8,4.9],[-6.4,4.6,4.2],[6.4,4.6,4.2]]){
   pmPukamaniPole(px,.36,pz,ph,{feathers:12});
  }
  pmRarrkPanel(-4.65,1.65,3.16,0,2.1,1.05,{bg:'celadoniteTeal'});
  pmRarrkPanel(4.65,1.65,3.01,0,2.1,1.05,{bg:'ochreRed'});
  pmTrackRingMap(0,.36,2.3,0,1.5,{flat:true});

  pmTarget(0,.36,2.2,'palace-spring-court');
  pmTarget(-4.65,LW.yFloor,.35,'west-audience-hall');
  pmTarget(4.65,RW.yFloor,.2,'east-chief-suite');
  pmTarget(-4.65,UP.yFloor,-.45,'upper-council-chamber');
  pmTarget(4.65,RW.yRoof,.2,'east-rooftop-terrace');

  pmFurnList([
   ['painted_pukamani_indoor_post',-4.65,LW.yFloor,-1.4,0],
   ['painted_feather_diadem_perch',-5.6,LW.yFloor,.2,PI/2],
   ['painted_woomera_dart_rack',-5.6,LW.yFloor,1.6,PI/2],
   ['painted_bark_shield_stand',-3.65,LW.yFloor,-1.5,0],
   ['painted_pronghorn_pelt_bed',5.45,RW.yFloor,-1.1,-PI/2],
   ['painted_rarrk_bark_screen',4.65,RW.yFloor,.4,0],
   ['painted_pitch_tus_rack',3.65,RW.yFloor,-1.5,0],
   ['painted_sage_smudge_pit',0,.36,-.35,0],
   ['painted_ochre_grinding_slab',-4.65,UP.yFloor,-1.1,0],
   ['painted_raided_iron_kettle',4.65,RW.yRoof,-.6,0]
  ]);
 }
});

/* 10. Rich Great Clan-Chief Oval Maloca Compound (36010) */
defBuilding({
 key:'pm_chief_maloca_rich',
 name:'Rich Clan-Chief Great Maloca Compound',
 seed:36010,
 cls:'building',
 cut:true,
 w:14.8,d:15.8,h:9.6,
 front:{x:0,z:6.6,yaw:0},
 tags:{style:'maloca',wealth:'rich',types:['dwelling-multi','civic'],role:'compound'},
 note:'great canyon-fan clan-chief oval maloca thatched in thick Stripe bunchgrass with towering rarrk bark frontispiece, twin Pukamani poles and Dogon granary',
 build(){
  pmPlinth(13.4,14.0,.3,{baseMk:'danxia',topMk:'paving',stepW:3.0});
  const M=pmMalocaHall(0,-.55,.3,10.2,11.0,1.28,6.85,{
   doorW:1.68,doorH:2.25,backDoor:true,sparringRing:true,doorName:'chief-maloca-door'
  });
  /* Flanking Dogon bunchgrass-hatted chief tribute granary on SW corner of plinth */
  pmGranaryTower(-4.8,4.3,.3,2.2,2.2,1.65,{mk:'ochreRed'});

  /* Towering painted bark frontispiece panels & Korona-feathered Pukamani poles */
  pmRarrkPanel(-2.25,1.65,5.15,.22,1.65,1.25,{barkBoard:true,bg:'ochreRed'});
  pmRarrkPanel(2.25,1.65,5.15,-.22,1.65,1.25,{barkBoard:true,bg:'celadoniteTeal'});
  pmXrayBeastPanel(0,3.25,5.2,0,1.65,1.05,{beast:'raptor'});
  pmPukamaniPole(-2.6,.3,5.8,5.1,{feathers:12});
  pmPukamaniPole(2.6,.3,5.8,5.1,{feathers:12});
  pmPukamaniPole(4.8,.3,4.5,4.2,{lorrkon:true,feathers:10});
  smokeAt(0,7.2,-.55,{r:.3});

  const fy=.3+M.yFloor;
  pmTarget(0,fy,-.55,'chief-maloca-ring');
  pmTarget(0,.3,5.6,'chief-forecourt');

  pmFurnList([
   ['painted_sage_smudge_pit',0,fy,-2.4,0],
   ['painted_pukamani_indoor_post',0,fy,-3.8,0],
   ['painted_feather_diadem_perch',-2.8,fy,-2.2,PI/2],
   ['painted_feather_diadem_perch',2.8,fy,-2.2,-PI/2],
   ['painted_pronghorn_pelt_bed',-3.1,fy,-.2,PI/2],
   ['painted_pronghorn_pelt_bed',3.1,fy,-.2,-PI/2],
   ['painted_rarrk_bark_screen',-2.6,fy,1.5,PI/4],
   ['painted_bark_shield_stand',2.6,fy,1.5,-PI/4],
   ['painted_raided_iron_kettle',2.9,.3,4.8,0]
  ]);
 }
});
