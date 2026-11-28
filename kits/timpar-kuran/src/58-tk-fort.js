// prefix: tk
// ================================================================= CHASI-NOOW RIDGE FORTS & RAIDING INFRASTRUCTURE (PLAN.md §3.4, seeds 35201..35206)
// Six defensive & predatory clan fortifications:
//   35201 tk_chasi_noow_fort       Double-walled red-cypress log-crib promontory fort w/ walkable catwalk, WATER.still cistern & loot heads
//   35202 tk_trophy_stockade_gate  Heavy log-crib gorge gatehouse w/ overhead fighting gallery, open-eyed visors & inverted Eternian heads
//   35203 tk_rockfall_trap_crib    Mist-pass ambush log-crib tower suspending a megabreccia boulder-deadfall cradle over the trail
//   35204 tk_raid_mustering_ground War-band mustering hall & drill court w/ carved hollow-log war drum, slat-armour & visor posts
//   35205 tk_ransom_stockade       Palisaded captive compound holding lowland hostages for Eternian silver & steel ransom
//   35206 tk_signal_pyre_tower     Four-post cedar ridge lookout & resin signal-pyre beacon w/ walkable upper deck & warning drum

/* 17. Chasi-Noow Log-Crib Promontory Fort (with walkable catwalk & WATER.still spring cistern!) */
defBuilding({key:'tk_chasi_noow_fort',name:'Chasi-Noow Log-Crib Ridge Fort',seed:35201,cut:true,
 w:22.4,d:20.6,h:9.8,budget:170000,
 tags:{types:['military','civic'],style:'crest',role:'fort'},
 note:'battered megabreccia rampart topped by a notched Tlingit red-cypress log-crib palisade, corner bastions, walkable catwalk, spring cistern & Eternian trophies',
 build(){
  const G=.48,FW=18.8,FD=16.8,WH=4.1;
  pushM(TF(0,0,-.6));
  tkPlinth(FW+1.2,FD+1.2,G,{baseMk:'megabreccia',midMk:'megabreccia',topMk:'cobble',stepW:3.2,stepX:0});
  /* Perimeter log-crib ramparts (front +z split around 2.2 m sally-port gate) */
  tkLogCribWall(-FW/2,-FD/2,FW/2,-FD/2,G,WH);
  tkLogCribWall(-FW/2,-FD/2,-FW/2,FD/2,G,WH);
  tkLogCribWall(FW/2,-FD/2,FW/2,FD/2,G,WH);
  tkLogCribWall(-FW/2,FD/2,-1.35,FD/2,G,WH);
  tkLogCribWall(1.35,FD/2,FW/2,FD/2,G,WH);
  /* Heavy sally-port gate lintel, operable KDOOR plank gate, open-eyed war-visor & inverted Eternian trophy heads! */
  svNoWalk(()=>{
   box('cypress',0,G+2.36,FD/2,3.1,WH-2.36,.64,hc(SVPAL.cypress[0]));
   for(const sx of [-1,1])for(const sz of [-1,1]){
    box('cypress',sx*(FW/2+.18),G,sz*(FD/2+.18),1.45,WH+.55,1.45,hc(SVPAL.cypressD[0]));
   }
  });
  tkDoor(0,G,FD/2,0,2.1,2.28,{inau:false,visor:true,crest:'wurup'});
  for(const sx of [-2.4,2.4]){
   tkLootHead(sx,G+3.1,FD/2+.42,0,.5,{mk:sx<0?'bronze':'stone',inverted:true,warPaint:true});
  }
  /* Interior walkable fighting catwalk along north (-z) rampart at y = G + 2.45 m, climbed by svStair! */
  const catY=G+2.45;
  box('cedar',0,catY-.16,-FD/2+1.25,FW-1.8,.16,1.65,hc(SVPAL.cedar[0]));
  svStair(-FW/2+2.2,-FD/2+2.3,G,catY,PI/2,{w:1.1,run:3.2,mk:'cypress',col:hc(SVPAL.cypress[0]),rail:'right'});
  /* Inner garrison plank lodge on west side of bailey */
  pushM(TF(-3.8,0,-.6));
  tkPlankBox(7.8,7.4,G,3.1,{
   mk:'cypress',socle:.38,postR:.24,
   holes:{s:[{x:0,y:0,w:1.68,h:2.18}],e:[{x:0,y:.95,w:1.0,h:.92}]}
  });
  tkDoor(0,G,3.7-.17,0,1.24,2.04,{inau:true});
  tkWindow(3.9-.17,G+.95,0,PI/2,.82,.8,{lit:true});
  tkFormlineScreen(0,G+2.26,3.71,0,7.0,.74,{crest:'wurup'});
  tkPlankRoof(7.8,7.4,G+3.1,1.95,{mk:'shingle',cobbles:true,smokeShutter:true,kaenFinials:false});
  popM();
  /* Stone-kerbed rainforest spring cistern on east side of bailey (WATER.still!) */
  const cx=4.8,cz=1.2,cw=3.8,cd=4.2,rimH=.44;
  svNoWalk(()=>{
   for(const sz of [-1,1])box('megabreccia',cx,G,cz+sz*(cd/2-.22),cw,rimH,.44,hc(SVPAL.megabreccia[0]));
   for(const sx of [-1,1])box('megabreccia',cx+sx*(cw/2-.22),G,cz,.44,rimH,cd-.88,hc(SVPAL.megabreccia[1]));
   box('cobble',cx,G,cz,cw-.88,.08,cd-.88,hc(SVPAL.cobble[0]));
  });
  tkWindBanner(5.2,catY,-FD/2+1.1,0,1.6,2.2,{mk:'chilkat'});
  tkFurnList([
   ['timpar_irori_kaen_hearth',-3.8,G,-.8,0],
   ['timpar_slat_cuirass_stand',-6.2,G,-2.8,PI/2],
   ['timpar_visor_war_helm',-1.4,G,-2.8,-PI/2],
   ['timpar_eternian_trophy_rack',4.8,G,-4.4,0],
   ['painted_trade_weapon_rack',1.8,G,-4.4,0],
   ['timpar_kanopi_alloy_lamp',1.6,G,3.6,0],
   ['generic_barrel',6.8,G,-2.2,0]
  ]);
  tkTarget(0,G,2.8,'fort-bailey');
  tkTarget(-3.8,G,-.6,'fort-garrison-lodge');
  tkTarget(1.5,catY,-FD/2+1.25,'fort-rampart-catwalk');
  if(CURREC&&!PLACE_DRY){
   const c0=new THREE.Vector3(cx-1.42,G+rimH-.1,cz-1.62).applyMatrix4(CM);
   const c1=new THREE.Vector3(cx+1.42,G+rimH-.1,cz+1.62).applyMatrix4(CM);
   const x0=Math.min(c0.x,c1.x),x1=Math.max(c0.x,c1.x),z0=Math.min(c0.z,c1.z),z1=Math.max(c0.z,c1.z);
   (CURREC.stills=CURREC.stills||[]).push({
    name:CURREC.key+'-cistern',level:c0.y,bounds:[x0,z0,x1,z1],
    poly:[[x0,z0],[x1,z0],[x1,z1],[x0,z1]],color:0x194a4c
   });
  }
  popM();
 }});

