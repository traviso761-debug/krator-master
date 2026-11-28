// prefix: pm
// ================================================================= CIVIC, SACRED, RAIDER HALLS & CLIFF DEFENCE (seeds 36101..36204)
//   Civic & Sacred (36101-36104): pm_maloca_warrior_hall, pm_stone_circle_shrine, pm_lorrkon_ossuary, pm_truce_ring_pavilion
//   Cliff Defence (36201-36204):  pm_eyrie_watchtower, pm_ladder_gatehouse, pm_ledge_parapet, pm_silk_winch_post

/* 11. Communal Warrior Sparring Maloca Hall (36101) */
defBuilding({
 key:'pm_maloca_warrior_hall',
 name:'Payntja-Mana Warrior Sparring Maloca Hall',
 seed:36101,
 cls:'building',
 cut:true,
 w:14.4,d:16.2,h:9.4,
 front:{x:0,z:6.8,yaw:0},
 tags:{style:'maloca',wealth:'middle',types:['military','civic'],role:'barracks'},
 note:'communal bent-oak & Stripe-bunchgrass warrior maloca with Xingu sanded wrestling ring, woomera/shield racks, body-paint slabs and Pukamani trophy poles',
 build(){
  pmPlinth(13.0,14.4,.28,{baseMk:'danxia',topMk:'paving',stepW:3.2});
  const M=pmMalocaHall(0,-.35,.28,9.8,11.6,1.25,6.65,{
   doorW:1.72,doorH:2.22,backDoor:true,sparringRing:true,doorName:'warrior-maloca-door'
  });
  /* Palisade cheek-screens painted with Yanta-Rringka warrior hand stencils */
  for(const sx of [-4.6,4.6]){
   pmSegmentedWall(sx,.28,5.4,0,2.6,2.1,{mk:'danxia',col:'danxia',socleH:.5,socleMk:'danxiaCut'});
   pmHandStencilCluster(sx,1.15,5.64,0,1.9,.85,{count:3});
  }
  pmXrayBeastPanel(-2.15,1.55,5.25,.24,1.55,1.1,{beast:'raptor'});
  pmXrayBeastPanel(2.15,1.55,5.25,-.24,1.55,1.1,{beast:'pronghorn'});
  pmPukamaniPole(-2.7,.28,5.9,4.8,{feathers:12});
  pmPukamaniPole(2.7,.28,5.9,4.8,{feathers:12});
  smokeAt(0,7.0,-.35,{r:.28});

  const fy=.28+M.yFloor;
  pmTarget(0,fy,-.35,'sparring-ring-floor');

  pmFurnList([
   ['painted_woomera_dart_rack',-3.2,fy,-1.6,PI/2],
   ['painted_woomera_dart_rack',3.2,fy,-1.6,-PI/2],
   ['painted_bark_shield_stand',-3.1,fy,1.2,PI/2],
   ['painted_bark_shield_stand',3.1,fy,1.2,-PI/2],
   ['painted_ochre_grinding_slab',-1.8,fy,-3.4,0],
   ['painted_ochre_grinding_slab',1.8,fy,-3.4,0],
   ['painted_raided_iron_kettle',0,fy,-3.9,0],
   ['painted_pukamani_indoor_post',0,fy,3.2,PI]
  ]);
 }
});

