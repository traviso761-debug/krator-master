// prefix: kl
// ================================================================= KULA-NA IKKI COVENANT-COMMUNES — WEIRS, DEPOTS & MILITIA GATES (8131..8135)
//   8131. kl_ikki_covered_weir   — Fortified Timber Weir-Bridge & Grain Stamp-Mill
//   8132. kl_ikki_pack_depot     — Upland Ore-Sled, Cooperage & Relay Mansio
//   8133. kl_ikki_drum_gate      — Twin Nickel-Hooped Militia Drum-Frustum Gate & Moat Span
//   8134. kl_ikki_pavise_armoury — Commoner Pike, Pavise-Shield & Repeating-Crossbow Arsenal
//   8135. kl_ikki_moat_bastion   — Battered White-Kura Wet-Moat Corner Bastion & Watch-Bell

/* 31. Fortified Timber Weir-Bridge and Grain Stamp-Mill */
defBuilding({
 key:'kl_ikki_covered_weir',
 name:'Fortified Timber Weir-Bridge and Grain Stamp-Mill',
 seed:8131,w:28,d:22,h:16.8,budget:114000,cut:true,
 front:{x:-8.6,z:9.4,yaw:0},
 tags:{style:'ikki',wealth:'middle',types:['infrastructure','market'],role:'weir-mill',job:'milling'},
 build(){
  const yQuay=.56,yBridge=3.8,hGal=3.3,yRoof=yBridge+hGal;

  /* Upland Tong-Ma weir channel [-4.0..4.0] + stone weir sill + undershot stamp-mill waterwheel! */
  klWaterChannel(0,0,8.0,19.6,.32,.8,{river:{name:'ikki-weir-stream',axis:'z',speed:.74}});
  klMillWheel(-3.4,1.48,4.8,0,1.95,.78);
  svNoWalk(()=>{
   box('sootstone',0,.01,1.6,7.4,.38,.72,P('sootstone'));
  });

  /* West & East stone quays + kura grain stamp-mill & sluice-gate piers + exterior stairs to covered weir-bridge */
  for(const s of [-1,1]){
   const qx=s*8.4;
   klFloorSlab(qx,yQuay,0,8.4,17.0,{mk:'paving',th:yQuay});
   klStair(qx,0,9.5,qx,yQuay,8.3,2.8,{mk:'sootstone',sideMk:'kura'});

   klWallRing(qx-2.9,-4.4,qx+2.9,3.2,yQuay,yBridge-yQuay-.22,{
    style:'ikki',register:'kura',
    holes:{
     s:[{at:qx-s*1.0,w:1.5,h:2.25,door:true,torana:false,leafMk:'darkcedar',name:s<0?'west-weir-mill-door':'east-weir-sluice-door'}],
     n:[{at:qx,w:1.1,h:1.25,y:1.0}]
    }
   });
   klCeilingSlab(qx,yBridge-.24,-.6,5.4,7.2,{mk:'darkcedar',trimMk:'cedar'});
   klStair(qx+s*1.8,yQuay,8.4,qx+s*1.8,yBridge,4.25,1.65,{mk:'sootstone',cheek:'timber',openUnder:true});
  }

  /* Covered dark-cedar & slate-roofed fortified weir-bridge gallery [-11.6..11.6, -4.3..4.3] */
  klFloorSlab(0,yBridge,0,23.4,8.6,{mk:'floor',th:.22});
  svNoWalk(()=>{
   for(const sz of [-3.8,3.8]){
    box('darkcedar',0,yBridge-.56,sz,10.6,.34,.32,P('darkcedar'));
    beam('darkcedar',[-5.2,yQuay+.8,sz],[-2.0,yBridge-.56,sz],.2,P('darkcedar'));
    beam('darkcedar',[5.2,yQuay+.8,sz],[2.0,yBridge-.56,sz],.2,P('darkcedar'));
   }
  });
  klTimberColonnade(-11.0,4.05,11.0,4.05,yBridge,hGal,{style:'ikki',n:8,trimMk:'nickel'});
  klTimberColonnade(11.0,-4.05,-11.0,-4.05,yBridge,hGal,{style:'ikki',n:8,trimMk:'nickel'});
  klParapet(-8.2,4.15,8.2,4.15,yBridge,{kind:'timber'});
  klParapet(10.8,-4.15,-10.8,-4.15,yBridge,{kind:'timber'});

  klNewarRoof(0,yRoof,0,23.8,9.2,2,{
   style:'ikki',mode:'hip',mk:'slate',over:.72,tierRise:1.18
  });

  klTarget(-8.4,yQuay,-.6,'west-grain-stamp-mill',true);
  klTarget(8.4,yQuay,-.6,'east-sluice-guardroom',true);
  klTarget(0,yBridge,0,'covered-weir-passage',true);

  klFurnList([
   ['kulanewa_grain_bin',-8.4,yQuay,-2.4,0],
   ['kulanewa_grain_bin',-7.0,yQuay,-2.4,0],
   ['kulanewa_pavise_rack',8.4,yQuay,-2.4,0],
   ['kulanewa_mujinzo_chest',-3.4,yBridge,-2.2,0],
   ['kulanewa_covenant_bell_stand',0,yBridge,-2.2,0],
   ['kulanewa_pavise_rack',3.6,yBridge,-2.2,0],
   ['kulanewa_oil_cresset',-6.0,yBridge,0,0],
   ['kulanewa_oil_cresset',6.0,yBridge,0,0]
  ]);
 }
});