/* 18. Stockade Gatehouse w/ Captured Eternian Trophy Heads */
defBuilding({key:'tk_trophy_stockade_gate',name:'Chasi Trophy Stockade Gatehouse',seed:35202,cut:true,
 w:16.4,d:11.8,h:9.4,budget:110000,
 tags:{types:['military','infrastructure'],style:'crest',role:'gate',job:'customs'},
 note:'log-crib Veilpass toll and war-gate crowned by an enclosed fighting gallery, fierce open-eyed beast visors and inverted Eternian war-loot heads',
 build(){
  const G=.38,W=14.4,D=7.6;
  pushM(TF(0,0,-.4));
  tkPlinth(W+.8,D+.8,G,{stepW:3.4,stepX:0});
  /* Left (-4.4) and right (+4.4) log-crib gate bastions + central through-passage */
  for(const sx of [-4.4,4.4]){
   pushM(TF(sx,0,0));
   tkPlankBox(4.8,6.4,G,3.45,{
    mk:'cypress',socle:.48,postR:.26,
    holes:{
     s:[{x:0,y:1.1,w:.92,h:.86}],
     e:sx<0?[{x:0,y:0,w:1.48,h:2.1}]:[],
     w:sx>0?[{x:0,y:0,w:1.48,h:2.1}]:[]
    }
   });
   tkWindow(0,G+1.1,3.2-.17,0,.72,.72,{lit:true});
   tkDoor(sx<0?2.4-.17:-2.4+.17,G,0,sx<0?PI/2:-PI/2,1.12,1.96,{inau:false});
   popM();
  }
  /* Front (+z) operable split gate across the 3.8 m central passage (rear -z left open to pass through) */
  tkPlankWall(-2.0,3.0,2.0,3.0,G,3.45,{mk:'cypress',socle:0,holes:[{at:2.0,y:0,w:2.35,h:2.45}]});
  tkDoor(0,G,3.0,0,2.1,2.3,{inau:true,visor:true,crest:'wurup'});
  /* Upper walkable fighting gallery bridging across the entire gate at galY = G + 3.61 m! */
  const galY=G+3.61;
  const SF=svStair(-4.4,-1.8,G,galY,0,{w:.96,run:2.9,mk:'cypress',col:hc(SVPAL.cypress[0])});
  svWell('cedar',0,galY-.16,0,W-.6,.16,5.8,hc(SVPAL.cedar[0]),SF);
  /* Gallery breastwork + pitched cedar shake roof */
  svNoWalk(()=>{
   for(const sz of [-2.8,2.8])box('cypress',0,galY,sz,W-.4,1.15,.26,hc(SVPAL.cypressD[0]));
   for(const sx of [-W/2+.3,W/2-.3])box('cypress',sx,galY,0,.26,1.15,5.4,hc(SVPAL.cypressD[0]));
   for(const sx of [-6.2,0,6.2])for(const sz of [-2.7,2.7])cyl('totem',sx,galY+1.15,sz,.22,1.55,hc(SVPAL.totem[0]),10);
  });
  tkFormlineScreen(0,galY+.12,2.94,0,8.6,.95,{crest:'wurup'});
  tkPlankRoof(W-.2,5.8,galY+2.7,1.85,{mk:'shingle',cobbles:true,smokeShutter:false,kaenFinials:true});
  /* Four captured Eternian closed-eyed bronze/terracotta/stone trophy heads along gate front vs open-eyed visors! */
  for(const [sx,mk] of [[-5.2,'bronze'],[-3.4,'terracotta'],[3.4,'stone'],[5.2,'bronze']]){
   tkLootHead(sx,G+2.55,3.55,0,.46,{mk,inverted:true,warPaint:true});
  }
  tkWarVisor(-4.4,galY+1.75,3.05,0,.48,{crest:'kuma'});
  tkWarVisor(4.4,galY+1.75,3.05,0,.48,{crest:'kapac'});
  tkFurnList([
   ['timpar_slat_cuirass_stand',-4.4,G,-1.8,0],
   ['timpar_eternian_trophy_rack',4.4,G,-1.8,0],
   ['painted_trade_weapon_rack',4.4,G,1.6,PI],
   ['timpar_kanopi_alloy_lamp',-1.4,galY,1.4,0],
   ['timpar_visor_war_helm',1.8,galY,-1.4,0],
   ['timpar_attus_bale_bench',4.4,galY,0,-PI/2]
  ]);
  tkTarget(0,G,.5,'gate-passage');
  tkTarget(4.4,G,0,'east-guardroom');
  tkTarget(1.8,galY,0,'gate-fighting-gallery');
  popM();
 }});