/* 12. Shamanic Danxia Stone Circle & Sunken Kiva Shrine (36102) */
defBuilding({
 key:'pm_stone_circle_shrine',
 name:'Shamanic Danxia Monolith Circle and Smudge Kiva',
 seed:36102,
 cls:'building',
 cut:false,
 w:15.2,d:15.2,h:6.2,
 front:{x:0,z:6.6,yaw:0},
 tags:{style:'alcove',wealth:'middle',types:['religious','plaza'],role:'shrine',job:'worship',landmark:true},
 note:'ring of Yanta-Rringka stencilled danxia monoliths and feathered Pukamani poles enclosing a sunken circular stone-lined smudge kiva and songline track-ring',
 build(){
  /* Outer raised annular earth-and-danxia berm (+0.78 m) enclosing sunken central kiva court at y = 0.09 m */
  const rIn=4.2,rOut=6.4,bermH=.78;
  box('paving',0,0,0,9.2,.09,9.2,P('paving'));
  wkPad(0,0,8.4,8.4,.09);

  /* Annular berm split around +z entrance passage (angle PI/2) */
  svNoWalk(()=>{
   sector('danxia',0,0,rIn,rOut,PI*.62,TAU+PI*.38,0,bermH-.12,P('danxia'),28);
   sector('danxiaCut',0,0,rIn-.08,rOut-.12,PI*.62,TAU+PI*.38,bermH-.12,bermH,P('danxiaCut'),28);
   /* Flanking portal monoliths & lintel at +z entry */
   for(const sx of [-1.25,1.25]){
    box('danxiaCut',sx,0,5.2,.68,2.65,.68,P('danxiaCut'));
   }
   pole('juniper',[-1.65,2.74,5.2],[1.65,2.74,5.2],.11,P('juniper'),8);
  });
  svLeaf(0,.1,5.2,0,1.65,2.2,{mk:'curedBark',col:P('curedBark'),style:'plank',name:'shrine-portal'});
  door(0,.09,5.2,0,1.72,2.3);

  /* Ring of 8 standing danxia sandstone monoliths painted with hand stencils & X-ray spirits + 4 Pukamani poles */
  for(let i=0;i<8;i++){
   const a=i*TAU/8+PI/8;
   const mx=Math.cos(a)*5.3,mz=Math.sin(a)*5.3;
   if(mz>4.0&&Math.abs(mx)<2.0)continue;
   const mh=2.8+(i%3)*.45;
   W(mx,bermH,mz,Math.atan2(-mx,-mz),()=>{
    svNoWalk(()=>{
     box('danxia',0,0,0,.78,mh,.42,P(i%2===0?'danxia':'danxiaBuff'));
    });
    if(i%2===0)pmHandStencilCluster(0,mh*.45,.21,0,.62,.68,{count:1});
    else pmRarrkPanel(0,mh*.38,.21,0,.58,.72,{bg:'celadoniteTeal'});
   });
  }
  for(const a of [PI*.25,PI*.75,PI*1.25,PI*1.75]){
   pmPukamaniPole(Math.cos(a)*3.55,.09,Math.sin(a)*3.55,4.9,{feathers:12});
  }
  pmTrackRingMap(0,.09,0,0,2.45,{flat:true});
  smokeAt(0,.65,0,{r:.24});

  pmTarget(0,.09,0,'sunken-kiva-circle');

  pmFurnList([
   ['painted_sage_smudge_pit',0,.09,0,0],
   ['painted_ochre_grinding_slab',-1.95,.09,-1.45,PI/4],
   ['painted_bark_shield_stand',1.95,.09,-1.45,-PI/4],
   ['painted_feather_diadem_perch',0,.09,-2.75,0]
  ]);
 }
});

/* 13. Hollow-Log Lorrkon Mortuary Cliff Ossuary (36103) */
defBuilding({
 key:'pm_lorrkon_ossuary',
 name:'Hollow-Log Lorrkon Cliff Ossuary',
 seed:36103,
 cls:'building',
 cut:true,
 w:11.2,d:9.4,h:6.8,
 front:{x:0,z:3.8,yaw:0},
 tags:{style:'alcove',wealth:'middle',types:['funerary','religious'],role:'ossuary',job:'worship'},
 note:'sacred danxia ledge mortuary terrace housing standing hollow canyon-oak Lorrkon bone-poles, X-ray spirit panels and smudge chamber',
 build(){
  pmPlinth(9.8,7.6,.34,{stepW:2.4});
  /* Rear mortuary bone-painting sanctuary cell + front Lorrkon pole court */
  const S=pmAlcoveRoom(0,-1.45,.34,4.2,3.6,2.8,{
   mk:'ochreRed',col:'ochreRed',socleMk:'danxiaCut',
   s:[{x:0,w:1.14,h:2.05,kind:'door',leafMk:'curedBark',name:'ossuary-door'}],
   parapet:false
  });
  pmWandjinaBrow(0,1.65,.36,0,1.4,.95);
  pmXrayBeastPanel(-3.1,1.35,-2.6,0,1.8,1.25,{barkBoard:true,beast:'raptor'});
  pmXrayBeastPanel(3.1,1.35,-2.6,0,1.8,1.25,{barkBoard:true,beast:'korona'});

  /* Seven standing hollow-log Lorrkon bone-coffins across the forecourt */
  for(const [lx,lz,lh] of [[-3.4,1.6,4.8],[-1.9,2.1,4.2],[1.9,2.1,4.4],[3.4,1.6,5.1],[-3.6,-.4,3.9],[3.6,-.4,4.1],[0,2.5,5.3]]){
   if(Math.abs(lx)<.8)continue;
   pmPukamaniPole(lx,.34,lz,lh,{lorrkon:true,feathers:10});
  }
  pmPukamaniPole(-1.35,.34,2.6,5.2,{lorrkon:true,feathers:12});
  pmPukamaniPole(1.35,.34,2.6,5.2,{lorrkon:true,feathers:12});

  pmTarget(0,.34,1.6,'lorrkon-pole-court');
  pmTarget(0,S.yFloor,-1.45,'ossuary-painting-cell');

  pmFurnList([
   ['painted_ochre_grinding_slab',-1.1,S.yFloor,-2.1,0],
   ['painted_feather_diadem_perch',1.1,S.yFloor,-2.1,0],
   ['painted_rarrk_bark_screen',0,S.yFloor,-2.65,0],
   ['painted_sage_smudge_pit',0,.34,1.35,0],
   ['painted_burl_coolamon_set',1.2,S.yFloor,-.8,-PI/2]
  ]);
 }
});