/* 32. Upland Ore-Sled, Cooperage and Relay Mansio */
defBuilding({
 key:'kl_ikki_pack_depot',
 name:'Upland Ore-Sled, Cooperage and Relay Mansio',
 seed:8132,w:26,d:22,h:15.2,budget:106000,cut:true,
 front:{x:0,z:9.8,yaw:0},
 tags:{style:'ikki',wealth:'middle',types:['infrastructure','inn'],role:'relay-depot',job:'warehousing'},
 build(){
  const y1=.48,h1=3.55,y2=y1+h1,h2=3.15,yRoof=y2+h2;
  klFloorSlab(0,y1,0,22.6,18.6,{mk:'cobble',th:y1});
  klStair(0,0,9.9,0,y1,8.8,3.2,{mk:'sootstone',sideMk:'kura'});

  /* White-kura relay yard wall + wide timber ore-sled gate */
  klToranaDoor(0,y1,8.7,0,2.35,2.55,{register:'kura',torana:false,leafMk:'darkcedar',name:'depot-relay-gate'});
  for(const s of [-1,1]){
   klWall(s<0?-10.8:1.6,8.7,s<0?-1.6:10.8,8.7,y1,2.55,{style:'ikki',register:'kura'});
   klParapet(s<0?-10.8:1.6,8.7,s<0?-1.6:10.8,8.7,y1+2.55,{kind:'kura',h:.48,capMk:'slate'});
  }
  klWall(10.8,8.4,10.8,1.6,y1,2.55,{style:'ikki',register:'kura'});
  klWall(-10.8,1.6,-10.8,8.4,y1,2.55,{style:'ikki',register:'kura'});

  /* Rear Two-Storey Cooperage, Ore-Store & Relay Bunkhouse [-10.6..10.6, -8.8..1.4] */
  klTimberColonnade(-9.8,2.4,9.8,2.4,y1,h1,{style:'ikki',n:7,skipMid:1.8,trimMk:'iron'});
  klCeilingSlab(0,y2-.24,1.8,20.4,1.6,{mk:'darkcedar',trimMk:'cedar'});

  klWallRing(-10.6,-8.8,10.6,1.4,y1,h1,{
   style:'ikki',register:'kura',udatsu:'ew',udatsuD:1.25,
   holes:{
    s:[
     {at:-5.8,w:1.55,h:2.25,door:true,torana:false,leafMk:'darkcedar',name:'depot-cooperage-door'},
     {at:0,w:1.8,h:2.4,door:true,torana:true,leafMk:'darkcedar',name:'depot-relay-hall-door'},
     {at:5.8,w:1.55,h:2.25,door:true,torana:false,leafMk:'iron',name:'depot-ore-vault-door'}
    ],
    n:[{at:-5.4,w:1.2,h:1.25,y:1.05},{at:0,w:1.2,h:1.25,y:1.05},{at:5.4,w:1.2,h:1.25,y:1.05}]
   }
  });

  const st=klInteriorStair(7.6,-5.6,y1,y2,0,{w:1.2,riser:.18,going:.27,mk:'darkcedar',smk:'iron',col:P('darkcedar'),scol:P('iron'),rail:'both'});
  klFloorSlab(0,y2,-3.7,20.6,9.8,{mk:'floor',th:.18,hole:st});
  klCeilingSlab(-2.2,y2-.28,-3.7,15.8,9.2,{mk:'darkcedar',trimMk:'cedar'});

  klWallRing(-10.3,-8.6,10.3,1.2,y2,h2,{
   style:'ikki',register:'timber',mk:'kilnbrick',
   holes:{
    s:[{at:-6.0,w:1.4,h:1.35,y:.95,flat:true},{at:-2.0,w:1.4,h:1.35,y:.95,flat:true},{at:2.0,w:1.4,h:1.35,y:.95,flat:true},{at:6.0,w:1.4,h:1.35,y:.95,flat:true}],
    n:[{at:-4.8,w:1.35,h:1.35,y:.95,flat:true},{at:4.8,w:1.35,h:1.35,y:.95,flat:true}]
   }
  });
  klNewarRoof(0,yRoof,-3.7,21.2,10.4,2,{
   style:'ikki',mode:'gable',gableAxis:'x',mk:'shingle',over:.7,tierRise:1.2
  });

  klTarget(-3.6,y1,5.2,'ore-sled-relay-yard',false);
  klTarget(-1.8,y1,-3.7,'cooperage-and-mansio-hall',true);
  klTarget(-2.2,y2,-3.7,'teamster-bunk-loft',true);

  klFurnList([
   ['kulanewa_grain_bin',-7.6,y1,-6.0,0],
   ['kulanewa_grain_bin',-5.2,y1,-6.0,0],
   ['kulanewa_tea_samovar',0,y1,-4.0,0],
   ['kulanewa_cedar_settle',0,y1,-2.0,PI],
   ['kulanewa_mujinzo_chest',5.6,y1,-6.0,0],
   ['kulanewa_trundle_bunk',-7.2,y2,-6.0,0],
   ['kulanewa_trundle_bunk',-2.8,y2,-6.0,0],
   ['kulanewa_syndicate_brazier',3.8,y1,5.2,0]
  ]);
 }
});