/* 19. Gorge-Pass Rockfall Trap-Crib (suspended megabreccia boulder-deadfall cradle!) */
defBuilding({key:'tk_rockfall_trap_crib',name:'Gorge-Pass Megabreccia Deadfall Trap-Crib',seed:35203,cut:true,
 w:14.6,d:12.4,h:9.6,budget:95000,
 tags:{types:['military','infrastructure'],style:'jomon',role:'ambush'},
 note:'notched log-crib cliff-spur ambush post cantilevering a spruce-root trigger cradle loaded with angular megabreccia deadfall boulders over the pass',
 build(){
  const G=.38;
  pushM(TF(0,0,-.35));
  tkPlinth(12.6,9.8,G,{stepW:2.4,stepX:-2.6});
  /* West log-crib trigger guardhouse */
  pushM(TF(-2.6,0,-.4));
  tkPlankBox(6.4,6.6,G,3.05,{
   mk:'cypress',socle:.46,postR:.24,
   holes:{s:[{x:0,y:0,w:1.6,h:2.12}],e:[{x:0,y:.96,w:.95,h:.88}]}
  });
  tkDoor(0,G,3.3-.17,0,1.18,1.98,{inau:true,visor:true,crest:'wurup'});
  tkWindow(3.2-.17,G+.96,0,PI/2,.78,.74,{lit:true});
  tkCiseRoof(6.4,6.6,G+3.05,2.05,{courses:5,crownR:.3,crownH:.54});
  popM();
  /* East cantilevered log-crib gantry & suspended megabreccia boulder-deadfall cradle at y = G + 4.35 m! */
  svNoWalk(()=>{
   const gx=3.4;
   for(const sx of [-1.6,1.6])for(const sz of [-1.8,1.8]){
    box('megabreccia',gx+sx,G,sz,.72,.52,.72,hc(SVPAL.megabreccia[0]));
    cyl('cypress',gx+sx,G+.52,sz,.22,5.35,hc(SVPAL.cypressD[0]),10);
   }
   /* Twin heavy cantilever beams & spruce-root trigger ropes suspending boulder cradle */
   for(const sx of [-1.45,1.45])box('cypress',gx+sx,G+5.65,.35,.28,.32,4.8,hc(SVPAL.cypress[0]));
   box('cypress',gx,G+5.97,2.1,3.4,.22,.28,hc(SVPAL.cypressD[0]));
   for(const sx of [-1.2,1.2])for(const sz of [.6,2.3]){
    pole('rope',[gx+sx,G+5.65,sz],[gx+sx,G+4.15,sz],.032,hc(SVPAL.rope[0]),6);
   }
   /* Tilted deadfall log tray heaped with jagged impact-megabreccia boulders */
   box('tarwood',gx,G+3.98,1.45,2.85,.18,2.25,hc(SVPAL.tarwood[0]),0,.12,0);
   for(const [bx,by,bz,br] of [[-.65,4.35,1.1,.46],[.55,4.38,1.2,.48],[0,4.52,1.85,.52],[-.5,4.3,1.9,.38],[.6,4.32,1.95,.4]]){
    ellip('megabreccia',gx+bx,G+by,bz,br,br*.78,br*.88,hc(SVPAL.megabreccia[1]),.4,8);
   }
   /* Trip-lever capstan post on deck */
   cyl('totem',1.0,G,1.8,.18,1.15,hc(SVPAL.totem[0]),10);
   box('cypress',1.0,G+.95,1.8,1.25,.1,.12,hc(SVPAL.cypress[0]),.4);
  });
  tkWindBanner(5.2,G,3.8,-.2,1.35,2.0,{mk:'attus'});
  tkFurnList([
   ['timpar_irori_kaen_hearth',-2.6,G,-.6,0],
   ['timpar_slat_cuirass_stand',-4.6,G,-2.2,PI/2],
   ['painted_trade_weapon_rack',-2.6,G,-2.9,0],
   ['timpar_visor_war_helm',-.8,G,-2.4,-PI/2],
   ['timpar_attus_bale_bench',-4.5,G,1.2,PI/2],
   ['generic_crate',2.4,G,-2.4,0]
  ]);
  tkTarget(-2.6,G,.8,'ambush-guardhouse');
  tkTarget(2.8,G,1.4,'deadfall-killzone');
  popM();
 }});