/* 14. Superbloom Playa Clan Truce-Ring Pavilion (36104) */
defBuilding({
 key:'pm_truce_ring_pavilion',
 name:'Superbloom Playa Clan Truce-Ring Pavilion',
 seed:36104,
 cls:'building',
 cut:true,
 w:13.6,d:12.4,h:6.4,
 front:{x:0,z:5.2,yaw:0},
 tags:{style:'maloca',wealth:'middle',types:['civic','market','inn'],role:'market',job:'trading',market:true},
 note:'neutral spring superbloom playa moot & trade pavilion where Painted Men clans barter ochre, pelts and pitch-baskets for Korona wild-silk and obsidian',
 build(){
  pmPlinth(12.2,10.8,.26,{baseMk:'danxiaBuff',topMk:'paving',stepW:3.0});
  /* Rear tally & barter vault cell (viga span 3.8 m <= 4.2 m) */
  const V=pmAlcoveRoom(0,-2.9,.26,4.2,3.6,2.7,{
   mk:'plasterOchre',col:'plasterOchre',socleMk:'danxiaCut',
   s:[{x:0,w:1.22,h:2.05,kind:'door',leafMk:'curedBark',name:'truce-vault-door'}],
   parapet:false
  });

  /* Six canyon-oak posts carrying a wide Korona braided wild-silk truce canopy over the concentric track-ring plaza */
  const cY=3.85;
  svNoWalk(()=>{
   for(const sx of [-4.2,0,4.2])for(const sz of [-.4,3.8]){
    if(sx===0&&sz===-.4)continue;
    pole('canyonOak',[sx,.26,sz],[sx,cY+.15,sz],.12,P('canyonOak'),8);
   }
   beam('juniper',[-4.3,cY,-.4],[4.3,cY,-.4],.14,P('juniper'));
   beam('juniper',[-4.3,cY,3.8],[4.3,cY,3.8],.14,P('juniper'));
   beam('juniper',[-4.2,cY,-.5],[-4.2,cY,3.9],.14,P('juniper'));
   beam('juniper',[4.2,cY,-.5],[4.2,cY,3.9],.14,P('juniper'));
  });
  pmRecordViga(4.2,4);
  pmSilkCanopy(0,cY+.16,1.7,8.2,4.1,.28,{mk:'wildSilk',col:'wildSilk'});
  pmTrackRingMap(0,.26,1.7,0,2.1,{flat:true});
  pmPukamaniPole(-5.1,.26,4.2,4.4,{feathers:10});
  pmPukamaniPole(5.1,.26,4.2,4.4,{feathers:10});
  pmRarrkPanel(-2.9,1.35,-1.1,0,1.5,.9,{barkBoard:true});
  pmRarrkPanel(2.9,1.35,-1.1,0,1.5,.9,{barkBoard:true,bg:'celadoniteTeal'});

  pmTarget(0,.26,1.7,'truce-barter-ring');
  pmTarget(0,V.yFloor,-2.9,'truce-tally-room');

  pmFurnList([
   ['painted_ochre_grinding_slab',-2.8,.26,1.5,PI/2],
   ['painted_pitch_tus_rack',2.8,.26,1.5,-PI/2],
   ['painted_burl_coolamon_set',-2.6,.26,2.9,0],
   ['painted_woomera_dart_rack',2.6,.26,2.9,PI],
   ['generic_sack',-.95,V.yFloor,-3.4,0],
   ['generic_crate',.95,V.yFloor,-3.4,0],
   ['painted_bark_shield_stand',0,V.yFloor,-3.9,0]
  ]);
 }
});