/* 33. Twin Nickel-Hooped Militia Drum-Frustum Gate and Moat Span */
defBuilding({
 key:'kl_ikki_drum_gate',
 name:'Twin Nickel-Hooped Militia Drum-Frustum Gate and Moat Span',
 seed:8133,w:30,d:22,h:19.6,budget:122000,cut:true,
 front:{x:0,z:10.2,yaw:0},
 tags:{style:'ikki',wealth:'middle',types:['military','infrastructure'],role:'drum-gate',job:'customs'},
 build(){
  const y1=.68,h1=3.8,y2=y1+h1,h2=3.25,yRoof=y2+h2;

  /* Front Jinaimachi wet moat [-13.6..13.6, 6.2..9.6] spanned by fortified timber moat-bridge */
  klWaterChannel(0,7.9,27.2,3.4,.3,.74,{river:{name:'ikki-drumgate-moat',axis:'x',speed:.36}});
  klTimberBridge(0,10.0,0,5.6,0,y1,3.2,{rails:true});
  klFloorSlab(0,y1,-1.8,25.6,15.2,{mk:'paving',th:y1});

  /* Twin Inhabited Arch-Nickel & Black-Iron-Hooped Slatted-Cedar Militia Drum-Frustums at (-9.6, .6) & (+9.6, .6)! */
  for(const sx of [-9.6,9.6]){
   klHoopedFrustum(sx,.6,3.2,2.1,y1,14.8,{
    hoops:5,midY:y2,
    opens:[
     {a:sx<0?0:PI,y:0,w:1.45,h:2.2,door:true,name:sx<0?'west-gate-drum-door':'east-gate-drum-door'},
     {a:sx<0?0:PI,y:y2-y1,w:1.5,h:2.2,door:true,open:true},
     {a:PI/2,y:3.4,w:.9,h:1.15},
     {a:-PI/2,y:8.2,w:.9,h:1.15}
    ]
   });
  }

  /* Central Two-Storey Kura & Dark-Cedar Gatehouse [-4.8..4.8, -4.4..4.6] + Sky-Walks into BOTH Drum-Frustums! */
  klWallRing(-4.8,-4.4,4.8,4.6,y1,h1,{
   style:'ikki',register:'kura',
   holes:{
    s:[{at:0,w:2.3,h:2.65,door:true,torana:true,leafMk:'iron',name:'drum-gate-front-portal'}],
    n:[{at:0,w:2.1,h:2.5,door:true,torana:false,leafMk:'darkcedar',name:'drum-gate-rear-portal'}],
    e:[{at:.1,w:1.4,h:2.2,door:true,torana:false,leafMk:'darkcedar',name:'drum-gate-east-yard-door'}],
    w:[{at:.1,w:1.4,h:2.2,door:true,torana:false,leafMk:'darkcedar',name:'drum-gate-west-yard-door'}]
   }
  });
  /* Exterior rear rampart stair climbing in clear air y1 (z=-8.8) -> north edge of y2 (z=-4.7) */
  klStair(3.6,y1,-8.8,3.6,y2,-4.7,1.7,{mk:'sootstone',cheek:'timber',openUnder:true});
  klFloorSlab(0,y2,-.2,10.2,9.8,{mk:'floor',th:.18});
  klCeilingSlab(0,y2-.26,.1,8.8,8.4,{mk:'darkcedar',trimMk:'cedar'});

  klWallRing(-4.6,-3.4,4.6,4.2,y2,h2,{
   style:'ikki',register:'brick',dadoMk:'celadon',
   holes:{
    e:[{at:.6,w:1.5,h:2.2,door:true,open:true}],
    w:[{at:.6,w:1.5,h:2.2,door:true,open:true}],
    n:[{at:3.2,w:1.45,h:2.2,door:true,torana:false,leafMk:'darkcedar',name:'drum-gate-rampart-door'},{at:-1.8,w:1.35,h:1.35,y:.95}],
    s:[{at:-2.2,w:1.4,h:1.4,y:.95},{at:2.2,w:1.4,h:1.4,y:.95}]
   }
  });
  klSkywalk(-4.6,.6,-7.7,.6,y2,1.85);
  klSkywalk(4.6,.6,7.7,.6,y2,1.85);

  klNewarRoof(0,yRoof,.4,10.0,8.4,2,{
   style:'ikki',mode:'hip',mk:'slate',over:.72,tierRise:1.18,cupola:true,cupolaR:1.9,cupolaH:3.5
  });

  klTarget(0,y1,.1,'gatehouse-passage-vault',true);
  klTarget(0,y2,.4,'upper-portcullis-watchroom',true);
  klTarget(-9.6,y1,.6,'west-drum-guardroom',true);
  klTarget(9.6,y1,.6,'east-drum-guardroom',true);
  klTarget(-9.6,y2,.6,'west-militia-drum-deck',true);
  klTarget(9.6,y2,.6,'east-militia-drum-deck',true);

  klFurnList([
   ['kulanewa_pavise_rack',-3.0,y1,-2.6,0],
   ['kulanewa_pavise_rack',3.0,y1,-2.6,0],
   ['kulanewa_pavise_rack',-2.4,y2,-1.8,0],
   ['kulanewa_covenant_bell_stand',2.2,y2,2.2,PI],
   ['kulanewa_mujinzo_chest',-9.6,y1,-.8,0],
   ['kulanewa_mujinzo_chest',9.6,y1,-.8,0],
   ['kulanewa_syndicate_brazier',-9.6,y2,1.6,0],
   ['kulanewa_syndicate_brazier',9.6,y2,1.6,0]
  ]);
 }
});