/* 20. Clan Raid Mustering Ground & War-Drum Hall */
defBuilding({key:'tk_raid_mustering_ground',name:'Clan Raid Mustering Ground and War-Drum Hall',seed:35204,cut:true,
 w:18.4,d:15.2,h:9.6,budget:125000,
 tags:{types:['military','civic'],style:'plank',role:'barracks'},
 note:'clan war-band mustering longhouse and drill court with a 3.4 m carved hollow-log war drum, open-eyed beast visor posts and slat-armour racks',
 build(){
  const G=.4;
  pushM(TF(0,0,-.45));
  tkPlinth(16.4,12.4,G,{stepW:3.2,stepX:0});
  /* Rear warrior longhouse (-z = -2.6) */
  pushM(TF(0,0,-2.6));
  tkPlankBox(13.8,6.2,G,3.35,{
   mk:'cypress',socle:.42,postR:.26,
   holes:{
    s:[{x:0,y:0,w:1.85,h:2.26},{x:-4.2,y:1.0,w:1.05,h:.96},{x:4.2,y:1.0,w:1.05,h:.96}],
    e:[{x:0,y:1.0,w:1.0,h:.92}],w:[{x:0,y:1.0,w:1.0,h:.92}]
   }
  });
  tkDoor(0,G,3.1-.17,0,1.38,2.1,{inau:true,visor:true,crest:'wurup'});
  for(const sx of [-4.2,4.2])tkWindow(sx,G+1.0,3.1-.17,0,.86,.82,{lit:true});
  tkWindow(6.9-.17,G+1.0,0,PI/2,.82,.8,{lit:true});
  tkWindow(-6.9+.17,G+1.0,0,-PI/2,.82,.8,{lit:true});
  tkFormlineScreen(0,G+2.38,3.11,0,13.0,.82,{crest:'wurup'});
  tkPlankRoof(13.8,6.2,G+3.35,2.2,{mk:'cedar',cobbles:true,smokeShutter:true,kaenFinials:true});
  popM();
  /* West court: roofed 3.4 m carved hollow-log war-drum pavilion */
  svNoWalk(()=>{
   const dx=-4.8,dz=2.8;
   for(const sx of [-1.8,1.8])for(const sz of [-1.1,1.1])cyl('cypress',dx+sx,G,dz+sz,.14,2.45,hc(SVPAL.cypressD[0]),8);
   plane4('shingle',[dx-2.1,G+2.35,dz-1.35],[dx,G+3.05,dz-1.35],[dx-2.1,G+2.35,dz+1.35],.09,hc(SVPAL.shingle[0]));
   plane4('shingle',[dx,G+3.05,dz-1.35],[dx+2.1,G+2.35,dz-1.35],[dx,G+3.05,dz+1.35],.09,hc(SVPAL.shingle[0]));
   /* Suspended 3.2 m carved Wolf-prow hollow cedar signal/war drum */
   WX(dx,G+1.15,dz,0,0,PI/2,()=>cyl('totem',0,-1.55,0,.38,3.1,hc(SVPAL.totem[0]),12));
   for(const sx of [-1.2,1.2])pole('rope',[dx+sx,G+2.45,dz],[dx+sx,G+1.45,dz],.025,hc(SVPAL.rope[0]),6);
  });
  /* East court: war-totem & captured Eternian loot pike */
  tkTotemPole(5.2,G,2.8,-.3,7.2,.35,{crest:'wurup',figures:3,wings:true,wingSpan:1.4});
  tkLootHead(3.4,G+1.55,3.2,-.2,.48,{mk:'bronze',inverted:true,warPaint:true});
  tkFurnList([
   ['timpar_irori_kaen_hearth',0,G,-2.8,0],
   ['timpar_slat_cuirass_stand',-4.8,G,-4.4,0],
   ['timpar_slat_cuirass_stand',4.8,G,-4.4,0],
   ['timpar_visor_war_helm',-2.4,G,-4.6,0],
   ['timpar_eternian_trophy_rack',2.4,G,-4.6,0],
   ['painted_training_training_dummy',1.8,G,2.6,-.3],
   ['painted_common_weapon_rack',-5.6,G,-1.4,PI/2],
   ['timpar_bear_feast_trough',3.8,G,-1.4,-PI/2]
  ]);
  tkTarget(0,G,1.6,'mustering-drill-yard');
  tkTarget(0,G,-2.4,'warrior-longhouse');
  popM();
 }});