/* 15. Round Danxia Scarp Eyrie Watchtower (36201) */
defBuilding({
 key:'pm_eyrie_watchtower',
 name:'Danxia Scarp Eyrie Beacon Watchtower',
 seed:36201,
 cls:'building',
 cut:true,
 w:8.4,d:8.8,h:9.6,
 front:{x:0,z:3.6,yaw:0},
 tags:{style:'alcove',wealth:'middle',types:['military','infrastructure'],role:'watchtower'},
 note:'battered cellular & cylindrical danxia sandstone cliff watchtower with keyhole door, notched Dogon ladder and rooftop signal brazier',
 build(){
  pmPlinth(6.8,6.8,.32,{stepW:2.0});
  /* Square-cellular ground guardroom (3.9 m viga span) + stepped upper beacon drum & walkable parapet deck */
  const G=pmAlcoveRoom(0,-.1,.32,4.1,4.1,3.1,{
   mk:'danxia',col:'danxia',socleMk:'danxiaCut',socleH:.9,
   s:[{x:0,w:1.08,h:2.02,kind:'door',leafMk:'juniper',name:'watchtower-door'}],
   e:[{x:0,y:1.5,w:.42,h:.75,kind:'win'}],
   w:[{x:0,y:1.5,w:.42,h:.75,kind:'win'}],
   parapetGaps:{s:[-1.15]}
  });
  const U=pmAlcoveRoom(0,-.25,G.yRoof,3.5,3.5,2.85,{
   mk:'plasterOchre',col:'plasterOchre',socleMk:'danxia',
   s:[{x:.2,w:1.0,h:1.92,kind:'door',leafMk:'curedBark',name:'watchtower-upper-door'}],
   parapetGaps:{s:[-1.0]}
  });
  pmDogonLadder(-1.15,.32,2.85,-1.15,G.yRoof,1.98);
  pmDogonLadder(-1.0,G.yRoof,2.22,-1.0,U.yRoof,1.52);

  pmHandStencilCluster(0,G.yRoof+1.35,1.51,0,1.25,.75,{count:2});
  pmPukamaniPole(2.55,.32,2.45,4.2,{feathers:10});
  smokeAt(0,U.yRoof+.55,-.25,{r:.32});

  pmTarget(0,G.yFloor,-.1,'watchtower-guardroom');
  pmTarget(0,U.yFloor,-.25,'watchtower-upper-cell');
  pmTarget(.35,U.yRoof,-.25,'watchtower-beacon-deck');

  pmFurnList([
   ['painted_woomera_dart_rack',-1.15,G.yFloor,-1.1,0],
   ['painted_bark_shield_stand',1.15,G.yFloor,-1.1,0],
   ['painted_pitch_tus_rack',1.2,G.yFloor,.6,-PI/2],
   ['painted_pronghorn_pelt_bed',-.8,U.yFloor,-.75,0],
   ['painted_sage_smudge_pit',.35,U.yRoof,-.25,0]
  ]);
 }
});