/* 34. Commoner Pike, Pavise-Shield and Repeating-Crossbow Arsenal */
defBuilding({
 key:'kl_ikki_pavise_armoury',
 name:'Commoner Pike, Pavise-Shield and Repeating-Crossbow Arsenal',
 seed:8134,w:24,d:20,h:17.4,budget:104000,cut:true,
 front:{x:0,z:8.8,yaw:0},
 tags:{style:'ikki',wealth:'middle',types:['military','industry'],role:'armoury',job:'smithing'},
 build(){
  const y1=.74,h1=3.75,y2=y1+h1,h2=3.3,yRoof=y2+h2;
  klKuraPlinth(20.0,16.0,y1,{stepW:3.4,stepRun:1.55,socMk:'sootstone'});

  klBanner(-9.0,y1,7.4,0,3.1,'silkSaffron');
  klBanner(9.0,y1,7.4,0,3.1,'silkIndigo');

  /* Battered white-kura parish arsenal [-9.0..9.0, -7.2..5.8] with 4 corner slate udatsu wings */
  klWallRing(-9.0,-7.2,9.0,5.8,y1,h1,{
   style:'ikki',register:'kura',udatsu:'all',udatsuD:1.25,
   holes:{
    s:[
     {at:0,w:1.95,h:2.45,door:true,torana:true,leafMk:'iron',name:'armoury-iron-door'},
     {at:-5.2,w:1.15,h:1.25,y:1.15},
     {at:5.2,w:1.15,h:1.25,y:1.15}
    ],
    n:[{at:-4.6,w:1.15,h:1.25,y:1.15},{at:4.6,w:1.15,h:1.25,y:1.15}]
   }
  });

  const st=klInteriorStair(6.0,-4.0,y1,y2,0,{w:1.2,riser:.18,going:.27,mk:'darkcedar',smk:'iron',col:P('darkcedar'),scol:P('iron'),rail:'both'});
  klFloorSlab(0,y2,-.7,17.6,12.6,{mk:'floor',th:.18,hole:st});
  klCeilingSlab(-2.0,y2-.28,-.7,13.0,12.0,{mk:'darkcedar',trimMk:'cedar'});

  klWallRing(-8.8,-7.0,8.8,5.6,y2,h2,{
   style:'ikki',register:'brick',dadoMk:'celadon',
   holes:{
    s:[{at:-4.8,w:1.45,h:1.4,y:.95},{at:0,w:1.6,h:1.45,y:.95},{at:4.8,w:1.45,h:1.4,y:.95}],
    e:[{at:-.7,w:1.4,h:1.4,y:.95}],
    w:[{at:-.7,w:1.4,h:1.4,y:.95}],
    n:[{at:-4.2,w:1.4,h:1.4,y:.95},{at:4.2,w:1.4,h:1.4,y:.95}]
   }
  });
  klNewarRoof(0,yRoof,-.7,18.2,13.2,2,{
   style:'ikki',mode:'hip',mk:'slate',over:.74,tierRise:1.22,cupola:true,cupolaR:2.0,cupolaH:3.6
  });

  klTarget(-1.8,y1,-.7,'pike-and-pavise-vault',true);
  klTarget(-2.0,y2,-.7,'crossbow-stringing-loft',true);

  klFurnList([
   ['kulanewa_pavise_rack',-5.8,y1,-4.8,0],
   ['kulanewa_pavise_rack',-2.2,y1,-4.8,0],
   ['kulanewa_pavise_rack',1.4,y1,-4.8,0],
   ['kulanewa_trip_anvil',-4.2,y1,2.2,0],
   ['kulanewa_naruqqum_table',-2.4,y2,-1.6,0],
   ['kulanewa_pavise_rack',-5.6,y2,-4.6,0],
   ['kulanewa_mujinzo_chest',1.6,y2,-4.6,0]
  ]);
 }
});