/* 21. Palisaded Captive Ransom Stockade */
defBuilding({key:'tk_ransom_stockade',name:'Lowland Captive Ransom Stockade',seed:35205,cut:true,
 w:16.8,d:15.2,h:8.4,budget:110000,
 tags:{types:['military','civic'],style:'plank',role:'prison',job:'customs'},
 note:'cedar log stockade and broker lodge holding captured lowland Eternian officials and merchants pending silver, bronze and steel ransom',
 build(){
  const G=.38,SW=14.4,SD=12.2,SH=3.2;
  pushM(TF(0,0,-.45));
  tkPlinth(SW+.8,SD+.8,G,{stepW:2.8,stepX:0});
  /* Outer log stockade enclosing compound, split on +z for gate */
  tkLogCribWall(-SW/2,-SD/2,SW/2,-SD/2,G,SH,{t:.42});
  tkLogCribWall(-SW/2,-SD/2,-SW/2,SD/2,G,SH,{t:.42});
  tkLogCribWall(SW/2,-SD/2,SW/2,SD/2,G,SH,{t:.42});
  tkLogCribWall(-SW/2,SD/2,-1.2,SD/2,G,SH,{t:.42});
  tkLogCribWall(1.2,SD/2,SW/2,SD/2,G,SH,{t:.42});
  svNoWalk(()=>box('cypress',0,G+2.24,SD/2,2.8,SH-2.24,.5,hc(SVPAL.cypress[0])));
  tkDoor(0,G,SD/2,0,1.92,2.16,{inau:false,visor:true,crest:'kuma'});
  tkLootHead(-2.2,G+2.5,SD/2+.36,0,.45,{mk:'stone',inverted:true,warPaint:true});
  tkLootHead(2.2,G+2.5,SD/2+.36,0,.45,{mk:'bronze',inverted:true,warPaint:true});
  /* Inner captive & guard lodge at rear (-z = -2.4) */
  pushM(TF(0,0,-2.4));
  tkPlankBox(10.6,5.8,G,3.05,{
   mk:'cedar',socle:.38,postR:.23,
   holes:{
    s:[{x:-2.4,y:0,w:1.58,h:2.12},{x:2.4,y:0,w:1.58,h:2.12}],
    e:[{x:0,y:1.15,w:.82,h:.72}],w:[{x:0,y:1.15,w:.82,h:.72}]
   }
  });
  /* Internal partition dividing broker guardroom (-x) from ransom quarters (+x) with unlocked connecting door */
  tkPlankWall(0,-2.6,0,2.6,G,3.05,{mk:'cypress',socle:.2,holes:[{at:2.6,y:0,w:1.42,h:2.05}]});
  tkDoor(-2.4,G,2.9-.17,0,1.18,1.98,{inau:true});
  tkDoor(2.4,G,2.9-.17,0,1.18,1.98,{inau:false});
  tkDoor(0,G,0,PI/2,1.06,1.94,{inau:false});
  tkWindow(5.3-.17,G+1.15,0,PI/2,.68,.62,{lit:true});
  tkWindow(-5.3+.17,G+1.15,0,-PI/2,.68,.62,{lit:true});
  tkPlankRoof(10.6,5.8,G+3.05,1.95,{mk:'shingle',cobbles:true,smokeShutter:true,kaenFinials:false});
  popM();
  tkWindBanner(-4.8,G,3.2,.2,1.4,2.05,{mk:'attus'});
  tkFurnList([
   ['timpar_irori_kaen_hearth',-2.6,G,-2.4,0],
   ['painted_common_desk',-3.8,G,-4.1,0],
   ['timpar_eternian_trophy_rack',-1.4,G,-4.3,0],
   ['timpar_slat_cuirass_stand',-4.2,G,-.8,PI/2],
   ['painted_trade_bunk',2.8,G,-4.0,0],
   ['timpar_attus_bale_bench',3.8,G,-1.4,-PI/2],
   ['generic_strongbox',-3.8,G,-2.9,0]
  ]);
  tkTarget(0,G,2.4,'stockade-yard');
  tkTarget(-2.4,G,-2.4,'ransom-broker-room');
  tkTarget(2.4,G,-2.4,'captive-quarters');
  popM();
 }});