/* 16. Retractable-Ladder Cliff-Cleft Gatehouse (36202) */
defBuilding({
 key:'pm_ladder_gatehouse',
 name:'Retractable-Ladder Cliff-Cleft Gatehouse',
 seed:36202,
 cls:'building',
 cut:true,
 w:11.8,d:9.2,h:7.8,
 front:{x:0,z:3.8,yaw:0},
 tags:{style:'alcove',wealth:'middle',types:['military','infrastructure'],role:'gatehouse',job:'customs'},
 note:'fortified cleft bastion flanked by danxia guard towers with draw-up Dogon notched juniper ladders and overhanging bark-shield parapet',
 build(){
  pmPlinth(10.6,7.4,.3,{stepW:2.8});
  const LW=pmAlcoveRoom(-3.1,0,.3,3.8,4.4,3.15,{
   mk:'danxia',col:'danxia',socleMk:'danxiaCut',socleH:.85,
   s:[{x:.3,w:1.1,h:2.02,kind:'door',leafMk:'juniper',name:'gate-west-guard'}],
   e:[{x:0,w:1.04,h:1.98,kind:'door',open:true,transom:false}],
   parapetGaps:{s:[-.9]}
  });
  const RW=pmAlcoveRoom(3.1,-.12,.3,3.8,4.4,3.15,{
   mk:'danxiaBuff',col:'danxiaBuff',socleMk:'danxiaCut',socleH:.85,
   s:[{x:-.3,w:1.1,h:2.02,kind:'door',leafMk:'juniper',name:'gate-east-guard'}],
   w:[{x:0,w:1.04,h:1.98,kind:'door',open:true,transom:false}],
   parapetGaps:{s:[.9]}
  });
  /* Overhanging timber & bentonite bridge-loft spanning the 2.4 m cleft passage (<= 4.2 m viga span!) */
  pmRecordViga(2.6,6);
  box('paving',0,LW.yRoof-.14,-.05,2.6,.14,3.8,P('paving'));
  svNoWalk(()=>{
   for(let i=-2;i<=2;i++)pole('juniper',[-1.5,LW.yRoof-.22,i*.72],[1.5,LW.yRoof-.22,i*.72],.09,P('juniper'),8);
   box('danxia',0,LW.yRoof,1.72,2.52,.68,.24,P('danxia'));
  });
  /* Heavy cleft gate in central passage + twin notched Dogon assault/draw ladders */
  svLeaf(0,.32,1.65,0,1.95,2.35,{mk:'juniper',col:P('juniper'),style:'plank',name:'cleft-main-gate'});
  door(0,.3,1.65,0,2.05,2.4);

  pmDogonLadder(-4.0,.3,3.05,-4.0,LW.yRoof,2.22);
  pmRarrkPanel(0,LW.yRoof+.12,1.86,0,2.1,.52,{barkBoard:true,bg:'ochreRed'});
  pmHandStencilCluster(-3.1,1.6,2.21,0,1.3,.8,{count:2});
  pmHandStencilCluster(3.1,1.6,2.09,0,1.3,.8,{count:2});

  pmTarget(0,.3,0,'cleft-gate-passage');
  pmTarget(-3.1,LW.yFloor,0,'west-bastion-cell');
  pmTarget(3.1,RW.yFloor,-.12,'east-bastion-cell');
  pmTarget(0,LW.yRoof,-.05,'gatehouse-bridge-deck');

  pmFurnList([
   ['painted_woomera_dart_rack',-3.8,LW.yFloor,-1.1,PI/2],
   ['painted_bark_shield_stand',-2.4,LW.yFloor,-1.25,0],
   ['painted_woomera_dart_rack',3.8,RW.yFloor,-1.2,-PI/2],
   ['painted_pitch_tus_rack',2.4,RW.yFloor,-1.35,0],
   ['painted_dogon_notched_ladder',.65,LW.yRoof,-.5,0]
  ]);
 }
});