/* 35. Battered White-Kura Wet-Moat Corner Bastion and Watch-Bell */
defBuilding({
 key:'kl_ikki_moat_bastion',
 name:'Battered White-Kura Wet-Moat Corner Bastion and Watch-Bell',
 seed:8135,w:24,d:22,h:18.8,budget:102000,cut:true,
 front:{x:3.2,z:9.8,yaw:0},
 tags:{style:'ikki',wealth:'middle',types:['military'],role:'bastion'},
 build(){
  const y1=.76,h1=3.7,yRoof=y1+h1;

  /* Front wet-moat channel [-10.4..10.4, 6.2..9.4] spanned by timber sally-bridge at x = +3.2 */
  klWaterChannel(0,7.8,20.8,3.2,.3,.72,{river:{name:'ikki-bastion-moat',axis:'x',speed:.32}});
  klTimberBridge(3.2,9.8,3.2,5.6,0,y1,2.8,{rails:true});

  /* Battered white-kura corner bastion platform [-9.6..9.6, -8.8..5.8] */
  klFloorSlab(0,y1,-1.5,19.2,14.6,{mk:'paving',th:y1});
  klParapet(-9.4,5.6,1.2,5.6,y1,{kind:'kura',h:.95,capMk:'slate'});
  klParapet(5.2,5.6,9.4,5.6,y1,{kind:'kura',h:.95,capMk:'slate'});
  klParapet(-9.4,-8.6,-9.4,5.3,y1,{kind:'kura',h:.95,capMk:'slate'});

  /* SW Inhabited Arch-Nickel & Black-Iron-Hooped Militia Watch-Frustum (-5.4, .8) */
  klHoopedFrustum(-5.4,.8,3.2,2.1,y1,14.2,{
   hoops:5,
   opens:[
    {a:0,y:0,w:1.45,h:2.2,door:true,name:'bastion-frustum-door'},
    {a:PI/2,y:3.6,w:.9,h:1.15},
    {a:-PI/2,y:8.0,w:.9,h:1.15}
   ]
  });

  /* NE Kura & Slate-Roofed Garrison Casemate + Watch-Bell Cupola [.4..9.0, -8.2..2.2] */
  klWallRing(.4,-8.2,9.0,2.2,y1,h1,{
   style:'ikki',register:'kura',udatsu:'ew',udatsuD:1.2,
   holes:{
    s:[{at:4.7,w:1.65,h:2.3,door:true,torana:true,leafMk:'iron',name:'bastion-casemate-door'}],
    w:[{at:-3.0,w:1.4,h:2.2,door:true,torana:false,leafMk:'darkcedar',name:'bastion-court-door'}],
    n:[{at:4.7,w:1.15,h:1.25,y:1.1}]
   }
  });
  klNewarRoof(4.7,yRoof,-3.0,9.2,11.0,2,{
   style:'ikki',mode:'hip',mk:'slate',over:.68,tierRise:1.16,cupola:true,cupolaR:1.85,cupolaH:3.4
  });

  klTarget(3.2,y1,3.8,'bastion-muster-terrace',false);
  klTarget(-5.4,y1,.8,'corner-frustum-watchroom',true);
  klTarget(4.7,y1,-3.0,'bastion-militia-casemate',true);

  klFurnList([
   ['kulanewa_pavise_rack',2.8,y1,-6.0,0],
   ['kulanewa_pavise_rack',6.4,y1,-6.0,0],
   ['kulanewa_trundle_bunk',6.8,y1,-2.2,-PI/2],
   ['kulanewa_mujinzo_chest',-5.4,y1,-.6,0],
   ['kulanewa_covenant_bell_stand',-5.4,y1,2.0,PI],
   ['kulanewa_syndicate_brazier',.4,y1,3.8,0]
  ]);
 }
});