/* 22. Four-Post Cedar Mist-Pass Lookout & Signal-Pyre Beacon Tower */
defBuilding({key:'tk_signal_pyre_tower',name:'Mist-Pass Lookout and Resin Signal-Pyre Tower',seed:35206,cut:true,
 w:12.6,d:13.4,h:11.6,budget:90000,
 tags:{types:['infrastructure','military'],style:'jomon',role:'watchtower'},
 note:'four-post adzed red-cypress spur watchtower with walkable upper lookout deck, hollow-log warning drum and spruce-resin signal pyre',
 build(){
  const G=.38,deckY=G+4.45;
  pushM(TF(0,0,-.45));
  tkPlinth(10.4,10.6,G,{stepW:2.4,stepX:0});
  /* Ground-level watchman's shelter under tower (-z half) */
  pushM(TF(0,0,-1.4));
  tkPlankBox(6.2,5.6,G,2.65,{
   mk:'bark',socle:.38,postR:.22,
   holes:{s:[{x:0,y:0,w:1.58,h:2.08}],e:[{x:0,y:.95,w:.88,h:.8}]}
  });
  tkDoor(0,G,2.8-.17,0,1.16,1.94,{inau:true});
  tkWindow(3.1-.17,G+.95,0,PI/2,.72,.68,{lit:true});
  popM();
  /* Four massive 8.6 m corner cedar tower legs + cross-bracing */
  svNoWalk(()=>{
   for(const sx of [-2.5,2.5])for(const sz of [-3.6,1.0]){
    cyl('totem',sx,G,sz,.26,8.4,hc(SVPAL.totem[0]),12);
   }
   /* Upper roof shelter over lookout deck */
   plane4('shingle',[-3.2,deckY+2.55,-4.1],[0,deckY+3.85,-4.1],[-3.2,deckY+2.55,1.5],.11,hc(SVPAL.shingle[0]));
   plane4('shingle',[0,deckY+3.85,-4.1],[3.2,deckY+2.55,-4.1],[0,deckY+3.85,1.5],.11,hc(SVPAL.shingle[0]));
   /* Lookout breastwork rails */
   for(const sx of [-2.65,2.65])box('cypress',sx,deckY,-1.3,.18,.98,4.9,hc(SVPAL.cypressD[0]));
   box('cypress',0,deckY,-3.75,5.4,.98,.18,hc(SVPAL.cypressD[0]));
  });
  /* Walkable stair climbing from forecourt (+z) up to lookout deck at deckY! */
  const SF=svStair(0,3.95,G,deckY,PI,{w:1.15,run:3.55,mk:'cypress',col:hc(SVPAL.cypress[0]),rail:'both'});
  svWell('cedar',0,deckY-.18,-1.3,5.5,.18,5.1,hc(SVPAL.cedar[0]),SF);
  /* Front stone-kerbed spruce-resin signal pyre basket at ground (+x = 3.4, +z = 2.6) */
  svNoWalk(()=>{
   box('megabreccia',3.4,G,2.6,1.95,.68,1.95,hc(SVPAL.megabreccia[0]));
   box('tarwood',3.4,G+.68,2.6,1.45,.42,1.45,hc(SVPAL.tarwood[0]));
   cone('glow',3.4,G+1.1,2.6,.52,.64,0xff7828,8);
  });
  haloAt(3.4,G+1.5,2.6,0xff8632,true);
  smokeAt(3.4,G+1.85,2.6,{r:.42,kind:'fire'});
  tkWarVisor(0,deckY+2.7,1.45,0,.5,{crest:'kapac'});
  tkWindBanner(-3.4,G,3.2,.2,1.35,2.05,{mk:'chilkat'});
  tkFurnList([
   ['timpar_irori_kaen_hearth',0,G,-1.4,0],
   ['timpar_attus_bale_bench',-1.9,G,-1.4,PI/2],
   ['timpar_slat_cuirass_stand',1.9,G,-2.6,-PI/2],
   ['timpar_dugout_paddle_rack',-1.8,deckY,-2.8,0],
   ['timpar_kanopi_alloy_lamp',1.8,deckY,-.6,0],
   ['generic_barrel',1.9,G,-.2,0]
  ]);
  tkTarget(0,G,2.4,'tower-forecourt');
  tkTarget(0,G,-1.4,'watchman-shelter');
  tkTarget(0,deckY,-1.4,'upper-lookout-deck');
  popM();
 }});