/* 17. Loophole Cliff-Ledge Parapet Wall (36203) */
defBuilding({
 key:'pm_ledge_parapet',
 name:'Danxia Loophole Cliff-Ledge Parapet',
 seed:36203,
 cls:'building',
 cut:false,
 w:11.6,d:6.4,h:4.8,
 front:{x:0,z:2.5,yaw:0},
 tags:{style:'alcove',wealth:'poor',types:['military','infrastructure'],role:'wall'},
 note:'crenellated tabular danxia & ochre-daub cliff-lip breastwork with raised firing step, dart loopholes and rarrk war-shields',
 build(){
  pmPlinth(10.6,4.8,.24,{stepW:2.2});
  /* Raised firing banquette at rear (-z) + crenellated loophole breastwork on +z leaving central sally port */
  box('paving',0,.24,-.75,9.8,.38,2.1,P('paving'));
  svStripWalk([0,.24,.85],[0,.62,.15],1.8);

  pmSegmentedWall(-2.95,.24,1.35,0,3.7,2.15,{
   mk:'plasterOchre',col:'plasterOchre',socleMk:'danxia',socleH:.75,
   openings:[{x:-.6,y:1.05,w:.32,h:.68,kind:'win'},{x:.7,y:1.05,w:.32,h:.68,kind:'win'}]
  });
  pmSegmentedWall(2.95,.24,1.35,0,3.7,2.15,{
   mk:'plasterOchre',col:'plasterOchre',socleMk:'danxia',socleH:.75,
   openings:[{x:-.7,y:1.05,w:.32,h:.68,kind:'win'},{x:.6,y:1.05,w:.32,h:.68,kind:'win'}]
  });
  svLeaf(0,.26,1.35,0,1.65,2.0,{mk:'juniper',col:P('juniper'),style:'plank',name:'parapet-sally-door'});
  door(0,.24,1.35,0,1.72,2.05);

  pmRarrkPanel(-2.95,1.15,1.57,0,1.35,.68,{barkBoard:true});
  pmRarrkPanel(2.95,1.15,1.57,0,1.35,.68,{barkBoard:true,bg:'celadoniteTeal'});
  pmPukamaniPole(-4.6,.62,-1.1,3.5,{feathers:8});
  pmPukamaniPole(4.6,.62,-1.1,3.5,{feathers:8});

  pmTarget(0,.62,-.75,'parapet-firing-step');

  pmFurnList([
   ['painted_woomera_dart_rack',-2.8,.62,-1.25,0],
   ['painted_bark_shield_stand',2.8,.62,-1.25,0],
   ['painted_pitch_tus_rack',0,.62,-1.45,0]
  ]);
 }
});

/* 18. Korona Wild-Silk Cliff Hoist & Winch Post (36204) */
defBuilding({
 key:'pm_silk_winch_post',
 name:'Korona Wild-Silk Cliff Cargo Winch Post',
 seed:36204,
 cls:'building',
 cut:true,
 w:9.6,d:8.8,h:7.6,
 front:{x:-2.2,z:3.9,yaw:0},
 tags:{style:'hung',wealth:'middle',types:['infrastructure','industry'],role:'hoist',job:'warehousing'},
 note:'socketed canyon-oak cliff landing over Korona Silkhead Gorge with twin braided wild-silk cargo winches and tally store',
 build(){
  const L=pmHungLedge(0,0,2.05,8.0,6.8,{cliffD:1.65,cliffH:6.6,ladderX:-2.2});
  const S=pmAlcoveRoom(1.35,.35,L.yDeck,3.9,3.6,2.6,{
   mk:'plasterOchre',col:'plasterOchre',socleMk:'danxiaCut',socleH:.24,
   s:[{x:-.45,w:1.12,h:1.98,kind:'door',leafMk:'curedBark',name:'winch-store-door'}],
   parapet:false
  });
  pmSilkWinch(-2.35,L.yDeck,2.25,0,1.5);
  pmSilkWinch(-0.85,L.yDeck,2.25,0,1.15);
  pmTrackRingMap(1.35,L.yDeck+1.3,2.16,0,.62,{flat:false});
  pmPukamaniPole(3.45,L.yDeck,2.65,3.4,{feathers:10});

  pmTarget(-2.2,L.yDeck,1.5,'winch-landing-deck');
  pmTarget(1.35,S.yFloor,.35,'winch-cargo-store');

  pmFurnList([
   ['painted_pitch_tus_rack',2.25,S.yFloor,-.55,-PI/2],
   ['generic_sack',.55,S.yFloor,-.75,0],
   ['generic_crate',1.45,S.yFloor,-.85,0],
   ['painted_burl_coolamon_set',2.1,S.yFloor,.85,-PI/2],
   ['job_bales',-2.65,L.yDeck,-.15,0]
  ]);
 }
});

