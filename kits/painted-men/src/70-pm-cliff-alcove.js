// prefix: pm
// ================================================================= TIERED SEEP-ALCOVE & TALUS-FAN CLIFF SETTLEMENT SHOWCASE (seed 36401)
// Composite cliff-alcove village (cls: 'feature', kind: 'alcove-village', PLAN.md §1.1 & §4):
//   - Monumental cantilevered red/buff danxia sandstone & badland overhang sheltering a sandstone-bentonite contact spring
//     (WATER.still seep pool + short WATER.flow irrigation rill).
//   - 3-tier cellular Mesa Verde / Bandiagara roomblock cluster (<= 4.20 m juniper vigas) linked by single-trunk notched Dogon ladders.
//   - Wandjina seep-brow spirit mural, Yanta-Rringka stencilled open hands, Korona-feathered Pukamani lip poles, Dogon granary,
//     and a communal Stripe-bunchgrass maloca hall on the talus fan below!

defBuilding({
 key:'pm_cliff_village',
 name:'Tiered Seep-Alcove and Talus-Fan Cliff Settlement',
 seed:36401,
 cls:'feature',
 kind:'alcove-village',
 cut:false,
 w:44.0,d:30.0,h:17.8,
 budget:650000,
 tags:{style:'alcove',types:['infrastructure','plaza'],landmark:true},
 note:'composite Painted Canyon seep-alcove cliff village: cantilevered danxia overhang, WATER.still contact spring, 3-tier roomblocks, Dogon ladders, Pukamani poles & talus maloca',
 build(){
  /* Broad talus-fan flagstone & packed-earth terrace at y = 0.24 m + stepped alcove ledge at y = 2.65 m */
  svNoWalk(()=>{
   box('danxia',0,0,0,41.6,.24,27.6,P('danxia'));
   box('paving',0,.245,5.8,38.4,.08,14.2,P('paving'));
   /* Raised alcove sandstone-bentonite contact bench at rear (z = -12.6 .. -1.4, y = 0.24 .. 2.65) */
   box('badland',0,.24,-7.0,39.2,1.15,11.2,P('badland'));
   box('danxiaBuff',0,1.39,-7.1,38.6,1.26,11.0,P('danxiaBuff'));

   /* Towering rear danxia cliff wall & cantilevered rock alcove brow (h up to 16.8 m!) */
   box('danxia',0,2.65,-11.9,38.8,10.6,2.2,P('danxia'));
   box('danxiaBuff',0,13.25,-9.4,38.2,2.4,7.2,P('danxiaBuff'));
   box('danxia',0,15.65,-8.6,36.8,1.55,8.8,P('danxia'));
   /* Flanking natural danxia canyon buttress cheeks */
   for(const sx of [-18.4,18.4]){
    box('danxia',sx,2.65,-6.8,2.4,10.8,9.8,P('danxia'));
   }
  });

  /* Wandjina rock-brow rain spirits & Yanta-Rringka stencilled open hands high under the alcove arch */
  pmWandjinaBrow(0,9.8,-10.78,0,4.8,2.8);
  pmXrayBeastPanel(-8.5,9.6,-10.78,0,3.2,1.85,{beast:'pronghorn'});
  pmXrayBeastPanel(8.5,9.6,-10.78,0,3.2,1.85,{beast:'raptor'});
  pmHandStencilCluster(-13.5,8.8,-10.78,0,2.6,1.2,{count:4});
  pmHandStencilCluster(13.5,8.8,-10.78,0,2.6,1.2,{count:4});

  /* Seep-contact WATER.still spring cistern on the alcove ledge + short stone-curbed rill down the east bench */
  pmSeepBasin(0,2.65,-8.8,5.2,2.6,{name:'village-alcove-spring',color:0x1b6264});
  pmSeepRill([[0,2.82,-7.3],[0,2.72,-3.2]],.52,.55,'village-seep');

  /* 3-Tier Cellular Alcove Roomblocks on West & East Ledge Wings (every cell <= 4.1 m juniper viga span!) */
  const W1A=pmAlcoveRoom(-11.6,-5.8,2.65,4.1,4.0,2.8,{
   mk:'bentonite',col:'bentonite',socleMk:'danxiaCut',
   s:[{x:0,w:1.12,h:2.0,kind:'door',leafMk:'curedBark'}],parapetGaps:{s:[-1.0]}
  });
  const W1B=pmAlcoveRoom(-7.1,-6.0,2.65,4.1,4.0,2.8,{
   mk:'plasterOchre',col:'plasterOchre',socleMk:'danxiaCut',
   s:[{x:0,w:1.12,h:2.0,kind:'door',leafMk:'curedBark'}],parapetGaps:{s:[1.0]}
  });
  const W2=pmAlcoveRoom(-9.35,-6.6,W1A.yRoof,4.1,3.5,2.65,{
   mk:'bentonite',col:'bentonitePink',socleMk:'danxiaCut',
   s:[{x:0,w:1.06,h:1.96,kind:'door',leafMk:'juniper'}],parapetGaps:{s:[-1.0]}
  });
  const W3=pmAlcoveRoom(-9.35,-7.1,W2.yRoof,3.7,3.0,2.45,{
   mk:'ochreRed',col:'ochreRed',socleMk:'danxiaCut',
   s:[{x:0,w:1.0,h:1.9,kind:'door',leafMk:'mahogany'}],parapet:false
  });

  const E1A=pmAlcoveRoom(7.1,-6.0,2.65,4.1,4.0,2.8,{
   mk:'bentonite',col:'bentonite',socleMk:'danxiaCut',
   s:[{x:0,w:1.12,h:2.0,kind:'door',leafMk:'curedBark'}],parapetGaps:{s:[-1.0]}
  });
  const E1B=pmAlcoveRoom(11.6,-5.8,2.65,4.1,4.0,2.8,{
   mk:'plasterOchre',col:'plasterOchre',socleMk:'danxiaCut',
   s:[{x:0,w:1.12,h:2.0,kind:'door',leafMk:'curedBark'}],parapetGaps:{s:[1.0]}
  });
  const E2=pmAlcoveRoom(9.35,-6.6,E1A.yRoof,4.1,3.5,2.65,{
   mk:'ochreRed',col:'ochreRed',socleMk:'danxiaCut',
   s:[{x:0,w:1.06,h:1.96,kind:'door',leafMk:'juniper'}],parapet:false
  });

  /* Notched Dogon juniper ladders ascending from talus fan (y=0.32) -> alcove ledge (y=2.65) -> rooftop terraces */
  pmDogonLadder(-4.2,.32,-.45,-4.2,2.65,-1.45,{walk:false});
  pmDogonLadder(4.2,.32,-.45,4.2,2.65,-1.45,{walk:false});
  pmDogonLadder(-12.6,2.65,-3.05,-12.6,W1A.yRoof,-3.78,{walk:false});
  pmDogonLadder(-10.35,W1A.yRoof,-4.15,-10.35,W2.yRoof,-4.82,{walk:false});
  pmDogonLadder(6.1,2.65,-3.25,6.1,E1A.yRoof,-3.98,{walk:false});

  /* Talus-fan communal Stripe-bunchgrass maloca on west fan + Dogon conical granaries & silk winch on east fan */
  pmMalocaHall(-9.2,6.4,.32,8.6,9.4,1.2,5.8,{doorW:1.5,doorH:2.1,sparringRing:true});
  pmGranaryTower(8.2,4.8,.32,2.2,2.3,1.7,{mk:'plasterOchre'});
  pmGranaryTower(11.4,5.4,.32,2.1,2.2,1.65,{mk:'ochreRed'});
  pmSilkWinch(14.8,2.65,-2.1,0,1.8);
  pmTrackRingMap(1.8,.32,6.6,0,2.2,{flat:true});

  /* Rank of feathered Pukamani & Lorrkon poles along alcove lip and talus plaza */
  for(const [px,py,pz,ph,lk] of [
   [-2.8,2.65,-2.0,4.6,false],[2.8,2.65,-2.0,4.6,false],
   [-15.2,2.65,-2.2,4.2,true],[15.2,2.65,-2.2,4.2,true],
   [-3.4,.32,9.8,4.9,false],[5.2,.32,9.8,4.9,false]
  ]){
   pmPukamaniPole(px,py,pz,ph,{lorrkon:lk,feathers:12});
  }

  pmRarrkPanel(-11.6,3.85,-3.79,0,1.75,.9,{bg:'ochreRed'});
  pmRarrkPanel(11.6,3.85,-3.79,0,1.75,.9,{bg:'celadoniteTeal'});
  smokeAt(-9.2,6.2,6.4,{r:.28});
  smokeAt(-9.35,W3.yRoof+.3,-7.1,{r:.22});

  pmFurnList([
   ['painted_sage_smudge_pit',1.8,.32,6.6,0],
   ['painted_raided_iron_kettle',5.2,.32,6.8,0],
   ['painted_ochre_grinding_slab',-3.4,2.65,-6.2,0],
   ['painted_pitch_tus_rack',3.4,2.65,-6.2,PI],
   ['painted_woomera_dart_rack',-1.8,.32,3.4,0],
   ['painted_bark_shield_stand',4.8,.32,3.4,0]
  ]);
 }
});