/* 19. Overhang Songline Rock-Art Gallery & Drone-Pipe Shelter (36109) */
defBuilding({
 key:'pm_songline_gallery',
 name:'Overhang Songline Rock-Art Gallery and Drone-Pipe Shelter',
 seed:36109,
 cls:'building',
 cut:true,
 w:14.6,d:11.4,h:7.8,
 front:{x:1.6,z:4.5,yaw:0},
 tags:{style:'alcove',wealth:'middle',types:['religious','civic'],role:'gallery',job:'worship'},
 note:'cantilevered red danxia cliff-overhang sheltering a sweeping multi-panel Wandjina, X-ray pronghorn, concentric songline and Yanta-Rringka rock-art gallery with stone pigment-cup ledges and hollow drone-pipe racks',
 build(){
  pmPlinth(13.2,9.6,.3,{stepX:1.6,stepW:2.8});

  /* Cantilevered red & buff danxia cliff-overhang along rear (-z): vertical rock canvas face at z = -3.40 */
  svNoWalk(()=>{
   box('danxia',0,.3,-4.05,12.8,5.35,1.3,P('danxia'));
   box('danxiaBuff',0,5.65,-2.45,12.4,1.18,4.5,P('danxiaBuff'));
   box('badland',0,6.83,-2.65,11.6,.52,4.1,P('badland'));

   /* Carved stone pigment-cup ledge along gallery foot (z = -2.82, well clear of z = -3.40 cliff wall!) */
   box('danxiaCut',1.85,.31,-2.82,6.8,.32,.54,P('danxiaCut'));
   const cupSpecs=[
    [-1.05,'ochreRed','ochreRed'],[-.05,'celadoniteTeal','celadoniteTeal'],[.95,'pipeclay','pipeclay'],
    [1.95,'plasterOchre','rabbitGold'],[2.95,'ochreRed','orchil'],[3.95,'lignite','lignite']
   ];
   for(const [cx,mk,ck] of cupSpecs){
    cyl(mk,cx,.638,-2.82,.14,.055,P(ck),12);
   }
  });

  /* Multi-panel non-overlapping Arnhem rock-art frieze across z = -3.40 (stepped >= 1.8 cm forward!) */
  pmHandStencilCluster(-4.55,3.55,-3.4,0,1.9,1.0,{count:3});
  pmXrayBeastPanel(-1.65,1.35,-3.4,0,1.8,1.25,{beast:'pronghorn'});
  pmWandjinaBrow(.85,2.55,-3.4,0,2.4,1.65);
  pmTrackRingMap(.85,1.15,-3.4,0,.56,{flat:false});
  pmXrayBeastPanel(3.35,1.35,-3.4,0,1.8,1.25,{beast:'raptor'});
  pmRarrkPanel(5.25,1.45,-3.4,0,1.3,1.35,{bg:'celadoniteTeal'});

  /* Songline Keeper & Drone-Pipe Acoustic Chamber on SW wing (<= 4.1 m juniper viga span, z = -1.45..+2.65) */
  const K=pmAlcoveRoom(-4.25,.6,.3,4.0,4.1,2.75,{
   mk:'bentonite',col:'bentonite',socleMk:'danxiaCut',
   s:[{x:.2,w:1.14,h:2.02,kind:'door',leafMk:'curedBark',name:'gallery-keeper-door'}],
   e:[{x:0,w:1.08,h:1.98,kind:'door',open:true,transom:false}],
   parapetGaps:{s:[-1.05]}
  });
  pmDogonLadder(-5.3,.3,3.52,-5.3,K.yRoof,2.7);
  pmRarrkPanel(-4.25,1.45,2.66,0,1.55,.88,{bg:'ochreRed'});

  /* Flanking feathered Pukamani clan poles & drying paintbrush swags */
  pmPukamaniPole(-.85,.3,3.65,4.5,{feathers:12});
  pmPukamaniPole(4.75,.3,3.65,4.7,{feathers:12});
  pmHerbSwag(-.85,3.25,3.65,4.75,3.25,3.65,5);
  smokeAt(1.85,.78,.35,{r:.22});

  pmTarget(1.85,.3,.5,'songline-gallery-court');
  pmTarget(-4.25,K.yFloor,.6,'drone-pipe-chamber');
  pmTarget(-4.25,K.yRoof,.6,'gallery-viewing-roof');

  pmFurnList([
   ['painted_drone_pipe_rack',-4.25,K.yFloor,-.75,0],
   ['painted_drone_pipe_rack',-.65,.3,-1.65,PI/4],
   ['painted_sage_smudge_pit',1.85,.3,.35,0],
   ['painted_ochre_grinding_slab',4.25,.3,-1.45,-PI/4],
   ['painted_bark_shield_stand',-5.25,K.yFloor,.85,PI/2],
   ['painted_feather_diadem_perch',-3.25,K.yFloor,1.65,PI]
  ]);
 }
});
